import fs from "node:fs";
import { extractProducts } from "../extract-products.js";

const args = process.argv.slice(2);
const inputPath = args[0];
const outputPath = args[1] || "src/data/products.json";
const multiplierArg = args.find((arg) => arg.startsWith("--multiplier="));
const multiplier = multiplierArg
  ? Number(multiplierArg.split("=")[1])
  : 1;

if (!inputPath) {
  console.error(
    "Usage: node scripts/build-products.js <input.html> [output.json] [--multiplier=1000]"
  );
  process.exit(1);
}

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

const guessCategory = (title = "") => {
  const upper = title.toUpperCase();
  if (upper.includes("PANT") || upper.includes("TROUSER")) {
    return "pants";
  }
  if (upper.includes("CROP")) {
    return "crop-tops";
  }
  return "t-shirts";
};

const html = fs.readFileSync(inputPath, "utf8");
const extracted = extractProducts(html);

const products = extracted.map((product, index) => ({
  id: index + 1,
  title: product.title || `Product ${index + 1}`,
  slug: slugify(product.title || `product-${index + 1}`),
  description: "",
  price:
    typeof product.price === "number"
      ? Math.round(product.price * multiplier)
      : null,
  soldOut: Boolean(product.soldOut),
  imagePrimary: product.imagePrimary || "",
  imageSecondary: product.imageSecondary || "",
  category: guessCategory(product.title),
  sizes: [],
  tags: [],
}));

fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
console.log(`Wrote ${products.length} products to ${outputPath}`);
