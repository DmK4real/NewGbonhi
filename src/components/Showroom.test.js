import { beforeEach, describe, expect, it, vi } from 'vitest';
import Showroom from './Showroom.vue';
import { cartStore } from '../data/cart.ts';

vi.mock('../data/cart.ts', () => ({ cartStore: { addToCart: vi.fn() } }));

function room() {
  const page = {
    ...Showroom.data(),
    $refs: { detail: { close: vi.fn(), showModal: vi.fn() }, rack: { scrollLeft: 200 } },
    $nextTick: callback => callback(),
    $emit: vi.fn(),
  };
  for (const [name, method] of Object.entries(Showroom.methods)) page[name] = method.bind(page);
  return page;
}

describe('showroom purchase flow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows available capsule pieces and filters by drop', () => {
    const all = Showroom.computed.pieces.call({ collection: 'all' });
    expect(all.length).toBeGreaterThan(2);
    expect(all.every(piece => !piece.product.soldOut && piece.image)).toBe(true);
    const camo = Showroom.computed.pieces.call({ collection: 'drop04' });
    expect(camo.map(piece => piece.variant.id)).toEqual(['white', 'black']);
    expect(camo.every(piece => piece.product.tags.includes('drop04'))).toBe(true);
  });

  it('opens a fresh size selection for each piece', () => {
    const page = room();
    page.selectedSize = 'L';
    page.openPiece(Showroom.computed.pieces.call({ collection: 'all' })[0]);
    expect(page.selectedSize).toBeNull();
    expect(page.$refs.detail.showModal).toHaveBeenCalledOnce();
  });

  it('requires an available size before preordering', () => {
    const page = room();
    page.openPiece(Showroom.computed.pieces.call({ collection: 'drop04' })[0]);
    page.buy();
    page.selectedSize = 'INVALID';
    page.buy();
    expect(cartStore.addToCart).not.toHaveBeenCalled();
    expect(page.$emit).not.toHaveBeenCalled();
  });

  it('preserves the selected color, size, image and price in the shared cart', () => {
    const page = room();
    const white = Showroom.computed.pieces.call({ collection: 'drop04' })[0];
    page.openPiece(white);
    page.selectVariant(white.product.variants[1]);
    page.selectedSize = 'L';
    page.buy();
    expect(cartStore.addToCart).toHaveBeenCalledWith(expect.objectContaining({
      selectedSize: 'L', selectedColorId: 'black', price: white.product.price,
      imagePrimary: white.product.variants[1].imagePrimary, preorder: true,
    }));
    expect(page.$refs.detail.close).toHaveBeenCalledOnce();
    expect(page.$emit).toHaveBeenCalledWith('open-cart');
  });

  it('blocks unavailable products and resets the rack when switching collection', () => {
    const page = room();
    const piece = Showroom.computed.pieces.call({ collection: 'all' })[0];
    page.selected = { ...piece, product: { ...piece.product, soldOut: true } };
    page.selectedSize = 'L';
    page.buy();
    expect(cartStore.addToCart).not.toHaveBeenCalled();
    page.changeCollection('drop03');
    expect(page.$refs.rack.scrollLeft).toBe(0);
  });

  it('focuses the selected piece and restores the room when closing the detail', () => {
    const page = room();
    page.scene = { select: vi.fn(), move: vi.fn() };
    const piece = Showroom.computed.pieces.call({ collection: 'all' })[0];
    page.openPiece(piece);
    expect(page.scene.select).toHaveBeenCalledWith(piece.key);
    page.closeDetail();
    expect(page.scene.select).toHaveBeenLastCalledWith(null);
    expect(page.selected).toBeNull();
    page.move(1);
    expect(page.scene.move).toHaveBeenCalledWith(1);
  });

  it('keeps the semantic product list in sync with the 3D scene filters', () => {
    const page = room();
    page.scene = { filter: vi.fn() };
    page.pieces = Showroom.computed.pieces.call({ collection: 'drop03' });
    page.changeCollection('drop03');
    expect(page.scene.filter).toHaveBeenCalledWith(page.pieces);
    expect(page.collection).toBe('drop03');
    expect(page.$refs.rack.scrollLeft).toBe(0);
  });
});
