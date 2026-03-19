import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const inputDir = "src/assets";
const outputDir = "src/assets/webp";
const quality = Number(process.env.WEBP_QUALITY || 82);

fs.mkdirSync(outputDir, { recursive: true });

const files = fs
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
    await sharp(inputPath).webp({ quality }).toFile(outputPath);
    console.log(`Wrote ${outputPath}`);
  }
};

optimize().catch((error) => {
  console.error(error);
  process.exit(1);
});
