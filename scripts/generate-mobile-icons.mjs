import sharp from "sharp";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const source = "src/assets/newgbonhi-logo.png";
async function logo(width, height, fraction = 0.72) {
  const size = Math.round(Math.min(width, height) * fraction);
  const mark = await sharp(source).resize(size, size, { fit: "contain", background: "#000000" }).png().toBuffer();
  return sharp({ create: { width, height, channels: 3, background: "#000000" } })
    .composite([{ input: mark, gravity: "centre" }]).png().toBuffer();
}
const res = "android/app/src/main/res";
for (const [density, icon, foreground] of [["mdpi", 48, 108], ["hdpi", 72, 162], ["xhdpi", 96, 216], ["xxhdpi", 144, 324], ["xxxhdpi", 192, 432]]) {
  const dir = join(res, `mipmap-${density}`);
  await mkdir(dir, { recursive: true });
  for (const name of ["ic_launcher.png", "ic_launcher_round.png"]) await writeFile(join(dir, name), await logo(icon, icon));
  await writeFile(join(dir, "ic_launcher_foreground.png"), await logo(foreground, foreground, 0.6));
}
for (const dir of await readdir(res, { withFileTypes: true })) {
  if (!dir.isDirectory() || !dir.name.startsWith("drawable")) continue;
  for (const name of await readdir(join(res, dir.name))) {
    if (name !== "splash.png") continue;
    const path = join(res, dir.name, name);
    const { width, height } = await sharp(path).metadata();
    await writeFile(path, await logo(width, height, 0.5));
  }
}
const adaptive = `<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@android:color/black"/><foreground android:drawable="@mipmap/ic_launcher_foreground"/></adaptive-icon>\n`;
await mkdir(join(res, "mipmap-anydpi-v26"), { recursive: true });
for (const name of ["ic_launcher.xml", "ic_launcher_round.xml"]) await writeFile(join(res, "mipmap-anydpi-v26", name), adaptive);
await writeFile("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", await logo(1024, 1024, 0.85));
const splashDir = "ios/App/App/Assets.xcassets/Splash.imageset";
for (const name of await readdir(splashDir)) {
  if (name.endsWith(".png")) await writeFile(join(splashDir, name), await logo(2732, 2732, 0.3));
}
console.log("NewGbonhi icons and launch images generated for Android and iOS.");
