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
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="#101010"/>
<g font-family="Arial, sans-serif" fill="#f5f5f1">
<text x="50" y="63" font-size="20" letter-spacing="3">NEWGBONHI / NOUVELLE COLLECTION</text>
<text x="42" y="250" font-size="150" font-weight="900" letter-spacing="-12">FACES<tspan fill="#e10600">.</tspan></text>
<text x="50" y="327" font-size="30">Un détail aujourd'hui.</text>
<text x="50" y="372" font-size="30">Faces le 19 décembre.</text>
<rect x="50" y="458" width="550" height="2" fill="#444"/>
<text x="50" y="510" font-size="29" font-weight="700">19.12.2026 / 18:00 ABIDJAN</text>
<text x="50" y="556" font-size="22" fill="#aaa">newgbonhi.com/faces</text>
<rect x="680" y="80" width="150" height="150" fill="#e10600"/>
<text x="705" y="144" font-size="48" font-weight="700">19</text><text x="705" y="204" font-size="48" font-weight="700">12</text>
<rect x="838" y="80" width="150" height="150" fill="#242424"/>
<rect x="996" y="80" width="150" height="150" fill="#242424"/>
<rect x="996" y="238" width="150" height="150" fill="#242424"/>
<rect x="680" y="396" width="150" height="150" fill="#242424"/>
<rect x="996" y="396" width="150" height="150" fill="#e10600"/>
<text x="1008" y="480" font-size="42" font-weight="700">18:00</text>
</g></svg>`;
const overlays = [];
for (const [name, left, top] of [["eye-left", 680, 238], ["eye-center", 838, 238], ["lips", 838, 396]]) {
  overlays.push({ input: await sharp(path.join(destination, `${name}.webp`)).resize(150, 150).toBuffer(), left, top });
}
await sharp(Buffer.from(svg)).composite(overlays).jpeg({ quality: 88 }).toFile(path.join(destination, "social-share.jpg"));
console.log("Prepared Faces portrait fragments and social cover.");
