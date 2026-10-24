// Development-only WebGL export. The same print shader powers the showroom.
import * as THREE from 'three';
import definitions from '../src/data/catalogMockups.json';
import { applyOriginalPrint } from '../src/components/garmentPrint.js';
import { prepareGarmentPixels } from '../src/components/garmentTexture.js';

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setSize(960, 1280);
renderer.setClearColor(0, 0);
document.body.append(renderer.domElement);
const camera = new THREE.OrthographicCamera(-.75, .75, 1, -1, .1, 10);
camera.position.z = 2;

async function texture(path, crop, matte) {
  const img = await new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = reject;
    image.src = `/src/assets/${path}`;
  });
  const canvas = document.createElement('canvas');
  let bounds = crop;
  if (!bounds) {
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, img.width, img.height);
    let l = img.width, r = 0, t = img.height, b = 0;
    for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
      if (data[(y * img.width + x) * 4 + 3] > 80) { l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); }
    }
    bounds = [l, t, r - l + 1, b - t + 1];
  }
  canvas.width = bounds[2]; canvas.height = bounds[3];
  const ctx = canvas.getContext('2d'); ctx.drawImage(img, ...bounds, 0, 0, canvas.width, canvas.height);
  if (matte) {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pixels.data.set(prepareGarmentPixels(pixels.data, canvas.width, canvas.height));
    ctx.putImageData(pixels, 0, 0);
  }
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
  return { map, aspect: canvas.width / canvas.height };
}

window.catalogViews = Object.values(definitions).flatMap(item => [item.primary, item.secondary].filter(Boolean));
window.renderCatalogView = async id => {
  const view = window.catalogViews.find(item => item.id === id);
  if (!view) throw new Error(`Unknown catalog view: ${id}`);
  const [fabric, original] = await Promise.all([
    texture(`showroom/${view.fabric}.webp`, null, true), texture(view.source, view.crop, false),
  ]);
  // Consistent shoulder width; cropped garments keep their naturally short body.
  const width = 1.32, height = width / fabric.aspect;
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({ map: fabric.map, transparent: true, toneMapped: false });
  // Archive mockups are tall and narrow. Preserve the physical proportions of
  // their original ink instead of stretching it to the oversized cotton UVs.
  const printSizing = view.printSizing;
  applyOriginalPrint(material, original.map, {
    ...view,
    printScale: printSizing ? [printSizing.scale * original.aspect / fabric.aspect, printSizing.scale] : [1, 1],
    printCenter: printSizing?.center,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = .70 - height / 2;
  const scene = new THREE.Scene(); scene.add(mesh);
  renderer.render(scene, camera);
  const data = renderer.domElement.toDataURL('image/png');
  geometry.dispose(); material.dispose(); fabric.map.dispose(); original.map.dispose();
  return data;
};
