import { applyOriginalPrint } from './garmentPrint.js';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { arrangeGarments, findShoulder } from './showroomLayout.js';
import { prepareGarmentPixels } from './garmentTexture.js';
import { addShowroomFloor } from './showroomFloor.js';

const centralArtworksUrl = new URL('../assets/showroom/ng-central-artworks.webp', import.meta.url).href;
const leftArtworkUrl = new URL('../assets/showroom/ng-cfa-portrait.webp', import.meta.url).href;
const premiumDeckUrl = new URL('../assets/showroom/ng-skate-premium.webp', import.meta.url).href;
const skateAtlasUrl = new URL('../assets/showroom/ng-skate-decks.webp', import.meta.url).href;
const crewMuralUrl = new URL('../assets/showroom/ng-crew-wall-minimal.webp', import.meta.url).href;

// The shop stays usable through its HTML controls if WebGL is unavailable.
export async function createShowroomScene(host, { pieces, onSelect, onHover, onReady, onNavigate }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#514c48');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .9;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const env = pmrem.fromScene(environment, .04);
  scene.environment = env.texture;
  scene.environmentIntensity = .3;
  environment.dispose();
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(39, 1, .1, 60);
  const destination = new THREE.Vector3(0, 2.55, 7.8);
  const aim = new THREE.Vector3(0, 2.55, -1.6);
  const currentAim = aim.clone();
  camera.position.copy(destination);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false;
  let active = true;
  let selectedKey = null;
  let skateView = false;
  let artworkView = false;
  let overview = true;
  let inspectionAngle = 0;
  let inspectionZoom = 0;
  let visiblePieces = pieces;
  let pan = 0;
  let mobile = false;
  let hoverKey = null;
  let frame;
  let floorProps;
  let motion = 1;
  let lastFrame = 0;
  const groups = new Map();
  const pickables = [];
  const roomWidth = Math.max(19, pieces.length * 3.1 + 3);
  const railHalfWidth = roomWidth / 2 - 1;
  let panLimit = 0;
  const textures = [];
  const disposableMaterials = [];
  const chrome = new THREE.MeshStandardMaterial({ color: '#b2b3b0', metalness: .96, roughness: .23 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: '#343630', metalness: .8, roughness: .3 });

  function plaster(color, strength = 9) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color; ctx.fillRect(0, 0, 256, 256);
    const data = ctx.getImageData(0, 0, 256, 256);
    let seed = 83;
    for (let i = 0; i < data.data.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const noise = ((seed / 4294967296) - .5) * strength;
      for (let c = 0; c < 3; c++) data.data[i + c] += noise;
    }
    ctx.putImageData(data, 0, 0);
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(5, 3);
    map.colorSpace = THREE.SRGBColorSpace; textures.push(map);
    return new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: .018, roughness: .96 });
  }
  const wallMaterial = plaster('#817b72', 7);
  const floorMaterial = plaster('#474440', 10);
  floorMaterial.roughness = .68;
  const woodMaterial = (() => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 512;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#332b26'; ctx.fillRect(0, 0, 256, 512);
    for (let x = 0; x < 256; x++) {
      ctx.strokeStyle = `rgba(0,0,0,${.03 + .065 * Math.abs(Math.sin(x * 13.37))})`;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 3, 130, x - 4, 360, x, 512); ctx.stroke();
    }
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; textures.push(map);
    return new THREE.MeshStandardMaterial({ map, roughness: .55, color: '#d5c4ad' });
  })();
  function box(w, h, d, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh); return mesh;
  }
  function rod(a, b, radius, material, parent = scene) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 16), material);
    mesh.position.copy(start).add(end).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
    mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }

  // One architectural space. The garments, rail and shadows share the same coordinates.
  const backWall = box(roomWidth, 7, .22, wallMaterial, 0, 3.5, -3.05);
  const leftWall = box(.2, 7, 13, wallMaterial, -roomWidth / 2, 3.5, 2.9);
  const rightWall = box(.2, 7, 13, wallMaterial, roomWidth / 2, 3.5, 2.9);
  leftWall.castShadow = leftWall.receiveShadow = rightWall.castShadow = rightWall.receiveShadow = false;
  box(roomWidth, .16, 15, floorMaterial, 0, -.1, 2.9);
  const ceiling = box(roomWidth, .14, 13, wallMaterial, 0, 6.8, 2.9);
  ceiling.castShadow = ceiling.receiveShadow = false;
  const skirting = new THREE.MeshStandardMaterial({ color: '#34373c', roughness: .7 });
  box(roomWidth, .11, .035, skirting, 0, .055, -2.91);
  const seam = new THREE.MeshStandardMaterial({ color: '#3c4046', roughness: 1 });
  for (let x = -roomWidth / 2; x <= roomWidth / 2; x += 2.4) box(.008, .002, 14, seam, x, -.016, 3);
  for (let z = -2.5; z < 10; z += 2.4) box(roomWidth, .002, .008, seam, 0, -.015, z);

  scene.add(new THREE.HemisphereLight('#fff6e8', '#77716b', .95));
  const windowLight = new THREE.DirectionalLight('#fffaf2', 1.8);
  windowLight.position.set(-3.5, 6.4, 4); windowLight.castShadow = true;
  windowLight.target.position.set(0, 2.4, -2.2);
  scene.add(windowLight.target);
  windowLight.shadow.mapSize.set(2048, 2048);
  Object.assign(windowLight.shadow.camera, { left: -roomWidth / 2, right: roomWidth / 2, top: 7, bottom: -3, near: .1, far: 32 });
  windowLight.shadow.bias = -.0003; windowLight.shadow.normalBias = .015;
  windowLight.shadow.radius = 4;
  windowLight.shadow.blurSamples = 8;
  scene.add(windowLight);
  for (const x of [-6, -3, 0, 3, 6]) {
    const spot = new THREE.SpotLight('#fff8ed', 20, 12, .62, .75, 1.5);
    spot.position.set(x, 6.45, .6); spot.target.position.set(x, 1.8, -2.8);
    scene.add(spot, spot.target);
    const fixture = box(.26, .08, .26, darkMetal, x, 6.65, .6);
    fixture.castShadow = fixture.receiveShadow = false;
  }

  // Wall mounted chrome rail, with real depth and separate wall brackets.
  rod([-railHalfWidth, 3.5, -2.25], [railHalfWidth, 3.5, -2.25], .033, chrome);
  for (const x of [-railHalfWidth, 0, railHalfWidth]) {
    rod([x, 3.5, -2.94], [x, 3.5, -2.25], .027, chrome);
    box(.14, .16, .04, chrome, x, 3.5, -2.9);
  }

  // Black lacquered furniture keeps the architectural palette neutral.
  box(2, .12, .64, woodMaterial, -railHalfWidth + .5, .48, -.7);
  for (const x of [-railHalfWidth - .3, -railHalfWidth + 1.3]) box(.12, .44, .54, woodMaterial, x, .22, -.7);

  const redLacquer = new THREE.MeshStandardMaterial({ color: '#c71c26', roughness: .48, metalness: .15 });
  const accent = box(roomWidth - .8, .035, .018, redLacquer, 0, .23, -2.92);
  accent.castShadow = accent.receiveShadow = false;

  async function loadDecorTexture(url) {
    const map = await new THREE.TextureLoader().loadAsync(url);
    if (disposed) { map.dispose(); throw new Error('Showroom disposed'); }
    textures.push(map);
    motion = 1;
    return map;
  }

  async function loadDecorations() {
  // Smaller peripheral artworks leave the garments as the main visual focus.
  try {
    const atlas = await loadDecorTexture(centralArtworksUrl);
    atlas.colorSpace = THREE.SRGBColorSpace; textures.push(atlas);
    const height = 1.6, width = height * (atlas.image.width / 2) / atlas.image.height;
    const frameMaterial = new THREE.MeshStandardMaterial({ color: '#191817', roughness: .55, metalness: .12 });
    for (let index = 0; index < 2; index++) {
      const x = index === 0 ? -6.7 : 6.7;
      const backing = box(width + .10, height + .10, .065, frameMaterial, x, 4.95, -2.87);
      backing.castShadow = true;
      const map = atlas.clone(); map.repeat.set(.5, 1); map.offset.set(index * .5, 0);
      map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); map.needsUpdate = true; textures.push(map);
      const art = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map, roughness: .95, metalness: 0 }));
      art.position.set(x, 4.95, -2.835); art.receiveShadow = true; scene.add(art);
    }
  } catch (error) {
    if (!disposed) console.warn('Showroom central artworks unavailable', error);
  }

  // A matte painted surface receives the same light and garment shadows as the wall.
  // Failure of this decorative asset must not block the shop.
  try {
    const muralMap = await loadDecorTexture(crewMuralUrl);
    muralMap.colorSpace = THREE.SRGBColorSpace;
    muralMap.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    textures.push(muralMap);
    // Cover the actual wall face, preserving the artwork proportions.
    const imageAspect = muralMap.image.width / muralMap.image.height;
    const wallAspect = roomWidth / 7;
    if (imageAspect > wallAspect) {
      muralMap.repeat.x = wallAspect / imageAspect;
      muralMap.offset.x = (1 - muralMap.repeat.x) / 2;
    } else {
      muralMap.repeat.y = imageAspect / wallAspect;
      muralMap.offset.y = (1 - muralMap.repeat.y) / 2;
    }
    const paintedWall = new THREE.MeshStandardMaterial({
      map: muralMap, bumpMap: wallMaterial.bumpMap, bumpScale: .018,
      roughness: .98, metalness: 0, envMapIntensity: .1,
    });
    // BoxGeometry front (+Z) is the wall surface facing the clothes and camera.
    backWall.material = [wallMaterial, wallMaterial, wallMaterial, wallMaterial, paintedWall, wallMaterial];
  } catch (error) {
    if (!disposed) console.warn('Showroom mural unavailable', error);
  }

  // Three shaped maple decks mounted on the inside face of the right wall.
  try {
    const [atlas, premium] = await Promise.all([
      loadDecorTexture(skateAtlasUrl), loadDecorTexture(premiumDeckUrl),
    ]);
    atlas.colorSpace = premium.colorSpace = THREE.SRGBColorSpace;
    textures.push(atlas, premium);
    floorProps = await addShowroomFloor(scene, { roomWidth, deckMap: premium, textures, isDisposed: () => disposed });
    if (disposed) return;
    const maple = new THREE.MeshStandardMaterial({ color: '#aa8051', roughness: .75 });
    const mountMaterial = new THREE.MeshStandardMaterial({ color: '#272727', metalness: .7, roughness: .4 });
    const width = .64, height = 2.45, radius = width / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-radius, -height / 2 + radius);
    shape.lineTo(-radius, height / 2 - radius);
    shape.absarc(0, height / 2 - radius, radius, Math.PI, 0, true);
    shape.lineTo(radius, -height / 2 + radius);
    shape.absarc(0, -height / 2 + radius, radius, 0, -Math.PI, true);
    shape.closePath();
    for (let index = 0; index < 3; index++) {
      const deck = new THREE.Group();
      deck.position.set(roomWidth / 2 - .22, 2.75, -1.2 + index * 1.02);
      deck.rotation.y = -Math.PI / 2;
      const texture = (index === 2 ? premium : atlas).clone();
      if (index !== 2) { texture.repeat.set(1 / 3, 1); texture.offset.set(index / 3, 0); }
      texture.needsUpdate = true;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); textures.push(texture);
      const face = new THREE.MeshStandardMaterial({ map: texture, roughness: .8, metalness: 0 });
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: .025, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .009, bevelThickness: .007, curveSegments: 24 });
      const positions = geometry.attributes.position;
      const uv = geometry.attributes.uv;
      for (let vertex = 0; vertex < positions.count; vertex++) {
        const x = positions.getX(vertex), y = positions.getY(vertex);
        uv.setXY(vertex, (x + radius) / width, (y + height / 2) / height);
        // Nose and tail curl away from the wall, like an actual deck.
        const kick = Math.max(0, (Math.abs(y) - height * .32) / (height * .18));
        positions.setZ(vertex, positions.getZ(vertex) + .085 * kick * kick);
      }
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, [face, maple]); mesh.castShadow = mesh.receiveShadow = true; deck.add(mesh);
      for (const y of [-.72, .72]) {
        const mount = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .10, 12), mountMaterial);
        mount.rotation.x = Math.PI / 2; mount.position.set(0, y, -.045); mount.castShadow = true; deck.add(mount);
        for (const dx of [-.075, .075]) for (const dy of [-.045, .045]) {
          const screw = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), mountMaterial);
          screw.position.set(dx, y + dy, .035); deck.add(screw);
        }
      }
      scene.add(deck);
    }
  } catch (error) {
    if (!disposed) console.warn('Showroom skate decks unavailable', error);
  }

  // Framed portrait on the inside of the left wall.
  try {
    const map = await loadDecorTexture(leftArtworkUrl);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); textures.push(map);
    const height = 2.65, width = height * map.image.width / map.image.height;
    const frame = new THREE.Group();
    frame.position.set(-roomWidth / 2 + .19, 2.8, -.05);
    frame.rotation.y = Math.PI / 2;
    const frameMaterial = new THREE.MeshStandardMaterial({ color: '#191817', roughness: .5, metalness: .15 });
    const backing = new THREE.Mesh(new THREE.BoxGeometry(width + .13, height + .13, .075), frameMaterial);
    backing.castShadow = true; backing.receiveShadow = true; frame.add(backing);
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map, roughness: .95, metalness: 0 }));
    paper.position.z = .039; paper.receiveShadow = true; frame.add(paper);
    scene.add(frame);
  } catch (error) {
    if (!disposed) console.warn('Showroom portrait unavailable', error);
  }

  }

  async function garmentTexture(src) {
    const img = await new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
    // Process only the resolution the display can use, particularly on phones.
    const maxEdge = host.getBoundingClientRect().width < 700 ? 768 : 1536;
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] > 80) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    }
    const cropped = document.createElement('canvas'); cropped.width = maxX - minX + 1; cropped.height = maxY - minY + 1;
    const croppedContext = cropped.getContext('2d');
    croppedContext.drawImage(canvas, minX, minY, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
    const mask = croppedContext.getImageData(0, 0, cropped.width, cropped.height);
    mask.data.set(prepareGarmentPixels(mask.data, cropped.width, cropped.height));
    croppedContext.putImageData(mask, 0, 0);
    const map = new THREE.CanvasTexture(cropped); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); textures.push(map);
    return { map, aspect: cropped.width / cropped.height, mask };
  }

  const textureCache = new Map();
  function loadGarmentTexture(src) {
    if (!textureCache.has(src)) textureCache.set(src, garmentTexture(src));
    return textureCache.get(src);
  }

  // The front keeps its original UVs/artwork. Separate back and edge surfaces
  // give the cloth volume instead of leaving a single image floating on a plane.
  function clothDepth(x, y, width, height) {
    return .005 + .018 * Math.cos(x / width * Math.PI);
  }
  function clothPosition(x, y, width, height, back = false) {
    // The photograph supplies the real drape; only a gentle depth is added.
    return [x, y, back ? -.009 : clothDepth(x, y, width, height)];
  }
  function clothEdges(mask, width, height) {
    const left = [], right = [];
    const step = Math.max(1, Math.floor(mask.height / 120));
    for (let y = 0; y < mask.height; y += step) {
      let first = -1, last = -1;
      for (let x = 0; x < mask.width; x++) if (mask.data[(y * mask.width + x) * 4 + 3] > 100) { if (first < 0) first = x; last = x; }
      if (first >= 0) {
        left.push([(first / mask.width - .5) * width, (.5 - y / mask.height) * height]);
        right.push([(last / mask.width - .5) * width, (.5 - y / mask.height) * height]);
      }
    }
    const outline = [...left, ...right.reverse()];
    const vertices = [];
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i], b = outline[(i + 1) % outline.length];
      const frontA = clothPosition(...a, width, height);
      const frontB = clothPosition(...b, width, height);
      const backA = clothPosition(...a, width, height, true), backB = clothPosition(...b, width, height, true);
      vertices.push(...frontA, ...backA, ...frontB, ...frontB, ...backA, ...backB);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals(); return geometry;
  }

  await Promise.all(pieces.map(async (piece, index) => {
    const [{ map, aspect, mask }, original] = await Promise.all([loadGarmentTexture(piece.fabricImage), loadGarmentTexture(piece.image)]);
    if (disposed) { map.dispose(); return; }
    const group = new THREE.Group();
    const height = 2.03, width = height * aspect;
    const geometry = new THREE.PlaneGeometry(width, height, 64, 80);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i);
      positions.setXYZ(i, ...clothPosition(x, y, width, height));
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhysicalMaterial({ map, alphaTest: .45, alphaToCoverage: true, roughness: 1, metalness: 0, sheen: .025, sheenRoughness: 1, sheenColor: '#666666', envMapIntensity: .08 });
    applyOriginalPrint(material, original.map, piece);
    const shirt = new THREE.Mesh(geometry, material);
    shirt.position.set(0, 2.02, 0); shirt.castShadow = true; shirt.receiveShadow = false; shirt.userData = { piece, mask };
    group.add(shirt); pickables.push(shirt);

    const hemPixel = (Math.floor(mask.height * .88) * mask.width + Math.floor(mask.width * .5)) * 4;
    const fabricColor = new THREE.Color().setRGB(mask.data[hemPixel] / 255, mask.data[hemPixel + 1] / 255, mask.data[hemPixel + 2] / 255, THREE.SRGBColorSpace);
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: fabricColor, roughness: 1, side: THREE.DoubleSide, envMapIntensity: .12 });
    const edges = new THREE.Mesh(clothEdges(mask, width, height), edgeMaterial);
    edges.position.y = 2.02; edges.castShadow = true; edges.receiveShadow = false; group.add(edges);
    const backMaterial = new THREE.MeshStandardMaterial({ color: fabricColor, map, alphaTest: .45, roughness: 1, side: THREE.DoubleSide, envMapIntensity: .08 });
    backMaterial.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#ifdef USE_MAP\n diffuseColor.a *= texture2D(map, vMapUv).a;\n#endif');
    };
    backMaterial.customProgramCacheKey = () => 'showroom-plain-fabric-back';
    const backGeometry = new THREE.PlaneGeometry(width, height, 64, 80);
    const backPositions = backGeometry.attributes.position;
    for (let i = 0; i < backPositions.count; i++) backPositions.setXYZ(i, ...clothPosition(backPositions.getX(i), backPositions.getY(i), width, height, true));
    backGeometry.computeVertexNormals();
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, 2.02, 0); back.castShadow = true; group.add(back);

    // Each hanger follows the real neck and shoulder positions of this cutout.
    // Its arms are inside the shirt; only the stem emerges through the collar.
    const neckY = 2.02 + findShoulder(mask, .5, height) - .045;
    const leftShoulder = [-width * .27, 2.02 + findShoulder(mask, .23, height) - .10, -.035];
    const rightShoulder = [width * .27, 2.02 + findShoulder(mask, .77, height) - .10, -.035];
    rod([0, neckY, -.035], leftShoulder, .032, woodMaterial, group);
    rod(leftShoulder, rightShoulder, .022, woodMaterial, group);
    rod(rightShoulder, [0, neckY, -.035], .032, woodMaterial, group);
    rod([0, neckY, -.035], [0, 3.37, -.04], .012, chrome, group);
    const hookCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 3.36, -.04), new THREE.Vector3(.075, 3.45, -.04),
      new THREE.Vector3(.067, 3.55, -.04), new THREE.Vector3(-.02, 3.56, -.04), new THREE.Vector3(-.055, 3.49, -.04),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(hookCurve, 20, .012, 8, false), chrome));
    group.position.set(0, 0, -2.18);
    group.rotation.y = index % 2 ? -.08 : .1;
    scene.add(group); groups.set(piece.key, { group, index, shirt, width, targetX: 0, originalRotation: group.rotation.y });
  }));

  function arrange(items) {
    const placements = arrangeGarments(items.map(piece => ({ key: piece.key, width: groups.get(piece.key).width })));
    const keys = new Set(items.map(piece => piece.key));
    for (const [key, item] of groups) item.group.visible = keys.has(key);
    for (const placement of placements) groups.get(placement.key).targetX = placement.x;
    panLimit = placements.length ? Math.max(0, placements.at(-1).x) : 0;
    return placements;
  }
  arrange(pieces);
  for (const item of groups.values()) item.group.position.x = item.targetX;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDown = null;
  function hit(event) {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - r.left) / r.width * 2 - 1, -(event.clientY - r.top) / r.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(pickables.filter(mesh => mesh.parent.visible)).find(intersection => {
      const { mask } = intersection.object.userData;
      const x = Math.min(mask.width - 1, Math.floor(intersection.uv.x * mask.width));
      const y = Math.min(mask.height - 1, Math.floor((1 - intersection.uv.y) * mask.height));
      return mask.data[(y * mask.width + x) * 4 + 3] > 80;
    });
  }
  function pointerMove(event) {
    if (pointerDown && Math.abs(event.clientX - pointerDown.x) > 8) {
      pointerDown.dragged = true;
      overview = false;
      pan = THREE.MathUtils.clamp(pointerDown.pan - (event.clientX - pointerDown.x) * .009, -panLimit, panLimit);
      updateCamera(); return;
    }
    const found = hit(event);
    const piece = found?.object.userData.piece;
    const nextHover = piece?.key || null;
    if (nextHover !== hoverKey) motion = 1;
    hoverKey = nextHover;
    renderer.domElement.style.cursor = piece ? 'pointer' : 'grab';
    onHover?.(piece || null, event.clientX, event.clientY);
  }
  const down = event => { pointerDown = { x: event.clientX, pan, dragged: false }; renderer.domElement.setPointerCapture(event.pointerId); };
  const up = event => { if (pointerDown && !pointerDown.dragged) { const found = hit(event); if (found) onSelect(found.object.userData.piece); } pointerDown = null; };
  const leave = () => { hoverKey = null; motion = 1; onHover?.(null); };
  renderer.domElement.addEventListener('pointermove', pointerMove);
  renderer.domElement.addEventListener('pointerdown', down);
  renderer.domElement.addEventListener('pointerup', up);
  renderer.domElement.addEventListener('pointercancel', () => { pointerDown = null; });
  renderer.domElement.addEventListener('pointerleave', leave);

  function updateCamera() {
    motion = 1;
    onNavigate?.({ canPrevious: pan > -panLimit + .001, canNext: pan < panLimit - .001 });
    const selected = groups.get(selectedKey);
    if (artworkView) {
      destination.set(-roomWidth / 2 + (mobile ? 7 : 4.8), 2.9, mobile ? 1.1 : 2.3);
      aim.set(-roomWidth / 2 + .55, 1.95, -.05);
    } else if (skateView) {
      destination.set(roomWidth / 2 - (mobile ? 10 : 5.6), 2.9, mobile ? 1.8 : 3.9);
      aim.set(roomWidth / 2 - .65, 1.95, -.18);
    } else if (selected) {
      destination.set(selected.targetX + (mobile ? 0 : .9), 2.5, mobile ? 5.5 - inspectionZoom * 1.8 : 4.1 - inspectionZoom * 1.5);
      aim.set(selected.targetX + (mobile ? 0 : .9), mobile ? 1.45 : 2.3, -2.18);
    } else if (mobile && overview) {
      const items = visiblePieces.map(piece => groups.get(piece.key)).filter(Boolean);
      const span = items.length ? items.at(-1).targetX - items[0].targetX + Math.max(...items.map(item => item.width)) : 10;
      const distance = Math.max(12.5, Math.min(45, (span + 1.8) * 1.25 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect)));
      destination.set(0, 3.15, distance - 2.18);
      aim.set(0, 2.65, -2.18);
    } else {
      destination.set(pan + (mobile ? 0 : .4), 2.8, mobile ? 8.4 : 10.2);
      aim.set(pan * .98, 2.65, -2.18);
    }
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    const wasMobile = mobile;
    mobile = width < 700;
    if (mobile !== wasMobile && !selectedKey) { overview = true; pan = 0; }
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    updateCamera();
    if (reducedMotion.matches) { camera.position.copy(destination); currentAim.copy(aim); }
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host); resize();
  const intersection = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { rootMargin: '100px' }); intersection.observe(host);
  function render(time = 0) {
    if (disposed) return;
    frame = requestAnimationFrame(render);
    if (!active || document.hidden || motion < .001 || time - lastFrame < 33) return;
    lastFrame = time;
    motion = reducedMotion.matches ? 0 : motion * .88;
    const speed = reducedMotion.matches ? 1 : .085;
    camera.position.lerp(destination, speed); currentAim.lerp(aim, speed); camera.lookAt(currentAim);
    for (const [key, item] of groups) {
      item.group.position.x = THREE.MathUtils.lerp(item.group.position.x, item.targetX, speed);
      const focus = key === hoverKey || key === selectedKey;
      item.group.rotation.y = THREE.MathUtils.lerp(item.group.rotation.y, (key === selectedKey ? inspectionAngle : item.originalRotation + (focus ? -.065 : 0)), speed);
      item.group.position.z = THREE.MathUtils.lerp(item.group.position.z, focus ? -1.98 : -2.18, speed);
    }
    floorProps?.updateFacing(camera);
    renderer.render(scene, camera);
  }
  render(); onReady?.();
  // Let the ready state and first garment frame paint before fetching decoration.
  const decorFrame = requestAnimationFrame(() => {
    if (!disposed) void loadDecorations().then(() => { if (!disposed) motion = 1; });
  });

  return {
    overview() { overview = true; selectedKey = null; artworkView = false; skateView = false; pan = 0; updateCamera(); },
    focus(key) {
      const item = groups.get(key);
      if (!item?.group.visible) return;
      artworkView = false; skateView = false;
      overview = false;
      pan = THREE.MathUtils.clamp(item.targetX, -panLimit, panLimit);
      updateCamera();
    },
    showArtwork(enabled) { artworkView = enabled; skateView = false; updateCamera(); },
    showSkates(enabled) { artworkView = false; skateView = enabled; updateCamera(); },
    select(key) { artworkView = false; skateView = false; selectedKey = key; inspectionAngle = 0; inspectionZoom = 0; updateCamera(); },
    inspect(angle, zoom) {
      inspectionAngle = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(angle, -45, 45));
      inspectionZoom = THREE.MathUtils.clamp(zoom, 0, 1);
      updateCamera();
    },
    move(direction) { overview = false; artworkView = false; skateView = false; pan = THREE.MathUtils.clamp(pan + direction * 2.8, -panLimit, panLimit); updateCamera(); },
    filter(items) {
      artworkView = false; skateView = false; selectedKey = null; visiblePieces = items;
      arrange(items);
      overview = true; pan = 0;
      updateCamera();
    },
    dispose() {
      disposed = true; cancelAnimationFrame(decorFrame); cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect();
      renderer.domElement.removeEventListener('pointermove', pointerMove);
      renderer.domElement.removeEventListener('pointerdown', down);
      renderer.domElement.removeEventListener('pointerup', up);
      renderer.domElement.removeEventListener('pointerleave', leave);
      scene.traverse(object => { object.geometry?.dispose(); if (object.material) disposableMaterials.push(...(Array.isArray(object.material) ? object.material : [object.material])); });
      new Set(disposableMaterials).forEach(material => material.dispose());
      new Set(textures).forEach(texture => texture.dispose()); env.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
