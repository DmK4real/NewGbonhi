<template>
  <section class="showroom" :class="{ 'is-catalog-view': catalogView }" aria-labelledby="showroom-title">
    <h1 id="showroom-title" class="sr-only">NewGbonhi — Le showroom</h1>
    <div v-show="!catalogView" ref="sceneHost" class="room-scene" :class="{ 'is-loading': loading }"></div>
    <div v-if="loading && !catalogView" class="room-loading" role="status"><span>NG.</span><p>{{ copy.loading }}</p></div>
    <div class="room-topline"><span>ABIDJAN / CÔTE D’IVOIRE</span><span>NEWGBONHI · ART / CULTURE / COLLECTIF</span></div>
    <div class="room-view-switch" role="group" :aria-label="copy.displayMode">
      <button type="button" :aria-pressed="!catalogView" :disabled="sceneFailed" @click="setView('3d')">{{ copy.view3d }}</button>
      <button type="button" :aria-pressed="catalogView" @click="setView('catalog')">{{ copy.viewCatalog }}</button>
    </div>
    <p v-if="sceneFailed" class="room-fallback-note" role="status">{{ copy.fallback }}</p>
    <p class="room-invitation"><span v-if="catalogView">{{ copy.catalogHint }}</span><template v-else><span class="room-hint-desktop">{{ copy.explore }}</span><span class="room-hint-touch">{{ copy.exploreTouch }}</span></template><span class="room-count" role="status">{{ pieces.length }} {{ copy.pieces }}</span></p>
    <div v-if="hovered && !selected && !catalogView" class="room-hover" :style="hoverStyle"><strong>{{ hovered.label }}</strong><span>{{ price(hovered.product.price) }} · ↗</span></div>
    <p id="room-keyboard-help" class="sr-only">{{ copy.keyboardHelp }}</p>
    <div ref="rack" class="room-accessible" :class="{ 'is-fallback': sceneFailed && !catalogView, 'is-catalog': catalogView }" :aria-label="copy.rack" aria-describedby="room-keyboard-help" @keydown="navigatePieces" @scroll="syncFallbackNavigation">
      <button v-for="piece in pieces" :key="piece.key" type="button" class="room-piece" @focus="focusPiece(piece)" @click="openPiece(piece)">
        <img v-if="catalogView || sceneFailed" loading="lazy" decoding="async" :src="piece.catalogImage" :alt="piece.product.title" />
        <span class="room-piece-name">{{ piece.product.title }} {{ piece.variant?.label }}</span><span class="room-piece-price">{{ price(piece.product.price) }}</span>
      </button>
    </div>
    <div class="room-bottom">
      <button v-if="!catalogView" class="room-arrow" type="button" :disabled="loading || !navigation.canPrevious" :aria-label="copy.previous" @click="move(-1)">←</button>
      <nav class="room-tabs" :aria-label="copy.collections">
        <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: collection === tab.id }" :aria-pressed="collection === tab.id" @click="changeCollection(tab.id)">{{ tab.label }}</button>
      </nav>
      <button v-if="!catalogView" class="room-arrow" type="button" :disabled="loading || !navigation.canNext" :aria-label="copy.next" @click="move(1)">→</button>
    </div>
    <button v-if="!loading && !sceneFailed && !catalogView" type="button" class="room-artwork room-skates" :aria-pressed="artworkView" @click="toggleArtwork">{{ artworkView ? copy.backToRack : copy.artworkWall }} ↗</button>
    <button v-if="!loading && !sceneFailed && !catalogView" type="button" class="room-skates" :aria-pressed="skateView" @click="toggleSkates">{{ skateView ? copy.backToRack : copy.skateWall }} ↗</button>
    <RouterLink to="/collections" class="room-catalog">{{ copy.catalog }} ↗</RouterLink>
    <span class="room-edition" aria-hidden="true">ABIDJAN · NG. / CONCEPT STORE</span>
    <dialog ref="detail" class="room-detail" aria-labelledby="room-product-title" @click="closeOnBackdrop" @close="closeDetail">
      <template v-if="selected">
        <button type="button" class="room-close" :aria-label="$t('close')" @click="$refs.detail.close()">×</button>
        <div class="room-detail-image" :class="{ 'is-zoomed': imageZoomed }">
          <button type="button" class="room-image-toggle" :aria-label="imageZoomed ? copy.zoomOut : copy.zoomIn" :aria-pressed="imageZoomed" @click="imageZoomed = !imageZoomed">
            <img :src="activePhoto.src" :alt="`${selected.product.title} — ${activePhoto.label}`" :class="{ 'is-worn': activePhoto.worn }" /><span>{{ imageZoomed ? '−' : '+' }}</span>
          </button>
        </div>
        <div v-if="productPhotos.length > 1" class="room-photo-list" role="group" :aria-label="copy.productViews">
          <button v-for="(photo, index) in productPhotos" :key="photo.src" type="button" :aria-pressed="photoIndex === index" @click="selectPhoto(index)">
            <img :src="photo.src" :alt="photo.label" loading="lazy" decoding="async" /><span>{{ photo.label }}</span>
          </button>
        </div>
        <div v-if="!sceneFailed && !catalogView" class="room-inspect">
          <label>{{ copy.angle }}<input type="range" min="-45" max="45" step="1" :value="viewAngle" @input="inspectAngle($event.target.value)" /></label>
          <label>{{ copy.zoom }}<input type="range" min="0" max="1" step="0.05" :value="viewZoom" @input="inspectZoom($event.target.value)" /></label>
          <button type="button" @click="resetInspection">{{ copy.reset }}</button>
        </div>
        <div class="room-detail-copy">
          <p class="room-eyebrow">{{ selected.product.tags.includes('drop04') ? 'DROP 04 / CAMÉLÉON' : 'DROP 03 / NEWGBONHI × ARW FILM' }}</p>
          <h2 id="room-product-title">{{ selected.product.title }}</h2><p class="room-price">{{ price(selected.product.price) }}</p>
          <div v-if="selected.product.variants?.length" class="room-options"><span>{{ $t('color') }}</span><div><button v-for="variant in selected.product.variants" :key="variant.id" type="button" :aria-pressed="selected.variant?.id === variant.id" @click="selectVariant(variant)">{{ variant.label }}</button></div></div>
          <fieldset class="room-options"><legend>{{ $t('size') }}</legend><div><button v-for="size in selected.product.sizes" :key="size" type="button" :aria-pressed="selectedSize === size" @click="selectedSize = size">{{ size }}</button></div></fieldset>
          <details class="room-guide">
            <summary>{{ $t('fitGuide') }}</summary>
            <p>{{ $t('tshirtsFit') }}</p>
            <RouterLink to="/about#fit-guide" @click="$refs.detail.close()">{{ copy.fullGuide }} ↗</RouterLink>
          </details>
          <details v-if="selected.product.tags.includes('drop04')" class="room-guide">
            <summary>{{ $t('fabric') }} &amp; {{ $t('care') }}</summary>
            <p>{{ $t('fabricText') }}</p><p>{{ $t('careText') }}</p>
          </details>
          <div class="room-preorder"><strong>{{ $t('preorderProductTitle') }}</strong><p class="room-order-note">{{ $t('preorderProductCopy') }}</p></div>

          <RouterLink :to="selected.product.url" class="room-full-detail">{{ copy.details }} ↗</RouterLink>
        </div>
        <div class="room-purchase">
          <p class="room-purchase-summary" aria-live="polite"><strong>{{ price(selected.product.price) }}</strong><span>{{ [selected.variant?.label, selectedSize || $t('chooseSize')].filter(Boolean).join(' · ') }}</span></p>
          <button type="button" class="room-buy" :disabled="!selectedSize || selected.product.soldOut" @click="buy">{{ selected.product.soldOut ? $t('outOfStock') : $t(selectedSize ? 'addToCart' : 'chooseSize') }} <span>↗</span></button>
        </div>
      </template>
    </dialog>
  </section>
</template>

<script>
import { products } from '../data/products.ts';
import { cartStore } from '../data/cart.ts';
import { i18nState } from '../i18n.js';

const campaignPhotos = [
  new URL('../assets/webp/editorial/cameleon-worn-01-800.webp', import.meta.url).href,
  new URL('../assets/webp/editorial/cameleon-worn-02-800.webp', import.meta.url).href,
  new URL('../assets/webp/editorial/cameleon-worn-03-800.webp', import.meta.url).href,
  new URL('../assets/webp/editorial/cameleon-worn-04-800.webp', import.meta.url).href,
];
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
  data: () => ({ photoIndex: 0, view: '3d', collection: 'all', selected: null, selectedSize: null, loading: true, sceneFailed: false, hovered: null, hoverStyle: {}, imageZoomed: false, viewAngle: 0, viewZoom: 0, skateView: false, artworkView: false, navigation: { canPrevious: false, canNext: false } }),
  computed: {
    productPhotos() {
      if (!this.selected) return [];
      const { product, variant, catalogImage } = this.selected;
      const primaryView = variant?.imagePrimaryView || product.imagePrimaryView || 'front';
      const photos = [{ src: catalogImage, label: primaryView === 'back' ? this.copy.back : this.copy.front }];
      const secondary = variant?.imageSecondary || product.imageSecondary;
      if (secondary && secondary !== catalogImage) photos.push({ src: secondary, label: primaryView === 'back' ? this.copy.front : this.copy.back });
      if (product.slug === 't-shirt-newgbonhi-camo' && variant?.id === 'white') {
        photos.push(...campaignPhotos.map((src, index) => ({ src, label: `${this.copy.worn} ${index + 1}`, worn: true })));
      }
      return photos;
    },
    activePhoto() { return this.productPhotos[this.photoIndex] || this.productPhotos[0]; },
    catalogView() { return this.view === 'catalog' || this.sceneFailed; },
    copy() {
      return i18nState.language === 'fr' ? {
        keyboardHelp: 'Flèches gauche et droite pour parcourir les pièces, Début et Fin pour rejoindre les extrémités, Entrée pour ouvrir une pièce.', front: 'Avant', back: 'Arrière', worn: 'Porté', productViews: 'Vues du produit', displayMode: 'Affichage des pièces', view3d: 'Vue 3D', viewCatalog: 'Vue catalogue', catalogHint: 'Choisis une pièce pour voir les détails.', fallback: 'La 3D est indisponible. Explore les pièces en catalogue.', artworkWall: 'Le tableau NG', skateWall: 'Le mur skate', backToRack: 'Retour au portant', fullGuide: 'Voir le guide complet', pieces: 'pièces à découvrir', exploreTouch: 'Glisse pour explorer · Touche une pièce.', angle: 'Angle de vue', zoom: 'Rapprocher', reset: 'Réinitialiser', zoomIn: 'Agrandir la photo', zoomOut: 'Réduire la photo', loading: 'Ouverture du showroom…', rack: 'Pièces du showroom', previous: 'Pièces précédentes', next: 'Pièces suivantes', explore: 'Explore le portant. Clique sur ta pièce.', collections: 'Collections du showroom', catalog: 'Tout le catalogue', details: 'Voir la fiche complète', all: 'Le showroom',
      } : {
        keyboardHelp: 'Use left and right arrows to browse, Home and End to reach the first or last piece, and Enter to open a piece.', front: 'Front', back: 'Back', worn: 'Worn', productViews: 'Product views', displayMode: 'Product display', view3d: '3D view', viewCatalog: 'Catalog view', catalogHint: 'Select a piece to see the details.', fallback: '3D is unavailable. Explore the catalog instead.', artworkWall: 'The NG artwork', skateWall: 'The skate wall', backToRack: 'Back to the rail', fullGuide: 'View the full guide', pieces: 'pieces to explore', exploreTouch: 'Swipe to explore · Tap a piece.', angle: 'Viewing angle', zoom: 'Zoom in', reset: 'Reset', zoomIn: 'Enlarge photo', zoomOut: 'Reduce photo', loading: 'Opening the showroom…', rack: 'Showroom pieces', previous: 'Previous pieces', next: 'Next pieces', explore: 'Explore the rail. Select your piece.', collections: 'Showroom collections', catalog: 'Full collection', details: 'View full details', all: 'The showroom',
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
        onNavigate: state => { this.navigation = state; this.artworkView = state.artworkView; this.skateView = state.skateView; },
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
      this.$nextTick(() => this.syncFallbackNavigation());
      this.$refs.sceneHost?.replaceChildren();
    }
  },
  beforeUnmount() { this.sceneUnmounted = true; this.$refs.detail?.close(); this.scene?.dispose(); },
  methods: {
    focusPiece(piece) {
      if (this.catalogView) return;
      this.artworkView = false; this.skateView = false;
      this.scene?.focus?.(piece.key);
    },
    navigatePieces(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const buttons = Array.from(event.currentTarget.querySelectorAll('.room-piece'));
      const index = buttons.indexOf(event.target);
      if (index < 0) return;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)));
      event.preventDefault(); buttons[next].focus();
    },
    selectPhoto(index) {
      if (!Number.isInteger(index) || index < 0 || index >= this.productPhotos.length) return;
      this.photoIndex = index; this.imageZoomed = false;
    },
    setView(view) {
      if (!['3d', 'catalog'].includes(view) || (view === '3d' && this.sceneFailed)) return;
      this.view = view; this.hovered = null;
      this.artworkView = false; this.skateView = false;
      this.scene?.showArtwork?.(false);
      this.scene?.showSkates?.(false);
      if (this.$refs.rack) this.$refs.rack.scrollTop = 0;
    },
    toggleArtwork() { this.skateView = false; this.artworkView = !this.artworkView; this.scene?.showArtwork(this.artworkView); },
    toggleSkates() { this.artworkView = false; this.skateView = !this.skateView; this.scene?.showSkates(this.skateView); },
    inspectAngle(value) { this.viewAngle = Number(value); this.scene?.inspect?.(this.viewAngle, this.viewZoom); },
    inspectZoom(value) { this.viewZoom = Number(value); this.scene?.inspect?.(this.viewAngle, this.viewZoom); },
    resetInspection() { this.photoIndex = 0; this.imageZoomed = false; this.viewAngle = 0; this.viewZoom = 0; this.scene?.inspect?.(0, 0); },
    price(value) { return `${new Intl.NumberFormat('fr-CI').format(value)} FCFA`; },
    syncFallbackNavigation() {
      if (!this.sceneFailed) return;
      const rack = this.$refs.rack;
      this.navigation = { canPrevious: rack.scrollLeft > 1, canNext: rack.scrollLeft + rack.clientWidth < rack.scrollWidth - 1 };
    },
    move(direction) {
      this.artworkView = false; this.skateView = false;
      if (this.sceneFailed) {
        this.$refs.rack.scrollBy({ left: direction * 250, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      } else this.scene?.move(direction);
    },
    changeCollection(id) { this.artworkView = false; this.skateView = false; this.collection = id; this.scene?.filter(this.pieces); this.$refs.rack.scrollLeft = 0; this.$nextTick(() => this.syncFallbackNavigation()); },
    openPiece(piece) { this.artworkView = false; this.skateView = false; this.selected = piece; this.resetInspection(); this.selectedSize = null; this.scene?.select(piece.key); this.$nextTick(() => this.$refs.detail.showModal()); },
    selectVariant(variant) { const piece = inventory.find(p => p.product.slug === this.selected.product.slug && p.variant?.id === variant.id); if (piece) { this.selected = piece; this.resetInspection(); this.scene?.select(piece.key); } },
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
.showroom{align-self:center;max-width:none;margin-left:0;margin-top:-32px;background:#514c48;color:#f5f6f8}
.showroom :is(button,a):focus-visible{outline-color:#ed2027}
.room-invitation{color:#e1e3e7}
.room-tabs{background:#15171bcc;border-color:#ffffff28;box-shadow:0 4px 20px #0002,inset 0 1px 0 #ffffff0d}
.room-tabs button{color:#f4f5f7}.room-tabs button.active{background:#d71920;color:#fff}
.room-arrow{background:#17191d99;border-color:#ffffff35;color:#fff}.room-arrow:hover{background:#34373d}
.room-catalog{color:#f5f6f8}.room-hover{background:#17191df2;color:#fff}
.room-loading{background:#514c48;color:#fff}.room-piece:focus{border-color:#ed2027}
.is-fallback .room-piece{color:#fff}
.room-detail{background:#fafbfdf5;color:#22252a;border-color:#ffffff80}.room-close{background:#e7e9ed;color:#272a30}
.room-eyebrow,.room-order-note,.room-full-detail{color:#696e77}.room-options button{border-color:#d4d7dd}
.room-options button[aria-pressed=true]{background:#272a30;border-color:#272a30}.room-buy{background:#d71920}
.room-buy:disabled{background:#e2e4e8;color:#7c828d}
@media(max-width:700px){.showroom{margin-top:-24px}}
@media(prefers-reduced-motion:reduce){.room-loading p{animation:none}.room-tabs button{transition:none}}
.room-detail-image{display:block;background:#eceef0;padding:18px 40px 8px;overflow:hidden}
.room-image-toggle{display:block;position:relative;width:100%;padding:0;border:0;background:transparent;cursor:zoom-in!important}
.room-image-toggle img{display:block;width:100%;height:180px;object-fit:contain;transition:transform .25s;transform-origin:center 40%}
.room-image-toggle span{position:absolute;right:-24px;bottom:0;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#fff;color:#222;font-size:20px}
.is-zoomed .room-image-toggle{cursor:zoom-out!important}.is-zoomed img{transform:scale(2)}
.room-inspect{padding:14px 25px 0;display:flex;flex-wrap:wrap;gap:12px;color:#333}
.room-inspect label{flex:1;min-width:100px;font-size:11px}.room-inspect input{display:block;width:100%;margin:10px 0 0;accent-color:#d71920}
.room-inspect button{border:0;padding:4px 0;background:transparent;text-decoration:underline;color:#696e77;font-size:10px;align-self:end}
@media(max-width:600px){.room-detail{max-height:62dvh}.room-detail-image{padding-top:12px}.room-image-toggle img{height:130px}.room-detail-copy{padding-top:16px}}
@media(prefers-reduced-motion:reduce){.room-image-toggle img{transition:none}}
.room-count{display:block;margin-top:8px;font:9px monospace;letter-spacing:.6px;opacity:.75}
.room-hint-touch{display:none}.room-arrow:disabled{opacity:.3;cursor:default;background:#17191d99}
@media(pointer:coarse){.room-hint-desktop{display:none}.room-hint-touch{display:inline}.room-arrow{width:44px;height:44px;flex-shrink:0}}
@media(max-width:600px){.room-invitation{bottom:110px}.room-bottom{gap:4px}.room-tabs button{padding-left:10px;padding-right:10px}}
@media(max-width:359px){.room-tabs button{padding-left:7px;padding-right:7px;font-size:9px}}
.room-guide{border-top:1px solid #d4d7dd;padding:13px 0;color:#33383f;font-size:11px;line-height:1.6}
.room-guide summary{cursor:pointer;font-weight:600}.room-guide p{margin:10px 0}.room-guide a{color:inherit;text-underline-offset:3px}
.room-preorder{margin-top:12px;padding:14px;border-left:3px solid #d71920;background:#f0e9e7}
.room-preorder strong{font-size:11px;line-height:1.5;display:block}.room-preorder .room-order-note{margin:7px 0 0;color:#555a62}
.room-purchase{position:sticky;bottom:0;padding:14px 25px 20px;background:#fafbfd;border-top:1px solid #e2e4e8;z-index:2}
.room-purchase-summary{display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin:0 0 10px;font-size:11px;color:#22252a}.room-purchase-summary span{text-align:right;color:#696e77}
.room-detail-copy{padding-bottom:16px}.room-options button{min-height:40px}
@media(pointer:coarse){.room-options button{min-width:44px;min-height:44px}.room-guide summary{padding:5px 0}.room-buy{min-height:46px}}
@media(max-width:600px){.room-purchase{padding:12px 22px max(14px,env(safe-area-inset-bottom))}}
.room-skates{position:absolute;right:36px;top:66px;border:1px solid #ffffff4a;border-radius:20px;background:#17191dbd;color:#fff;padding:11px 16px;font-size:11px!important;backdrop-filter:blur(8px)}
.room-skates[aria-pressed=true]{border-color:#ed2027;background:#9b171ccc}
@media(max-width:600px){.room-skates{top:55px;right:22px;min-height:44px}}
.room-artwork{left:36px;right:auto}
@media(max-width:600px){.room-artwork{left:22px;right:auto}}
.room-view-switch{position:absolute;top:66px;left:50%;transform:translateX(-50%);z-index:7;display:flex;gap:3px;padding:4px;border:1px solid #ffffff35;border-radius:26px;background:#17191de8}
.room-view-switch button{border:0;border-radius:22px;background:transparent;color:#ddd;padding:10px 15px;font-size:11px;min-height:40px}.room-view-switch button[aria-pressed=true]{background:#f2eee5;color:#222}.room-view-switch button:disabled{opacity:.35;cursor:default}
.room-accessible.is-catalog{position:absolute;inset:135px 36px 155px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));align-content:start;gap:20px;overflow:auto;padding:8px;scrollbar-width:thin}
.room-accessible.is-catalog .room-piece:not(:focus),.room-accessible.is-catalog .room-piece{position:relative;left:auto;top:auto;width:auto;height:auto;overflow:visible;clip-path:none;white-space:normal;max-width:none;padding:16px;border:1px solid #ffffff24;border-radius:12px;background:#f3f0e9;color:#242424;text-align:left}
.is-catalog .room-piece img{display:block;width:100%;height:210px;object-fit:contain;margin-bottom:14px}.room-piece-name{display:block;font-size:11px;line-height:1.5}.room-piece-price{display:block;font-size:11px;margin-top:7px;opacity:.7}
.room-fallback-note{position:absolute;top:110px;left:20px;right:20px;text-align:center;font-size:11px}.is-catalog-view .room-invitation{bottom:100px}.is-catalog-view .room-edition{display:none}
@media(max-width:600px){.room-skates{top:110px}.room-view-switch{top:55px;white-space:nowrap}.room-accessible.is-catalog{inset:125px 12px 150px;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:4px}.is-catalog .room-piece img{height:150px}.room-accessible.is-catalog .room-piece{padding:12px}.room-fallback-note{top:100px;font-size:10px}}
.room-photo-list{display:flex;gap:8px;overflow-x:auto;padding:12px 18px;scrollbar-width:thin;background:#eceef0}
.room-photo-list button{flex:0 0 64px;padding:3px;border:1px solid transparent;border-radius:6px;background:#fafbfd;color:#34373d;font-size:9px}.room-photo-list button[aria-pressed=true]{border-color:#d71920}.room-photo-list img{display:block;width:58px;height:58px;object-fit:contain}.room-photo-list span{display:block;margin:4px 0}.room-image-toggle img.is-worn{object-fit:cover;border-radius:4px}
.room-piece:focus-visible{outline:2px solid #ed2027;outline-offset:3px}.room-accessible.is-catalog .room-piece:focus-visible{border-color:#d71920;box-shadow:0 0 0 3px #d7192030}
@media(max-width:600px){
  .room-detail{max-height:82dvh}
  .room-detail-image{padding:10px 38px 6px}
  .room-image-toggle img{height:115px}
  .room-photo-list{padding:8px 16px;gap:7px}
  .room-photo-list button{flex-basis:54px;min-height:64px}
  .room-photo-list img{width:48px;height:42px}
  .room-detail-copy{padding-top:14px}
  .room-detail h2{margin:8px 0;font-size:20px}
  .room-invitation{padding:0 20px}
}
@media(max-width:700px){
  .showroom:not(.is-catalog-view){height:clamp(460px,calc(100vw + 110px),600px);min-height:0;max-height:none}
  .showroom:not(.is-catalog-view) .room-scene{top:105px;bottom:110px}
  .showroom:not(.is-catalog-view) .room-topline{top:18px}
  .showroom:not(.is-catalog-view) .room-catalog{left:20px;right:auto;bottom:23px}
  .showroom:not(.is-catalog-view) .room-invitation{bottom:98px;font-size:10px;margin:0}
  .showroom:not(.is-catalog-view) .room-count{margin-top:3px}
  .showroom:not(.is-catalog-view) .room-bottom{bottom:49px}
  .showroom:not(.is-catalog-view) .room-skates{top:98px;z-index:2;font-size:9px!important;padding:5px 10px;min-height:32px}
  .showroom:not(.is-catalog-view) .room-view-switch{top:43px}
}
</style>
