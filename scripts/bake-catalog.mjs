// Run Vite and a headless browser with CDP on port 9333, then run this script.
import fs from 'node:fs/promises';
import sharp from 'sharp';

const tabs = await (await fetch('http://127.0.0.1:9333/json')).json();
const tab = tabs.find(item => item.type === 'page');
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => socket.onopen = resolve);
let nextId = 0;
const pending = new Map();
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, message => message.error ? reject(message.error) : resolve(message.result));
  socket.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
try {
  await send('Page.navigate', { url: 'http://127.0.0.1:4000/scripts/catalog-renderer.html' });
  let views;
  for (let attempt = 0; attempt < 30; attempt++) {
    views = await evaluate('window.catalogViews');
    if (views) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!views) throw new Error('Catalog renderer did not start');
  const requested = new Set(process.argv.slice(2));
  if (requested.size) views = views.filter(view => requested.has(view.id));
  if (!views.length) throw new Error('No matching catalog views');
  await fs.mkdir('src/assets/catalog', { recursive: true });
  for (const view of views) {
    const data = await evaluate(`window.renderCatalogView(${JSON.stringify(view.id)})`);
    const buffer = Buffer.from(data.split(',')[1], 'base64');
    await Promise.all([400, 800, 960].map(width => sharp(buffer).resize({ width }).webp({ quality: 92, alphaQuality: 100 }).toFile(`src/assets/catalog/${view.id}${width === 960 ? '' : `-${width}`}.webp`)));
    console.log(`Exported ${view.id}`);
  }
  console.log(`${views.length} catalog views, 3 sizes each`);
} finally { socket.close(); }
