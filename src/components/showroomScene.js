import { applyOriginalPrint } from './garmentPrint.js';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { arrangeGarments, findShoulder } from './showroomLayout.js';
import { prepareGarmentPixels } from './garmentTexture.js';

// The shop stays usable through its HTML controls if WebGL is unavailable.
export async function createShowroomScene(host, { pieces, onSelect, onHover, onReady }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#555960');
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
  let visiblePieces = pieces;
  let pan = 0;
  let mobile = false;
  let hoverKey = null;
  let frame;
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
  const wallMaterial = plaster('#73777d', 7);
  const floorMaterial = plaster('#4b4f55', 10);
  floorMaterial.roughness = .68;
  const woodMaterial = (() => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 512;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#292b2f'; ctx.fillRect(0, 0, 256, 512);
    for (let x = 0; x < 256; x++) {
      ctx.strokeStyle = `rgba(0,0,0,${.03 + .065 * Math.abs(Math.sin(x * 13.37))})`;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 3, 130, x - 4, 360, x, 512); ctx.stroke();
    }
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; textures.push(map);
    return new THREE.MeshStandardMaterial({ map, roughness: .55, color: '#d7d9dd' });
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
  box(roomWidth, 7, .22, wallMaterial, 0, 3.5, -3.05);
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

  scene.add(new THREE.HemisphereLight('#f5f7ff', '#727782', .85));
  const windowLight = new THREE.DirectionalLight('#ffffff', 1.8);
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
    const spot = new THREE.SpotLight('#f4f6ff', 20, 12, .62, .75, 1.5);
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

  const signCanvas = document.createElement('canvas'); signCanvas.width = 1536; signCanvas.height = 384;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#ef2028'; signCtx.textAlign = 'center'; signCtx.textBaseline = 'middle';
  signCtx.font = 'italic 900 190px Arial'; signCtx.fillText('NEWGBONHI', 768, 155);
  signCtx.font = '24px monospace'; signCtx.fillStyle = '#eef0f3'; signCtx.fillText('A B I D J A N   /   C O N C E P T   S T O R E', 768, 300);
  const signMap = new THREE.CanvasTexture(signCanvas); signMap.colorSpace = THREE.SRGBColorSpace; textures.push(signMap);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.5, .875), new THREE.MeshBasicMaterial({ map: signMap, transparent: true, depthWrite: false, toneMapped: false }));
  sign.position.set(0, 4.95, -2.92); scene.add(sign);

  async function garmentTexture(src) {
    const img = await new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
    const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
    for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
      if (data[(y * img.width + x) * 4 + 3] > 80) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    }
    const cropped = document.createElement('canvas'); cropped.width = maxX - minX + 1; cropped.height = maxY - minY + 1;
    const croppedContext = cropped.getContext('2d');
    croppedContext.drawImage(img, minX, minY, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
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
    const selected = groups.get(selectedKey);
    if (selected) {
      destination.set(selected.targetX + (mobile ? 0 : .9), 2.5, mobile ? 5.5 : 4.1);
      aim.set(selected.targetX + (mobile ? 0 : .9), mobile ? 1.45 : 2.3, -2.18);
    } else {
      destination.set(pan + (mobile ? 0 : .4), 2.8, mobile ? 8.4 : 10.2);
      aim.set(pan * .98, 2.65, -2.18);
    }
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    const wasMobile = mobile;
    mobile = width < 700;
    if (mobile !== wasMobile && !selectedKey) pan = mobile ? groups.get(visiblePieces[0]?.key)?.targetX || 0 : 0;
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
      item.group.rotation.y = THREE.MathUtils.lerp(item.group.rotation.y, item.originalRotation + (focus ? -.065 : 0), speed);
      item.group.position.z = THREE.MathUtils.lerp(item.group.position.z, focus ? -1.98 : -2.18, speed);
    }
    renderer.render(scene, camera);
  }
  render(); onReady?.();

  return {
    select(key) { selectedKey = key; updateCamera(); },
    move(direction) { pan = THREE.MathUtils.clamp(pan + direction * 2.8, -panLimit, panLimit); updateCamera(); },
    filter(items) {
      selectedKey = null; visiblePieces = items;
      arrange(items);
      pan = mobile ? groups.get(items[0]?.key)?.targetX || 0 : 0;
      updateCamera();
    },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect();
      renderer.domElement.removeEventListener('pointermove', pointerMove);
      renderer.domElement.removeEventListener('pointerdown', down);
      renderer.domElement.removeEventListener('pointerup', up);
      renderer.domElement.removeEventListener('pointerleave', leave);
      scene.traverse(object => { object.geometry?.dispose(); if (object.material) disposableMaterials.push(...(Array.isArray(object.material) ? object.material : [object.material])); });
      new Set(disposableMaterials).forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose()); env.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
