import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = process.argv[2];
if (!source) throw new Error("Provide the existing Faces portrait fragments directory.");
const destination = path.resolve("public/faces");
await fs.mkdir(destination, { recursive: true });
const sources = {
  "eye-left": "04-MILIEU-GAUCHE.png",
  "eye-center": "05-MILIEU-CENTRE.png",
  lips: "08-BAS-CENTRE.png",
};
for (const [name, filename] of Object.entries(sources)) {
  await sharp(path.join(source, filename)).resize(420, 420).webp({ quality: 85 }).toFile(path.join(destination, `${name}.webp`));
}
// Reuse the official logo byte-for-byte for link previews.
await fs.copyFile(path.resolve("public/email-logo.png"), path.join(destination, "newgbonhi-logo.png"));
console.log("Prepared Faces fragments and official logo preview.");
