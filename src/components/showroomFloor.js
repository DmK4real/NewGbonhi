import * as THREE from 'three';

const af1PhotoUrl = new URL('../assets/showroom/air-force-1-white-photo.webp', import.meta.url).href;
const jordanPhotoUrl = new URL('../assets/showroom/jordan-1-chicago-photo.webp', import.meta.url).href;

const boardWheelsUrl = new URL('../assets/skate/complete-wheels.webp', import.meta.url).href;
const boardInvertedUrl = new URL('../assets/skate/complete-inverted.webp', import.meta.url).href;

// All floor props are photographic cutouts, anchored at floor level.
export async function addShowroomFloor(scene, { roomWidth, textures, isDisposed = () => false }) {
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
    { url: boardWheelsUrl, name: 'NG complete skateboard / wheels down', x: roomWidth / 2 - 1.2, z: -.45, width: 1.72, count: 1 },
    { url: boardInvertedUrl, name: 'NG complete skateboard / inverted', x: roomWidth / 2 - 2.25, z: .55, width: 1.72, count: 1 },
    { url: af1PhotoUrl, name: "Nike Air Force 1 '07 White", z: -.65 },
    { url: jordanPhotoUrl, name: 'Air Jordan 1 High OG Chicago Lost & Found', z: .65 },
  ];
  await Promise.all(sources.map(async source => {
    try {
      const map = await loader.loadAsync(source.url);
      if (isDisposed()) { map.dispose(); return; }
      map.colorSpace = THREE.SRGBColorSpace; textures.push(map);
      const width = source.width || .88, height = width * map.image.height / map.image.width;
      const photoMaterial = new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: .03, side: THREE.DoubleSide, toneMapped: false });
      for (let i = 0; i < (source.count || 2); i++) {
        const group = new THREE.Group(); group.name = source.name;
        group.position.set(source.x ?? -roomWidth / 2 + 1.0 + i * .28, .014, source.z + i * .35);
        const photo = new THREE.Mesh(new THREE.PlaneGeometry(width, height), photoMaterial);
        photo.position.y = height / 2; group.add(photo); scene.add(group); photoGroups.push(group);
        const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.08, .40), shadowMaterial);
        shadow.rotation.x = -Math.PI / 2; shadow.position.set(group.position.x, .003, group.position.z);
        scene.add(shadow);
      }
    } catch (error) {
      if (!isDisposed()) console.warn(`Showroom floor photo unavailable: ${source.name}`, error);
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
