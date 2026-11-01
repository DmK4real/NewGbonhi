import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createSkateDisplay } from './skateDisplay.js';

async function display() {
  let state;
  const display = await createSkateDisplay({ roomWidth: 22, isDisposed: () => false, onChange: value => { state = value; }, loadTexture: async () => { const map = new THREE.Texture(); map.image = { width: 240, height: 1000 }; return map; } });
  return { display, state: () => state };
}

describe('rotating photo display inside the showroom', () => {
  it('keeps the six photo decks on a free-standing floor display and wraps designs', async () => {
    const { display: rack, state } = await display();
    expect(rack.pickables).toHaveLength(6);
    rack.root.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(rack.root);
    expect(bounds.min.y).toBeCloseTo(0, 4);
    expect(bounds.min.z).toBeGreaterThan(.8);
    expect(rack.pickables.every(deck => deck.geometry.type === 'PlaneGeometry')).toBe(true);
    rack.move(-1); expect(state().index).toBe(5);
    rack.move(1); expect(state().index).toBe(0);
  });
  it('rotates automatically only while the skate wall is being viewed', async () => {
    const { display: rack, state } = await display();
    rack.setPlaying(true); rack.tick(3500, false, false);
    expect(state().index).toBe(0);
    rack.tick(3500, true, false); expect(state().index).toBe(1);
    rack.move(1); expect(state().playing).toBe(false);
  });
  it('stops automatic rotation when reduced motion is enabled', async () => {
    const { display: rack, state } = await display();
    rack.setPlaying(true); rack.tick(3500, true, true);
    expect(state().playing).toBe(false); expect(state().index).toBe(0);
  });
  it('does not create scene objects when disposed during image loading', async () => {
    const rack = await createSkateDisplay({ roomWidth: 22, isDisposed: () => true, loadTexture: async () => new THREE.Texture() });
    expect(rack).toBeNull();
  });
});
