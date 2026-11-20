import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createReadStream } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, realpath, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

if (process.platform !== "darwin") throw new Error("Package the iPhone build on the macOS runner, not on Windows.");
const run = promisify(execFile);
const root = await realpath(fileURLToPath(new URL("../", import.meta.url)));
const inside = path => path.startsWith(root + sep);
const app = await realpath(resolve(root, process.argv[2] || "ios/device-build/Build/Products/Release-iphoneos/App.app"));
if (!inside(app) || !app.endsWith(".app") || !(await stat(app)).isDirectory()) throw new Error("Expected an app bundle inside the project.");
const { stdout } = await run("/usr/bin/plutil", ["-convert", "json", "-o", "-", join(app, "Info.plist")]);
const info = JSON.parse(stdout);
if (!info.CFBundleSupportedPlatforms?.includes("iPhoneOS") || info.DTPlatformName === "iphonesimulator") {
  throw new Error("A simulator app cannot be packaged for installation on an iPhone.");
}
if (info.CFBundleIdentifier !== "com.newgbonhi.app") throw new Error("Unexpected iPhone application identifier.");
const executable = await realpath(join(app, info.CFBundleExecutable));
if (!executable.startsWith(app + sep)) throw new Error("Unexpected app executable path.");
await run("xcrun", ["lipo", "-verify_arch", "arm64", executable]);
const native = JSON.parse(await readFile(join(app, "capacitor.config.json"), "utf8"));
if (native.appId !== "com.newgbonhi.app" || native.server?.url) throw new Error("Unexpected native app configuration.");
await stat(join(app, "public/index.html"));

const output = join(root, "deliverables/mobile/NewGbonhi-iOS-unsigned.ipa");
const temp = output + "." + randomUUID() + ".tmp";
const build = join(root, "ios/build");
await mkdir(build, { recursive: true });
await mkdir(dirname(output), { recursive: true });
const buildRoot = await realpath(build);
if (!inside(buildRoot) || !inside(await realpath(dirname(output)))) throw new Error("Packaging paths must remain inside the project.");
const stage = await mkdtemp(join(buildRoot, "ipa-stage-"));
try {
  const payload = join(stage, "Payload");
  await mkdir(payload);
  await cp(app, join(payload, "NewGbonhi.app"), { recursive: true });
  await run("/usr/bin/ditto", ["-c", "-k", "--keepParent", payload, temp]);
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(temp)) hash.update(chunk);
  const sha256 = hash.digest("hex");
  await rename(temp, output);
  await writeFile(output + ".sha256", `${sha256}  NewGbonhi-iOS-unsigned.ipa\n`);
  await writeFile(join(dirname(output), "iphone-build-info.json"), JSON.stringify({
    appId: info.CFBundleIdentifier, version: info.CFBundleShortVersionString,
    platform: "iphoneos", architecture: "arm64", minimumOSVersion: info.MinimumOSVersion,
    signing: "unsigned; personal signing is required before installation",
    deviceTesting: "pending", storePublication: "not submitted",
    sourceCommit: process.env.GITHUB_SHA || null, builtAt: new Date().toISOString(),
    bytes: (await stat(output)).size, sha256,
  }, null, 2) + "\n");
  console.log(`Unsigned iPhone package ready: ${output}\nPersonal signing is required before installation.`);
} finally {
  // Only the unique staging directory created above is removed.
  const stagedPath = await realpath(stage);
  if (!stagedPath.startsWith(buildRoot + sep)) throw new Error("Unexpected staging directory.");
  await rm(stagedPath, { recursive: true, force: true });
  await unlink(temp).catch(error => { if (error.code !== "ENOENT") throw error; });
}
