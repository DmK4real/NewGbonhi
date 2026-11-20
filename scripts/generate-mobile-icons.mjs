import sharp from "sharp";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

sharp.cache(false);
sharp.concurrency(1);

const ngIcon = await sharp("public/favicon.png").trim().png().toBuffer();
const wordmark = "src/assets/newgbonhi-logo.png";
async function logo(source, width, height, fraction = 0.8, transparent = false) {
  const size = Math.round(Math.min(width, height) * fraction);
  const mark = await sharp(source).resize(size, size, { fit: "inside" }).png().toBuffer();
  const canvas = sharp({ create: { width, height, channels: transparent ? 4 : 3,
    background: transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : "#000000" } })
    .composite([{ input: mark, gravity: "centre" }]);
  if (!transparent) canvas.flatten({ background: "#000000" }).removeAlpha();
  return canvas.png().toBuffer();
}
const res = "android/app/src/main/res";
for (const [density, icon, foreground] of [["mdpi", 48, 108], ["hdpi", 72, 162], ["xhdpi", 96, 216], ["xxhdpi", 144, 324], ["xxxhdpi", 192, 432]]) {
  const dir = join(res, `mipmap-${density}`);
  await mkdir(dir, { recursive: true });
  for (const name of ["ic_launcher.png", "ic_launcher_round.png"]) await writeFile(join(dir, name), await logo(ngIcon, icon, icon));
  await writeFile(join(dir, "ic_launcher_foreground.png"), await logo(ngIcon, foreground, foreground, 0.6, true));
}
for (const dir of await readdir(res, { withFileTypes: true })) {
  if (!dir.isDirectory() || !dir.name.startsWith("drawable")) continue;
  for (const name of await readdir(join(res, dir.name))) {
    if (name !== "splash.png") continue;
    const path = join(res, dir.name, name);
    const { width, height } = await sharp(path).metadata();
    await writeFile(path, await logo(wordmark, width, height, 0.5));
  }
}
const adaptive = `<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@android:color/black"/><foreground android:drawable="@mipmap/ic_launcher_foreground"/></adaptive-icon>\n`;
await mkdir(join(res, "mipmap-anydpi-v26"), { recursive: true });
for (const name of ["ic_launcher.xml", "ic_launcher_round.xml"]) await writeFile(join(res, "mipmap-anydpi-v26", name), adaptive);
const appIcon = await logo(ngIcon, 1024, 1024);
await writeFile("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", appIcon);
await mkdir("public/mobile", { recursive: true });
await writeFile("public/mobile/apple-touch-icon.png", await logo(ngIcon, 180, 180));
await mkdir("deliverables/mobile", { recursive: true });
await writeFile("deliverables/mobile/NewGbonhi-NG-icon-1024.png", appIcon);
await writeFile("deliverables/mobile/NewGbonhi-NG-icon-512.png", await logo(ngIcon, 512, 512));
const splashDir = "ios/App/App/Assets.xcassets/Splash.imageset";
for (const name of await readdir(splashDir)) {
  if (name.endsWith(".png")) await writeFile(join(splashDir, name), await logo(wordmark, 2732, 2732, 0.3));
}
console.log("NG app icons generated for Android, iOS and the mobile web preview. NewGbonhi launch images regenerated.");
