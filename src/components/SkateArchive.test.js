import { describe, expect, it } from 'vitest';
import SkateArchive from './SkateArchive.vue';

function archive() {
  const page = SkateArchive.data();
  for (const [name, get] of Object.entries(SkateArchive.computed)) Object.defineProperty(page, name, { get: () => get.call(page) });
  for (const [name, method] of Object.entries(SkateArchive.methods)) page[name] = method.bind(page);
  return page;
}

describe('Lab rotating skate display', () => {
  it('wraps in both directions while keeping continuous rotation', () => {
    const page = archive();
    page.move(-1); expect(page.activeIndex).toBe(5);
    page.move(1); expect(page.activeIndex).toBe(0);
    for (let i = 0; i < 6; i++) page.move(1);
    expect(page.activeIndex).toBe(0); expect(page.step).toBe(6);
  });
  it('takes the short route when choosing a design and stops automatic rotation', () => {
    const page = archive(); page.playing = true;
    page.choose(5); expect(page.step).toBe(-1); expect(page.activeDeck.id).toBe('lilies'); expect(page.playing).toBe(false);
    page.choose(90); expect(page.step).toBe(-1);
  });
  it('respects reduced motion and preserves play state during automatic steps', () => {
    const page = archive(); page.reducedMotion = true;
    page.toggleRotation(); expect(page.playing).toBe(false);
    page.reducedMotion = false; page.toggleRotation(); page.move(1, false);
    expect(page.playing).toBe(true);
    page.move(1); expect(page.playing).toBe(false);
  });
  it('turns with horizontal swipes but leaves vertical scrolling alone', () => {
    const page = archive();
    page.onDown({ isPrimary: true, pointerType: 'touch', clientX: 220, clientY: 200 });
    page.onUp({ clientX: 110, clientY: 210 }); expect(page.activeIndex).toBe(1);
    page.onDown({ isPrimary: true, pointerType: 'touch', clientX: 220, clientY: 200 });
    page.onUp({ clientX: 210, clientY: 310 }); expect(page.activeIndex).toBe(1);
  });
});
