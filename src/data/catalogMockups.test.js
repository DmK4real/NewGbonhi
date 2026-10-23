import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { products } from './products.ts';
import definitions from './catalogMockups.json';
import rawProducts from './products.json';
import ProductPage from '../ProductPage.vue';
import Showroom from '../components/Showroom.vue';

describe('uniform catalog mockups', () => {
  it('covers every product and color without changing prices or availability', () => {
    const colors = products.flatMap(product => product.variants || [product]);
    expect(colors).toHaveLength(14);
    for (const product of products) {
      const raw = rawProducts.find(item => item.slug === product.slug);
      expect(product.price).toBe(raw.price);
      expect(product.soldOut).toBe(raw.soldOut);
      expect(product.catalogMockup).toBe(true);
      expect(product.imagePrimary).toContain('/catalog/');
    }
    for (const variant of colors) {
      expect(variant.catalogMockup).toBe(true);
      expect(variant.imagePrimary).toContain('/catalog/');
      expect(variant.imageOriginal).not.toContain('/catalog/');
      expect(variant.imageSrcset).toContain('400w');
      expect(variant.imageSrcset).toContain('800w');
      expect(variant.imageSrcset).toContain('960w');
    }
  });

  it('ships all 22 views at matching dimensions with responsive copies', async () => {
    const views = Object.values(definitions).flatMap(item => [item.primary, item.secondary].filter(Boolean));
    expect(views).toHaveLength(22);
    expect(new Set(views.map(view => view.id)).size).toBe(22);
    for (const view of views) {
      for (const width of [400, 800, 960]) {
        const url = new URL(`../assets/catalog/${view.id}${width === 960 ? '' : `-${width}`}.webp`, import.meta.url);
        expect(fs.existsSync(url)).toBe(true);
        const metadata = await sharp(fileURLToPath(url)).metadata();
        expect(metadata.width).toBe(width);
        expect(metadata.height).toBe(Math.round(width * 4 / 3));
        expect(metadata.hasAlpha).toBe(true);
      }
    }
  });

  it('changes both views with the selected color and labels the Safe front correctly', () => {
    const product = products.find(item => item.slug === 'safe-zone-4-boy');
    for (const variant of product.variants) {
      const page = { product, activeVariant: variant };
      expect(ProductPage.computed.activeImageSecondary.call(page)).toBe(variant.imageSecondary);
      expect(variant.imageSecondary).toContain(`safe-boy-${variant.id}-front`);
      expect(ProductPage.computed.activePrimaryView.call(page)).toBe('back');
      expect(ProductPage.computed.activeSecondaryView.call(page)).toBe('front');
    }
    const camo = products.find(item => item.slug === 't-shirt-newgbonhi-camo');
    expect(ProductPage.computed.activeImageSecondary.call({ product: camo, activeVariant: camo.variants[1] })).toBe('');
  });

  it('keeps original artwork sources separate from showroom purchase images', () => {
    const pieces = Showroom.computed.pieces.call({ collection: 'all' });
    for (const piece of pieces) {
      expect(piece.image).not.toContain('/catalog/');
      expect(piece.catalogImage).toContain('/catalog/');
    }
  });
});
