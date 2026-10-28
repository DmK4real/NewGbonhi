import { describe, expect, it } from 'vitest';
import { panScale, coastPan } from './showroomGesture.js';

describe('showroom swipe movement', () => {
  it('maps a swipe to the visible scene width, including narrow screens', () => {
    const phone = panScale(390, 1.3, 39, 10.58);
    expect(phone).toBeGreaterThan(.009 * 2);
    expect(panScale(780, 1.3, 39, 10.58) * 200).toBeCloseTo(phone * 100);
  });
  it('coasts and slows down without crossing the rack boundary', () => {
    const step = coastPan(0, .02, 16, 8);
    expect(step.pan).toBeGreaterThan(0);
    expect(step.velocity).toBeLessThan(.02);
    expect(coastPan(7.99, .02, 16, 8)).toEqual({ pan: 8, velocity: 0 });
    expect(coastPan(-7.99, -.02, 16, 8)).toEqual({ pan: -8, velocity: 0 });
  });
  it('produces equivalent momentum at different frame rates', () => {
    const first = coastPan(0, .02, 16, 8);
    const second = coastPan(first.pan, first.velocity, 16, 8);
    const single = coastPan(0, .02, 32, 8);
    expect(second.pan).toBeCloseTo(single.pan);
    expect(second.velocity).toBeCloseTo(single.velocity);
  });
});
