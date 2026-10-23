import { describe, expect, it } from 'vitest';
import { prepareGarmentPixels } from './garmentTexture.js';

describe('garment matte preparation', () => {
  it('removes the light fringe while preserving the printed artwork', () => {
    const width = 16, height = 16;
    const source = new Uint8ClampedArray(width * height * 4);
    for (let y = 2; y < 14; y++) for (let x = 2; x < 14; x++) {
      const edge = x === 2 || y === 2 || x === 13 || y === 13;
      source.set(edge ? [220, 220, 220, 255] : [28, 30, 32, 255], (y * width + x) * 4);
    }
    const logo = (8 * width + 8) * 4;
    source.set([255, 250, 240, 255], logo);
    const original = new Uint8ClampedArray(source);
    const prepared = prepareGarmentPixels(source, width, height);
    expect(prepared[(8 * width + 2) * 4 + 3]).toBe(0);
    expect([...prepared.slice(logo, logo + 4)]).toEqual([255, 250, 240, 255]);
    expect(prepared[(8 * width + 2) * 4]).toBe(28);
    expect(source).toEqual(original);
  });

  it('keeps transparent cutouts transparent', () => {
    const source = new Uint8ClampedArray(12 * 12 * 4);
    const prepared = prepareGarmentPixels(source, 12, 12);
    expect(prepared.every((channel, index) => index % 4 !== 3 || channel === 0)).toBe(true);
  });
});
