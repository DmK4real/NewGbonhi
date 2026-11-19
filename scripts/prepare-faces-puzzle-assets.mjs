// Usage: node scripts/prepare-faces-puzzle-assets.mjs <Leila.png> <Laury.png> <Isis.png>
// Inputs are full portraits. Keep them outside public/; only the worker imports the output.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const files = process.argv.slice(2);
if (files.length !== 3) throw new Error('Provide the Leila, Laury and Isis source portraits, in that order.');
const portraits = [ ['leila',70], ['laury',270], ['isis',170] ];
const assets = [];
for (const [person, [portrait, preferredTop]] of portraits.entries()) {
  const source = path.resolve(files[person]);
  const { width, height } = await sharp(source).metadata();
  const side = Math.min(width, height);
  const top = Math.max(0, Math.min(preferredTop, height-side));
  const square = await sharp(source).extract({left:Math.floor((width-side)/2),top,width:side,height:side}).resize(720,720).png().toBuffer();
  for (let index=0;index<9;index++) {
    const data = await sharp(square).extract({left:(index%3)*240,top:Math.floor(index/3)*240,width:240,height:240}).webp({quality:85}).toBuffer();
    assets.push({portrait,index,data:data.toString('base64')});
  }
}
await fs.writeFile('api/worker/faces-assets.js',`// Server-only image slices. Never import this module from the frontend.\nexport const FACES_ASSETS = ${JSON.stringify(assets)};\n`);
console.log('Prepared 27 server-only puzzle slices.');
