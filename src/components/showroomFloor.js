import * as THREE from 'three';

const af1PhotoUrl = new URL('../assets/showroom/air-force-1-white-photo.webp', import.meta.url).href;
const jordanPhotoUrl = new URL('../assets/showroom/jordan-1-chicago-photo.webp', import.meta.url).href;

// Skateboards use geometry; sneakers use original transparent product photographs.
export async function addShowroomFloor(scene, { roomWidth, deckMap, textures }) {
  const material = (color, roughness = .8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const white = material('#eeeae2');
  const rubber = material('#d9d6cf');
  const metal = material('#9c9c99', .3, .8);
  const maple = material('#b58b59');
  const grip = material('#222324', 1);
  function mesh(geometry, mat, parent, x = 0, y = 0, z = 0) {
    const item = new THREE.Mesh(geometry, mat);
    item.position.set(x, y, z); item.castShadow = item.receiveShadow = true; parent.add(item); return item;
  }
  function line(points, radius, mat, parent) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return mesh(new THREE.TubeGeometry(curve, 16, radius, 6, false), mat, parent);
  }
  function board(x, z, angle, flipped) {
    const group = new THREE.Group();
    const outline = new THREE.Shape();
    const r = .24, length = 1.72;
    outline.moveTo(-r, -length / 2 + r); outline.lineTo(-r, length / 2 - r);
    outline.absarc(0, length / 2 - r, r, Math.PI, 0, true);
    outline.lineTo(r, -length / 2 + r); outline.absarc(0, -length / 2 + r, r, 0, -Math.PI, true); outline.closePath();
    const geometry = new THREE.ExtrudeGeometry(outline, { depth: .025, bevelEnabled: true, bevelSize: .008, bevelThickness: .005, bevelSegments: 2, curveSegments: 18 });
    const positions = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < positions.count; i++) {
      const px = positions.getX(i), py = positions.getY(i);
      uv.setXY(i, (px + r) / (r * 2), (py + length / 2) / length);
      const kick = Math.max(0, (Math.abs(py) - .56) / .30);
      positions.setZ(i, positions.getZ(i) + .07 * kick * kick);
    }
    geometry.computeVertexNormals();
    mesh(geometry, [grip, maple], group);
    if (deckMap) {
      const printGeometry = new THREE.ShapeGeometry(outline, 18);
      const pos = printGeometry.attributes.position, uvPrint = printGeometry.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const py = pos.getY(i), kick = Math.max(0, (Math.abs(py) - .56) / .30);
        uvPrint.setXY(i, (pos.getX(i) + r) / (r * 2), (py + length / 2) / length);
        pos.setZ(i, -.009 + .07 * kick * kick);
      }
      printGeometry.computeVertexNormals();
      mesh(printGeometry, new THREE.MeshStandardMaterial({ map: deckMap, roughness: .8, side: THREE.DoubleSide }), group);
    }
    for (const y of [-.51, .51]) {
      mesh(new THREE.BoxGeometry(.16, .14, .045), metal, group, 0, y, -.055);
      line([[-.28, y, -.155], [.28, y, -.155]], .025, metal, group);
      for (const xWheel of [-.265, .265]) {
        const wheel = mesh(new THREE.CylinderGeometry(.09, .09, .075, 18), rubber, group, xWheel, y, -.155);
        wheel.rotation.z = Math.PI / 2;
        const hub = mesh(new THREE.CylinderGeometry(.025, .025, .078, 12), metal, group, xWheel, y, -.155);
        hub.rotation.z = Math.PI / 2;
      }
      for (const sx of [-.065, .065]) for (const sy of [-.045, .045]) {
        mesh(new THREE.SphereGeometry(.009, 6, 4), metal, group, sx, y + sy, .034);
      }
    }
    group.rotation.x = flipped ? Math.PI / 2 : -Math.PI / 2;
    const placement = new THREE.Group(); placement.add(group);
    placement.rotation.y = angle; placement.position.set(x, flipped ? .11 : .255, z); scene.add(placement);
  }
  board(roomWidth / 2 - 1.2, -.45, -.28, false);
  board(roomWidth / 2 - 2.25, .55, .48, true);

  const photoGroups = [];
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = 128; shadowCanvas.height = 64;
  const ctx = shadowCanvas.getContext('2d');
  ctx.scale(1, .5);
  const gradient = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  gradient.addColorStop(0, 'rgba(0,0,0,.42)'); gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  const shadowMap = new THREE.CanvasTexture(shadowCanvas); textures.push(shadowMap);
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, toneMapped: false });
  const loader = new THREE.TextureLoader();
  const sources = [
    { url: af1PhotoUrl, name: "Nike Air Force 1 '07 White", z: -.65 },
    { url: jordanPhotoUrl, name: 'Air Jordan 1 High OG Chicago Lost & Found', z: .65 },
  ];
  await Promise.all(sources.map(async source => {
    try {
      const map = await loader.loadAsync(source.url);
      map.colorSpace = THREE.SRGBColorSpace; textures.push(map);
      const width = .88, height = width * map.image.height / map.image.width;
      const photoMaterial = new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: .03, side: THREE.DoubleSide, toneMapped: false });
      for (let i = 0; i < 2; i++) {
        const group = new THREE.Group(); group.name = source.name;
        group.position.set(-roomWidth / 2 + 1.0 + i * .28, .014, source.z + i * .35);
        const photo = new THREE.Mesh(new THREE.PlaneGeometry(width, height), photoMaterial);
        photo.position.y = height / 2; group.add(photo); scene.add(group); photoGroups.push(group);
        const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.08, .40), shadowMaterial);
        shadow.rotation.x = -Math.PI / 2; shadow.position.set(group.position.x, .003, group.position.z);
        scene.add(shadow);
      }
    } catch (error) {
      console.warn(`Showroom sneaker photo unavailable: ${source.name}`, error);
    }
  }));
  return {
    updateFacing(camera) {
      for (const group of photoGroups) {
        // Keep the cutout upright and grounded; only turn around the vertical axis.
        group.rotation.y = Math.atan2(camera.position.x - group.position.x, camera.position.z - group.position.z);
      }
    },
  };
}
