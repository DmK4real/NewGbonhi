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

  it('resets inspection when changing pieces or colors', () => {
    const page = room();
    page.scene = { select: vi.fn(), inspect: vi.fn() };
    const piece = Showroom.computed.pieces.call({ collection: 'drop04' })[0];
    page.openPiece(piece);
    page.inspectAngle('30');
    page.inspectZoom('0.75');
    page.imageZoomed = true;
    expect(page.scene.inspect).toHaveBeenLastCalledWith(30, 0.75);
    page.selectVariant(piece.product.variants[1]);
    expect(page.viewAngle).toBe(0);
    expect(page.viewZoom).toBe(0);
    expect(page.imageZoomed).toBe(false);
    expect(page.scene.select).toHaveBeenLastCalledWith(page.selected.key);
  });

  it('tracks navigation boundaries in the image fallback', () => {
    const page = room();
    page.sceneFailed = true;
    Object.assign(page.$refs.rack, { scrollLeft: 0, clientWidth: 300, scrollWidth: 800 });
    page.syncFallbackNavigation();
    expect(page.navigation).toEqual({ canPrevious: false, canNext: true });
    page.$refs.rack.scrollLeft = 250;
    page.syncFallbackNavigation();
    expect(page.navigation).toEqual({ canPrevious: true, canNext: true });
    page.$refs.rack.scrollLeft = 500;
    page.syncFallbackNavigation();
    expect(page.navigation).toEqual({ canPrevious: true, canNext: false });
    page.$refs.rack.scrollWidth = 300;
    page.$refs.rack.scrollLeft = 0;
    page.syncFallbackNavigation();
    expect(page.navigation).toEqual({ canPrevious: false, canNext: false });
  });

  it('opens the skate wall and returns to browsing when choosing a collection', () => {
    const page = room();
    page.scene = { showSkates: vi.fn(), filter: vi.fn() };
    page.toggleSkates();
    expect(page.skateView).toBe(true);
    expect(page.scene.showSkates).toHaveBeenLastCalledWith(true);
    page.toggleSkates();
    expect(page.skateView).toBe(false);
    expect(page.scene.showSkates).toHaveBeenLastCalledWith(false);
    page.toggleSkates();
    page.changeCollection('drop04');
    expect(page.skateView).toBe(false);
    expect(page.scene.filter).toHaveBeenCalled();
  });

  it('switches between artwork and skate views without keeping both active', () => {
    const page = room();
    page.scene = { showArtwork: vi.fn(), showSkates: vi.fn() };
    page.toggleArtwork();
    expect(page.artworkView).toBe(true);
    expect(page.scene.showArtwork).toHaveBeenLastCalledWith(true);
    page.toggleSkates();
    expect(page.artworkView).toBe(false);
    expect(page.skateView).toBe(true);
    page.toggleArtwork();
    expect(page.skateView).toBe(false);
    expect(page.artworkView).toBe(true);
    page.toggleArtwork();
    expect(page.scene.showArtwork).toHaveBeenLastCalledWith(false);
  });

  it('switches display while preserving the collection and purchase selection', () => {
    const page = room();
    page.collection = 'drop04';
    page.selectedSize = 'L';
    page.hovered = { key: 'old-hover' };
    page.setView('catalog');
    expect(Showroom.computed.catalogView.call(page)).toBe(true);
    expect(page.collection).toBe('drop04');
    expect(page.selectedSize).toBe('L');
    expect(page.hovered).toBeNull();
    page.setView('3d');
    expect(Showroom.computed.catalogView.call(page)).toBe(false);
  });

  it('keeps the catalog available when WebGL fails', () => {
    const page = room();
    page.sceneFailed = true;
    page.setView('catalog');
    page.setView('3d');
    expect(page.view).toBe('catalog');
    expect(Showroom.computed.catalogView.call(page)).toBe(true);
    page.setView('invalid');
    expect(page.view).toBe('catalog');
  });

  it('shows worn photos only for the matching white Camo variant', () => {
    const page = room();
    page.copy = { front: 'Avant', back: 'Arrière', worn: 'Porté' };
    const pieces = Showroom.computed.pieces.call({ collection: 'drop04' });
    page.selected = pieces.find(piece => piece.variant.id === 'white');
    page.productPhotos = Showroom.computed.productPhotos.call(page);
    expect(page.productPhotos.filter(photo => photo.worn)).toHaveLength(4);
    page.selectPhoto(2);
    expect(page.photoIndex).toBe(2);
    page.imageZoomed = true;
    page.selectVariant(page.selected.product.variants.find(variant => variant.id === 'black'));
    expect(page.photoIndex).toBe(0);
    expect(page.imageZoomed).toBe(false);
    expect(Showroom.computed.productPhotos.call(page).some(photo => photo.worn)).toBe(false);
  });

  it('provides front and back images for City tees and rejects invalid photo indices', () => {
    const page = room();
    page.copy = { front: 'Avant', back: 'Arrière' };
    page.selected = Showroom.computed.pieces.call({ collection: 'drop03' }).find(piece => piece.product.slug === 'arw-film-city-tee-black');
    page.productPhotos = Showroom.computed.productPhotos.call(page);
    expect(page.productPhotos.map(photo => photo.label)).toEqual(['Avant', 'Arrière']);
    expect(new Set(page.productPhotos.map(photo => photo.src)).size).toBe(2);
    page.selectPhoto(1);
    page.selectPhoto(100);
    expect(page.photoIndex).toBe(1);
  });

  it('navigates product buttons with arrows and Home/End without wrapping', () => {
    const page = room();
    const buttons = Array.from({ length: 3 }, () => ({ focus: vi.fn() }));
    const event = { key: 'ArrowRight', target: buttons[0], currentTarget: { querySelectorAll: () => buttons }, preventDefault: vi.fn() };
    page.navigatePieces(event);
    expect(buttons[1].focus).toHaveBeenCalledOnce();
    event.key = 'End'; page.navigatePieces(event);
    expect(buttons[2].focus).toHaveBeenCalledOnce();
    event.key = 'ArrowLeft'; page.navigatePieces(event);
    expect(buttons[0].focus).toHaveBeenCalledOnce();
    event.key = 'Home'; event.ctrlKey = true; page.navigatePieces(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(3);
  });

  it('centers keyboard focus in 3D without opening the purchase dialog', () => {
    const page = room();
    page.scene = { focus: vi.fn() };
    page.focusPiece({ key: 'piece-1' });
    expect(page.scene.focus).toHaveBeenCalledWith('piece-1');
    expect(page.$refs.detail.showModal).not.toHaveBeenCalled();
    page.catalogView = true;
    page.focusPiece({ key: 'piece-2' });
    expect(page.scene.focus).toHaveBeenCalledTimes(1);
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
