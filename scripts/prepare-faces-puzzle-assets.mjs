// Usage: node scripts/prepare-faces-puzzle-assets.mjs <Ada.jpg> <Laury.png> <Isis.png>
// Inputs are full portraits. Keep them outside public/; only the worker imports the output.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// One continuous close-up per face: forehead above, eyes/nose in the middle,
// mouth below. The first slot uses Ada's supplied portrait with curly hair.
// Keep the legacy slot key "leila" stable for existing game boards and app versions.
const portraits = [
  { id: 'leila', width: 720, height: 1280, left: 10, top: 220, side: 660 },
  { id: 'laury', width: 1086, height: 1448, left: 220, top: 400, side: 630 },
  { id: 'isis', width: 1087, height: 1447, left: 140, top: 390, side: 820 },
];

export function portraitCrop(portrait, width, height) {
  const frame = portraits.find(item => item.id === portrait);
  if (!frame || !Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error('Expected a known Faces portrait with valid image dimensions.');
  }
  const scale = width / frame.width;
  if (Math.abs(height / frame.height / scale - 1) > 0.01) {
    throw new Error(`Unexpected source proportions for ${portrait}; use the original portrait.`);
  }
  const side = Math.floor(Math.round(frame.side * scale) / 3) * 3;
  const crop = { left: Math.round(frame.left * scale), top: Math.round(frame.top * scale), width: side, height: side };
  if (side < 3 || crop.left < 0 || crop.top < 0 || crop.left + side > width || crop.top + side > height) {
    throw new Error(`The ${portrait} crop must fit inside its source image.`);
  }
  return crop;
}

export async function createPortraitTiles(portrait, source) {
  const oriented = await sharp(source).autoOrient().png().toBuffer({ resolveWithObject: true });
  const crop = portraitCrop(portrait, oriented.info.width, oriented.info.height);
  const side = crop.width / 3;
  const tiles = [];
  for (let index = 0; index < 9; index++) {
    const data = await sharp(oriented.data).extract({ left: crop.left + (index % 3) * side, top: crop.top + Math.floor(index / 3) * side, width: side, height: side }).webp({ lossless: true }).toBuffer();
    tiles.push({ portrait, index, data: data.toString('base64') });
  }
  return tiles;
}

export async function prepareFacesPuzzleAssets(files) {
  if (files.length !== 3) throw new Error('Provide the Ada, Laury and Isis source portraits, in that order.');
  const assets = [];
  for (const [index, portrait] of portraits.entries()) assets.push(...await createPortraitTiles(portrait.id, path.resolve(files[index])));
  // New URLs prevent already released pieces from mixing the old and new crops in a browser cache.
  const revision = createHash('sha256').update(JSON.stringify(assets)).digest('hex').slice(0, 12);
  await fs.writeFile('api/worker/faces-assets.js', `// Server-only image slices. Never import this module from the frontend.\nexport const FACES_ASSETS_REVISION = ${JSON.stringify(revision)};\nexport const FACES_ASSETS = ${JSON.stringify(assets)};\n`);
  console.log(`Prepared 27 server-only puzzle slices (${revision}).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareFacesPuzzleAssets(process.argv.slice(2));
}
