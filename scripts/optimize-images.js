import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const inputDir = "src/assets";
const outputDir = "src/assets/webp";
const quality = Number(process.env.WEBP_QUALITY || 82);
const manifestPath = path.join(outputDir, "manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

fs.mkdirSync(outputDir, { recursive: true });

const requestedFiles = process.argv.slice(2);
const files = requestedFiles.length ? requestedFiles : fs
  .readdirSync(inputDir)
  .filter((file) => /\.(png|jpe?g)$/i.test(file));

if (!files.length) {
  console.log("No images to optimize.");
  process.exit(0);
}

const optimize = async () => {
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(
      outputDir,
      file.replace(/\.(png|jpe?g)$/i, ".webp")
    );
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    await sharp(inputPath).webp({ quality }).toFile(outputPath);
    console.log(`Wrote ${outputPath}`);
    const { width, height } = await sharp(inputPath).metadata();
    manifest[file] = { width, height };
    const widths = file === "newgbonhi-logo.png" ? [128] : [400, 800];
    for (const targetWidth of widths.filter((size) => size < width)) {
      const responsivePath = outputPath.replace(/\.webp$/, `-${targetWidth}.webp`);
      await sharp(inputPath).resize({ width: targetWidth, withoutEnlargement: true }).webp({ quality }).toFile(responsivePath);
      console.log(`Wrote ${responsivePath}`);
    }
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
};

optimize().catch((error) => {
  console.error(error);
  process.exit(1);
});
