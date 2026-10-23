<template>
  <section class="showroom" aria-labelledby="showroom-title">
    <h1 id="showroom-title" class="sr-only">NewGbonhi — Le showroom</h1>
    <div ref="sceneHost" class="room-scene" :class="{ 'is-loading': loading }"></div>
    <div v-if="loading" class="room-loading" role="status"><span>NG.</span><p>{{ copy.loading }}</p></div>
    <div class="room-topline"><span>ABIDJAN / CÔTE D’IVOIRE</span><span>NEWGBONHI · VIRTUAL STORE</span></div>
    <p class="room-invitation">{{ copy.explore }}</p>
    <div v-if="hovered && !selected" class="room-hover" :style="hoverStyle"><strong>{{ hovered.label }}</strong><span>{{ price(hovered.product.price) }} · ↗</span></div>
    <div ref="rack" class="room-accessible" :class="{ 'is-fallback': sceneFailed }" :aria-label="copy.rack">
      <button v-for="piece in pieces" :key="piece.key" type="button" class="room-piece" @click="openPiece(piece)">
        <img v-if="sceneFailed" :src="piece.catalogImage" :alt="piece.product.title" />
        {{ piece.product.title }} {{ piece.variant?.label }} — {{ price(piece.product.price) }}
      </button>
    </div>
    <div class="room-bottom">
      <button class="room-arrow" type="button" :aria-label="copy.previous" @click="move(-1)">←</button>
      <nav class="room-tabs" :aria-label="copy.collections">
        <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: collection === tab.id }" :aria-pressed="collection === tab.id" @click="changeCollection(tab.id)">{{ tab.label }}</button>
      </nav>
      <button class="room-arrow" type="button" :aria-label="copy.next" @click="move(1)">→</button>
    </div>
    <RouterLink to="/collections" class="room-catalog">{{ copy.catalog }} ↗</RouterLink>
    <span class="room-edition" aria-hidden="true">COLLECTION 001 / NG.</span>
    <dialog ref="detail" class="room-detail" aria-labelledby="room-product-title" @click="closeOnBackdrop" @close="closeDetail">
      <template v-if="selected">
        <button type="button" class="room-close" :aria-label="$t('close')" @click="$refs.detail.close()">×</button>
        <div class="room-detail-image"><img :src="selected.catalogImage" :alt="selected.product.title" /></div>
        <div class="room-detail-copy">
          <p class="room-eyebrow">{{ selected.product.tags.includes('drop04') ? 'DROP 04 / CAMÉLÉON' : 'DROP 03 / NEWGBONHI × ARW FILM' }}</p>
          <h2 id="room-product-title">{{ selected.product.title }}</h2><p class="room-price">{{ price(selected.product.price) }}</p>
          <div v-if="selected.product.variants?.length" class="room-options"><span>{{ $t('color') }}</span><div><button v-for="variant in selected.product.variants" :key="variant.id" type="button" :aria-pressed="selected.variant?.id === variant.id" @click="selectVariant(variant)">{{ variant.label }}</button></div></div>
          <fieldset class="room-options"><legend>{{ $t('size') }}</legend><div><button v-for="size in selected.product.sizes" :key="size" type="button" :aria-pressed="selectedSize === size" @click="selectedSize = size">{{ size }}</button></div></fieldset>
          <p class="room-order-note">{{ $t('preorderProductCopy') }}</p>
          <button type="button" class="room-buy" :disabled="!selectedSize || selected.product.soldOut" @click="buy">{{ selected.product.soldOut ? $t('outOfStock') : $t(selectedSize ? 'addToCart' : 'chooseSize') }} <span>↗</span></button>
          <RouterLink :to="selected.product.url" class="room-full-detail">{{ copy.details }} ↗</RouterLink>
        </div>
      </template>
    </dialog>
  </section>
</template>

<script>
import { products } from '../data/products.ts';
import { cartStore } from '../data/cart.ts';
import { i18nState } from '../i18n.js';

const camoWhite = new URL('../assets/webp/NEW GBONHI CAMO TEE WHITE CUTOUT.webp', import.meta.url).href;
const cottonPhotos = {
  black: new URL('../assets/showroom/cotton-black.webp', import.meta.url).href,
  white: new URL('../assets/showroom/cotton-white.webp', import.meta.url).href,
  washed: new URL('../assets/showroom/cotton-washed.webp', import.meta.url).href,
};
function fabricStyle(product, variant) {
  if (['arw-film-logo-tee', 'arw-film-dopamine-tee'].includes(product.slug)) return 'washed';
  return variant?.id === 'white' || product.slug.endsWith('-white') ? 'white' : 'black';
}
function printRegion(product) {
  if (product.slug === 'arw-film-logo-tee') return [.27, .16, .74, .43];
  if (product.slug === 'arw-film-dopamine-tee') return [.27, .17, .73, .80];
  if (product.slug.startsWith('arw-film-city')) return [.25, .17, .76, .40];
  return [.28, .17, .74, .57];
}
const capsule = products.filter(product => !product.soldOut && product.category === 't-shirts');
const inventory = capsule.flatMap(product => (product.variants?.length ? product.variants : [null]).map(variant => ({
  key: `${product.slug}-${variant?.id || 'main'}`, product, variant,
  image: product.slug === 't-shirt-newgbonhi-camo' && variant?.id === 'white' ? camoWhite : variant?.imageOriginal || product.imageOriginal || product.imagePrimary,
  catalogImage: variant?.imagePrimary || product.imagePrimary,
  fabricImage: cottonPhotos[fabricStyle(product, variant)],
  whiteFabric: fabricStyle(product, variant) === 'white',
  printRegion: printRegion(product),
  label: product.title.replace('T-SHIRT NEWGBONHI ', '').replace('ARW FILM ', ''),
})));

export default {
  name: 'Showroom',
  emits: ['open-cart'],
  data: () => ({ collection: 'all', selected: null, selectedSize: null, loading: true, sceneFailed: false, hovered: null, hoverStyle: {} }),
  computed: {
    copy() {
      return i18nState.language === 'fr' ? {
        loading: 'Ouverture du showroom…', rack: 'Pièces du showroom', previous: 'Pièces précédentes', next: 'Pièces suivantes', explore: 'Explore le portant. Clique sur ta pièce.', collections: 'Collections du showroom', catalog: 'Tout le catalogue', details: 'Voir la fiche complète', all: 'Le showroom',
      } : {
        loading: 'Opening the showroom…', rack: 'Showroom pieces', previous: 'Previous pieces', next: 'Next pieces', explore: 'Explore the rail. Select your piece.', collections: 'Showroom collections', catalog: 'Full collection', details: 'View full details', all: 'The showroom',
      };
    },
    tabs() { return [{ id: 'all', label: this.copy.all, count: inventory.length }, { id: 'drop04', label: 'Caméléon', count: inventory.filter(p => p.product.tags.includes('drop04')).length }, { id: 'drop03', label: 'ARW Film', count: inventory.filter(p => p.product.tags.includes('drop03')).length }]; },
    pieces() { return inventory.filter(p => this.collection === 'all' || p.product.tags.includes(this.collection)); },
  },
  async mounted() {
    try {
      const { createShowroomScene } = await import('./showroomScene.js');
      if (this.sceneUnmounted) return;
      const scene = await createShowroomScene(this.$refs.sceneHost, {
        pieces: inventory,
        onSelect: piece => this.openPiece(piece),
        onHover: (piece, x, y) => {
          this.hovered = piece;
          if (piece) {
            const bounds = this.$el.getBoundingClientRect();
            this.hoverStyle = { left: `${Math.min(x - bounds.left + 18, bounds.width - 195)}px`, top: `${y - bounds.top - 65}px` };
          }
        },
      });
      if (this.sceneUnmounted) { scene.dispose(); return; }
      this.scene = scene;
      scene.filter(this.pieces);
      this.loading = false;
    } catch (error) {
      console.error('Showroom unavailable', error);
      this.loading = false;
      this.sceneFailed = true;
      this.$refs.sceneHost?.replaceChildren();
    }
  },
  beforeUnmount() { this.sceneUnmounted = true; this.$refs.detail?.close(); this.scene?.dispose(); },
  methods: {
    price(value) { return `${new Intl.NumberFormat('fr-CI').format(value)} FCFA`; },
    move(direction) { this.scene?.move(direction); },
    changeCollection(id) { this.collection = id; this.scene?.filter(this.pieces); this.$refs.rack.scrollLeft = 0; },
    openPiece(piece) { this.selected = piece; this.selectedSize = null; this.scene?.select(piece.key); this.$nextTick(() => this.$refs.detail.showModal()); },
    selectVariant(variant) { const piece = inventory.find(p => p.product.slug === this.selected.product.slug && p.variant?.id === variant.id); if (piece) { this.selected = piece; this.scene?.select(piece.key); } },
    closeDetail() { this.selected = null; this.hovered = null; this.scene?.select(null); },
    closeOnBackdrop(event) { if (event.target !== this.$refs.detail) return; const r = event.target.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close(); },
    buy() {
      if (!this.selected || this.selected.product.soldOut || !this.selected.product.sizes.includes(this.selectedSize)) return;
      const { product, variant } = this.selected;
      cartStore.addToCart({ ...product, selectedSize: this.selectedSize, selectedColor: variant?.label || null, selectedColorId: variant?.id || null, imagePrimary: variant?.imagePrimary || product.imagePrimary, preorder: true });
      this.$refs.detail.close();
      this.$emit('open-cart');
    },
  },
};
</script>

<style scoped>
.showroom{--ink:#282925;--lime:#32382c;position:relative;isolation:isolate;overflow:hidden;background:#dfded7;color:var(--ink);width:100vw;margin-left:calc(50% - 50vw);height:calc(100svh - 78px);min-height:650px;max-height:1100px;font-family:Arial,sans-serif}
.showroom button,.showroom a{-webkit-tap-highlight-color:transparent}.showroom button{font:inherit;cursor:pointer}.showroom :is(button,a):focus-visible{outline:2px solid #525d44;outline-offset:4px}
.room-scene{position:absolute;inset:0}.room-scene :deep(canvas){display:block;width:100%;height:100%;touch-action:pan-y;outline:none}.room-topline{position:absolute;top:30px;left:36px;right:36px;display:flex;justify-content:space-between;gap:20px;font:9px monospace;letter-spacing:1.4px;opacity:.6;pointer-events:none}.room-invitation{position:absolute;bottom:102px;left:0;right:0;text-align:center;font-size:11px;letter-spacing:.2px;pointer-events:none;color:#51524a}.room-bottom{position:absolute;bottom:36px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:14px;white-space:nowrap}.room-tabs{display:flex;gap:3px;background:#fff9;border:1px solid #ffffffa8;box-shadow:0 4px 20px #37362d0c,inset 0 1px 0 #fff;border-radius:32px;padding:5px;backdrop-filter:blur(12px)}.room-tabs button{border:0;background:transparent;padding:12px 21px;border-radius:25px;font-size:11px;color:var(--ink);transition:background .2s}.room-tabs button.active{background:#292c28;color:#fff}.room-arrow{border:1px solid #8e8d804a;background:#f8f7ef66;color:var(--ink);width:35px;height:35px;border-radius:50%;font-size:16px!important}.room-arrow:hover{background:#fff9}.room-catalog{position:absolute;right:36px;bottom:53px;color:var(--ink);font-size:10px;text-decoration:none}.room-edition{position:absolute;left:36px;bottom:53px;font:8px monospace;letter-spacing:1.2px;opacity:.55}.room-hover{position:absolute;z-index:2;background:#fffffff2;padding:12px 16px;border-radius:4px;pointer-events:none;box-shadow:0 4px 20px #00000009;min-width:145px}.room-hover strong,.room-hover span{display:block;font-size:10px}.room-hover span{font:9px monospace;margin-top:5px;opacity:.6}
.room-accessible:not(.is-fallback){position:absolute;left:15px;top:60px;z-index:5}.room-accessible:not(.is-fallback) .room-piece:not(:focus){position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;padding:0;border:0}.room-piece:focus{padding:15px;background:#fff;border:1px solid #777;color:#222;max-width:300px}.is-fallback{position:absolute;inset:80px 20px 150px;display:flex;gap:20px;overflow:auto;align-items:center}.is-fallback .room-piece{flex:0 0 230px;background:transparent;color:var(--ink);border:0;font-size:11px}.is-fallback img{width:100%;height:240px;object-fit:contain}
.room-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#dfded7;z-index:6}.room-loading>span{font-size:48px;letter-spacing:-5px;font-weight:900}.room-loading p{font:10px monospace;letter-spacing:1px;margin-top:15px;animation:pulse 1.5s ease infinite}@keyframes pulse{50%{opacity:.4}}
.room-detail{position:fixed;inset:auto 28px auto auto;top:50%;transform:translateY(-50%);border:1px solid #fff9;border-radius:14px;padding:0;margin:0;width:340px;max-height:calc(100dvh - 130px);background:#fafaf6ed;color:var(--ink);box-shadow:0 15px 55px #302f2426;overflow:auto;backdrop-filter:blur(16px)}.room-detail::backdrop{background:#29291d05}.room-close{color:var(--ink);position:absolute;right:12px;top:11px;z-index:3;border:0;background:#e8e8e0a8;border-radius:50%;width:28px;height:28px;font-size:21px!important;line-height:1}.room-detail-image{display:none}.room-detail-copy{padding:32px 25px 24px}.room-eyebrow{font:8px monospace;letter-spacing:1px;color:#77796e}.room-detail h2{font-size:25px;line-height:1.05;letter-spacing:-.8px;margin:16px 0 10px}.room-price{font-size:14px;margin:0 0 25px}.room-options{border:0;padding:0;margin:18px 0;min-width:0}.room-options>span,.room-options legend{font-size:10px;padding:0;margin-bottom:9px;display:block}.room-options>div{display:flex;flex-wrap:wrap;gap:6px}.room-options button{background:transparent;color:var(--ink);border:1px solid #d4d5cb;border-radius:5px;min-width:39px;padding:10px;font-size:11px}.room-options button[aria-pressed=true]{background:#30332d;color:#fff;border-color:#30332d}.room-order-note{font-size:10px;line-height:1.7;color:#73756a;margin:20px 0}.room-buy{width:100%;padding:15px;border:0;border-radius:25px;background:#3b5935;color:#fff;text-align:center;font-size:11px!important}.room-buy span{margin-left:10px}.room-buy:disabled{background:#e1e3d9;color:#818576;cursor:default}.room-full-detail{display:block;text-align:center;color:#666c5d;margin-top:16px;font-size:10px;text-underline-offset:4px}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@media(max-width:900px){.room-edition{display:none}.room-catalog{right:22px;bottom:20px}.room-topline{left:22px;right:22px;font-size:8px}.room-topline>span:last-child{display:none}}
@media(max-width:600px){.showroom{height:calc(100svh - 66px);min-height:630px;max-height:950px}.room-topline{top:24px}.room-bottom{bottom:38px;gap:7px}.room-tabs{padding:4px}.room-tabs button{padding:11px 13px;font-size:10px}.room-arrow{width:28px;height:28px}.room-catalog{font-size:9px;right:20px;bottom:16px}.room-invitation{bottom:95px;font-size:10px}.room-detail{inset:auto 12px 18px 12px;top:auto;transform:none;width:auto;max-height:53dvh}.room-detail-copy{padding:22px}.room-detail h2{font-size:20px;max-width:80%;margin:10px 0}.room-price{margin-bottom:12px}.room-options{margin:12px 0}.room-options button{padding:8px}.room-order-note{margin:12px 0;font-size:9px}.room-eyebrow{font-size:7px}.room-full-detail{margin-top:12px}}
.showroom{align-self:center;max-width:none;margin-left:0;margin-top:-32px;background:#555960;color:#f5f6f8}
.showroom :is(button,a):focus-visible{outline-color:#ed2027}
.room-invitation{color:#e1e3e7}
.room-tabs{background:#15171bcc;border-color:#ffffff28;box-shadow:0 4px 20px #0002,inset 0 1px 0 #ffffff0d}
.room-tabs button{color:#f4f5f7}.room-tabs button.active{background:#d71920;color:#fff}
.room-arrow{background:#17191d99;border-color:#ffffff35;color:#fff}.room-arrow:hover{background:#34373d}
.room-catalog{color:#f5f6f8}.room-hover{background:#17191df2;color:#fff}
.room-loading{background:#555960;color:#fff}.room-piece:focus{border-color:#ed2027}
.is-fallback .room-piece{color:#fff}
.room-detail{background:#fafbfdf5;color:#22252a;border-color:#ffffff80}.room-close{background:#e7e9ed;color:#272a30}
.room-eyebrow,.room-order-note,.room-full-detail{color:#696e77}.room-options button{border-color:#d4d7dd}
.room-options button[aria-pressed=true]{background:#272a30;border-color:#272a30}.room-buy{background:#d71920}
.room-buy:disabled{background:#e2e4e8;color:#7c828d}
@media(max-width:700px){.showroom{margin-top:-24px}}
@media(prefers-reduced-motion:reduce){.room-loading p{animation:none}.room-tabs button{transition:none}}
</style>
