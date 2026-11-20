import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { access, copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const windows = process.platform === "win32";
const exists = path => access(path).then(() => true, () => false);
const sdkCandidates = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, join(root, ".codex-tmp/android-sdk")].filter(Boolean);
let sdk;
for (const candidate of sdkCandidates) {
  if (await exists(join(candidate, "platforms/android-36/android.jar")) && await exists(join(candidate, "build-tools/35.0.0"))) {
    sdk = resolve(candidate);
    break;
  }
}
if (!sdk) throw new Error("Install Android SDK platform 36 and build-tools 35.0.0, then set ANDROID_HOME. See docs/MOBILE.md.");
const javaCandidates = [process.env.JAVA_HOME, windows && "C:/Program Files/Android/Android Studio/jbr"].filter(Boolean);
let javaHome;
for (const candidate of javaCandidates) {
  const release = await readFile(join(candidate, "release"), "utf8").catch(() => "");
  const major = Number(release.match(/JAVA_VERSION="(\d+)/)?.[1]);
  if (major >= 21 && major <= 24 && await exists(join(candidate, windows ? "bin/java.exe" : "bin/java"))) {
    javaHome = candidate;
    break;
  }
}
if (!javaHome) throw new Error("Set JAVA_HOME to JDK 21 (up to 24), for example the JBR included with Android Studio.");
const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: sdk,
  ANDROID_SDK_ROOT: sdk,
  ANDROID_USER_HOME: join(root, ".codex-tmp/android-user"),
  GRADLE_USER_HOME: join(root, ".codex-tmp/gradle"),
  JAVA_OPTS: "-Xms8m -Xmx64m -XX:+UseSerialGC",
};
await mkdir(env.ANDROID_USER_HOME, { recursive: true });
await mkdir(env.GRADLE_USER_HOME, { recursive: true });
await writeFile(join(root, "android/local.properties"), `sdk.dir=${sdk.replaceAll("\\", "/")}\n`);

function run(command, args, cwd = root) {
  return new Promise((done, fail) => {
    const child = spawn(command, args, { cwd, env, stdio: "inherit", windowsHide: true });
    child.on("error", fail);
    child.on("exit", code => code === 0 ? done() : fail(new Error(`${command} failed (${code}).`)));
  });
}
if (!process.argv.includes("--skip-web-build")) {
  if (!process.env.npm_execpath) throw new Error("Run this script with npm run mobile:apk.");
  await run(process.execPath, [process.env.npm_execpath, "run", "mobile:build"]);
}
if (!await exists(join(root, "dist-mobile/index.html"))) throw new Error("Run npm run mobile:build before skipping the web build.");
await run(process.execPath, [join(root, "node_modules/@capacitor/cli/bin/capacitor"), "sync", "android"]);
const jvm = "-Xms32m -Xmx512m -XX:+UseSerialGC -XX:MaxMetaspaceSize=256m -XX:ReservedCodeCacheSize=48m";
// Launch the project's wrapper directly, with literal arguments on every OS.
await run(join(javaHome, windows ? "bin/java.exe" : "bin/java"), [
  "-Xms8m", "-Xmx64m", "-XX:+UseSerialGC", "-classpath",
  join(root, "android/gradle/wrapper/gradle-wrapper.jar"),
  "org.gradle.wrapper.GradleWrapperMain", ":app:assembleDebug", "--no-daemon",
  "--max-workers=1", "--console=plain", "--build-cache", `-Dorg.gradle.jvmargs=${jvm}`,
  ...(process.argv.includes("--verbose") ? ["--info"] : []),
], join(root, "android"));
const output = join(root, "deliverables/mobile");
await mkdir(output, { recursive: true });
const apk = join(output, "NewGbonhi-android-test.apk");
await copyFile(join(root, "android/app/build/outputs/apk/debug/app-debug.apk"), apk);
const hash = createHash("sha256");
for await (const chunk of createReadStream(apk)) hash.update(chunk);
const sha256 = hash.digest("hex");
await writeFile(apk + ".sha256", `${sha256}  NewGbonhi-android-test.apk\n`);
await writeFile(join(output, "build-info.json"), JSON.stringify({
  appId: "com.newgbonhi.app", versionName: "1.0-test", versionCode: 1,
  platform: "android", signing: "debug", minSdk: 24, targetSdk: 36,
  api: "https://newgbonhi.com/api", builtAt: new Date().toISOString(),
  bytes: (await stat(apk)).size, sha256,
  deviceTesting: "pending", storePublication: "not submitted",
}, null, 2) + "\n");
console.log(`Test APK ready: ${apk}\nSHA-256: ${sha256}`);
