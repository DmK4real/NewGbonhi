import { describe, expect, it } from 'vitest';
import { arrangeGarments, findShoulder } from './showroomLayout.js';

describe('garments on the rail', () => {
  it('leaves space between every silhouette, including oversized sleeves', () => {
    const pieces = [{ key: 'tee', width: 2.1 }, { key: 'oversized', width: 2.8 }, { key: 'tee-2', width: 2.2 }];
    const layout = arrangeGarments(pieces);
    for (let i = 1; i < layout.length; i++) {
      const previousRight = layout[i - 1].x + layout[i - 1].width / 2;
      const currentLeft = layout[i].x - layout[i].width / 2;
      expect(currentLeft - previousRight).toBeCloseTo(.65);
    }
    expect(layout[0].x - layout[0].width / 2).toBeCloseTo(-(layout.at(-1).x + layout.at(-1).width / 2));
  });

  it('centers a single piece and recomputes positions after filtering', () => {
    expect(arrangeGarments([{ key: 'one', width: 2.4 }])[0].x).toBe(0);
    expect(arrangeGarments([])).toEqual([]);
    const pair = arrangeGarments([{ key: 'one', width: 2 }, { key: 'two', width: 2 }]);
    expect(pair[0].x).toBeCloseTo(-pair[1].x);
  });

  it('fits the hanger to the opaque shoulder rather than transparent image padding', () => {
    const data = new Uint8ClampedArray(4 * 4 * 4);
    data[(1 * 4 + 1) * 4 + 3] = 255;
    data[(2 * 4 + 2) * 4 + 3] = 255;
    const mask = { data, width: 4, height: 4 };
    expect(findShoulder(mask, 1 / 3, 2)).toBe(.5);
    expect(findShoulder(mask, 2 / 3, 2)).toBe(0);
  });
});
