/* eslint-disable no-console */
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function extractProducts(html) {
  const products = [];
  const tagRe = /<\/?div\b[^>]*>/gi;
  let start = html.indexOf('<div class="product');

  while (start !== -1) {
    tagRe.lastIndex = start;
    let depth = 0;
    let end = -1;
    let match;

    while ((match = tagRe.exec(html))) {
      const tag = match[0];
      if (tag.startsWith("</")) {
        depth -= 1;
      } else {
        depth += 1;
      }
      if (depth === 0) {
        end = tagRe.lastIndex;
        break;
      }
    }

    if (end === -1) {
      break;
    }

    const block = html.slice(start, end);
    const product = parseProduct(block);
    if (product) {
      products.push(product);
    }

    start = html.indexOf('<div class="product', end);
  }

  return products;
}

function parseProduct(block) {
  const url =
    matchAttr(
      block,
      /<a[^>]*class="[^"]*product__image-wrapper[^"]*"[^>]*href="([^"]+)"/i
    ) ||
    matchAttr(block, /<div class="product__title[^"]*">[\s\S]*?<a[^>]*href="([^"]+)"/i) ||
    "";

  const title =
    matchAttr(
      block,
      /<a[^>]*class="[^"]*product__image-wrapper[^"]*"[^>]*title="([^"]+)"/i
    ) ||
    matchText(block, /<div class="product__title[^"]*">[\s\S]*?<a[^>]*>([^<]+)<\/a>/i) ||
    "Untitled product";

  const imagePrimary = extractImage(block, "primary-image");
  const imageSecondary = extractImage(block, "secondary-image");

  const priceMatch = block.match(/£\s*([0-9]+(?:\.[0-9]{2})?)/);
  const price = priceMatch ? Number(priceMatch[1]) : null;
  const soldOut = /sold-out-text|Sold Out/i.test(block);

  return {
    title: decodeHtml(title.trim()),
    url: decodeHtml(url.trim()),
    price,
    soldOut,
    imagePrimary: decodeHtml(imagePrimary),
    imageSecondary: decodeHtml(imageSecondary),
  };
}

function extractImage(block, className) {
  const imgTagMatch = block.match(
    new RegExp(
      `<img[^>]*class="[^"]*${className}[^"]*"[^>]*>`,
      "i"
    )
  );
  if (!imgTagMatch) return "";
  const imgTag = imgTagMatch[0];
  return (
    matchAttr(imgTag, /data-src="([^"]+)"/i) ||
    matchAttr(imgTag, /src="([^"]+)"/i) ||
    ""
  );
}

function matchAttr(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : "";
}

function matchText(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : "";
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3] || "products.json";

  if (!inputPath) {
    console.error("Usage: node extract-products.js <input.html> [output.json]");
    process.exit(1);
  }

  const html = fs.readFileSync(inputPath, "utf8");
  const products = extractProducts(html);
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
  console.log(`Wrote ${products.length} products to ${outputPath}`);
}

const isMain = process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main();
}

