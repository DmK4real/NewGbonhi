import * as THREE from 'three';
import { skateDecks } from '../data/skateDecks.js';

// Only the hanging mechanism has volume. The decks remain photographic cutouts.
export async function createSkateDisplay({ roomWidth, loadTexture, isDisposed, onChange }) {
  const maps = await Promise.all(skateDecks.map(deck => loadTexture(deck.image)));
  if (isDisposed()) return null;
  const root = new THREE.Group(); root.name = 'NG rotating skate display';
  root.position.set(roomWidth / 2 - 4.2, 1.8 * .72, 1.7);
  root.scale.setScalar(.72);
  root.rotation.y = -.6;
  const rotor = new THREE.Group(); root.add(rotor);
  const metal = new THREE.MeshStandardMaterial({ color: '#66665e', metalness: .8, roughness: .38 });
  const dark = new THREE.MeshStandardMaterial({ color: '#242522', metalness: .7, roughness: .45 });
  function part(geometry, material, parent, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  const ring = part(new THREE.TorusGeometry(.75, .018, 8, 48), metal, rotor, 0, 1.27);
  ring.rotation.x = Math.PI / 2;
  part(new THREE.CylinderGeometry(.035, .035, 3.12, 16), metal, root, 0, -.24);
  part(new THREE.CylinderGeometry(.58, .64, .08, 40), dark, root, 0, -1.76);
  const baseTrim = part(new THREE.TorusGeometry(.59, .012, 6, 40), metal, root, 0, -1.715);
  baseTrim.rotation.x = Math.PI / 2;
  const pickables = [];
  for (let index = 0; index < skateDecks.length; index++) {
    const angle = index * Math.PI / 3;
    const map = maps[index]; map.colorSpace = THREE.SRGBColorSpace;
    const hanger = new THREE.Group(); hanger.position.set(Math.sin(angle) * .75, 0, Math.cos(angle) * .75); hanger.rotation.y = angle;
    rotor.add(hanger);
    const height = 2.2, width = height * map.image.width / map.image.height;
    const deck = part(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map, transparent: true, alphaTest: .06, side: THREE.FrontSide, toneMapped: false }), hanger);
    deck.name = skateDecks[index].title; pickables.push(deck);
    part(new THREE.BoxGeometry(.12, .10, .045), metal, hanger, 0, 1.16, -.025);
  }
  let step = 0, playing = false, elapsed = 0;
  const index = () => ((step % skateDecks.length) + skateDecks.length) % skateDecks.length;
  const notify = () => onChange?.({ index: index(), playing, ready: true });
  notify();
  return {
    root, pickables,
    get step() { return step; },
    move(direction) { playing = false; elapsed = 0; step += direction; notify(); },
    setPlaying(enabled) { playing = enabled; elapsed = 0; notify(); },
    needsAnimation(visible, reducedMotion) {
      return (playing && visible && !reducedMotion) || Math.abs(rotor.rotation.y + step * Math.PI / 3) > .001;
    },
    tick(delta, visible, reducedMotion) {
      if (reducedMotion && playing) { playing = false; notify(); }
      if (playing && visible) {
        elapsed += delta;
        if (elapsed >= 3500) { elapsed %= 3500; step++; notify(); }
      }
      const target = -step * Math.PI / 3;
      rotor.rotation.y = reducedMotion ? target : THREE.MathUtils.lerp(rotor.rotation.y, target, 1 - Math.exp(-delta / 260));
    },
  };
}
