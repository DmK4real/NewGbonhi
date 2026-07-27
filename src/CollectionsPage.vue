<template>
  <div class="collections-page">
    <SiteHeader @toggle-cart="cartOpen = !cartOpen" />
    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <main>
      <header class="collections-hero">
        <div class="collections-index">
          <span>ARCHIVE / {{ String(collectionProducts.length).padStart(2, "0") }} OBJECTS</span>
          <span>ABIDJAN / CURRENT CATALOGUE</span>
        </div>
        <div class="collections-heading">
          <div>
            <p>{{ $t("navCollections") }}</p>
            <h1>TOUS LES<br />DROPS</h1>
          </div>
          <p>Les pièces NewGbonhi réunies dans un catalogue unique : Drop 04, collaborations et archives.</p>
        </div>
      </header>

      <nav class="drop-tabs" aria-label="Filtrer les collections">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :class="{ active: activeTab === tab.id }"
          :aria-pressed="activeTab === tab.id"
          @click="activeTab = tab.id"
        >
          <span>{{ tab.number }}</span>{{ tab.label }}
        </button>
      </nav>

      <section class="collection-grid" aria-live="polite">
        <div class="collection-meta">
          <span>{{ activeLabel }}</span>
          <strong>{{ filteredProducts.length.toString().padStart(2, "0") }} PIÈCES</strong>
        </div>
        <ProductGrid :products="filteredProducts" currency="XOF" locale="fr-CI" @add-to-cart="addToCart" />
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script>
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";
import CartPanel from "./components/CartPanel.vue";
import ProductGrid from "./components/ProductGrid.vue";
import { products } from "./data/products.ts";
import { cartStore } from "./data/cart.ts";

const arwExclusiveSlugs = new Set([
  "arw-film-dopamine-tee",
  "arw-film-logo-tee",
]);

export default {
  name: "CollectionsPage",
  components: { SiteHeader, SiteFooter, CartPanel, ProductGrid },
  data() {
    return {
      products,
      cartOpen: false,
      activeTab: "all",
      tabs: [
        { id: "all", number: "00", label: "TOUT" },
        { id: "drop04", number: "04", label: "DROP 04" },
        { id: "drop03", number: "03", label: "DROP 03" },
        { id: "archive", number: "A", label: "ARCHIVES" },
      ],
    };
  },
  computed: {
    collectionProducts() {
      return this.products.filter((product) => !arwExclusiveSlugs.has(product.slug));
    },
    filteredProducts() {
      if (this.activeTab === "all") return this.collectionProducts;
      if (this.activeTab === "archive") {
        return this.collectionProducts.filter((product) => !product.tags?.includes("drop03") && !product.tags?.includes("drop04"));
      }
      return this.collectionProducts.filter((product) => product.tags?.includes(this.activeTab));
    },
    activeLabel() {
      return this.tabs.find((tab) => tab.id === this.activeTab)?.label || "TOUT";
    },
  },
  methods: {
    addToCart(product) {
      cartStore.addToCart({ ...product, preorder: true });
      this.cartOpen = true;
    },
  },
};
</script>

<style scoped>
:global(*) { box-sizing: border-box; }
.collections-page { --text:#0b0b0b; --muted:#626262; --accent:#e10600; --line:#0b0b0b; max-width:1200px; margin:0 auto; padding:32px 24px 48px; color:var(--text); }
.collections-page::before { content:""; position:fixed; inset:0; z-index:-1; background:repeating-linear-gradient(90deg,rgba(0,0,0,.04),rgba(0,0,0,.04) 1px,transparent 1px,transparent 48px),repeating-linear-gradient(0deg,rgba(0,0,0,.04),rgba(0,0,0,.04) 1px,transparent 1px,transparent 48px); }
main { margin-top:32px; }
.collections-hero { padding:clamp(26px,5vw,58px); border:1px solid var(--line); background:#f5f5f1; }
.collections-index { padding-bottom:16px; border-bottom:1px solid; display:flex; justify-content:space-between; gap:18px; font:700 9px/1.3 monospace; letter-spacing:.15em; }
.collections-heading { padding-top:clamp(34px,7vw,84px); display:grid; grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr); align-items:end; gap:clamp(28px,6vw,80px); }
.collections-heading p { margin:0; }
.collections-heading > div > p { color:var(--accent); font:700 10px/1 monospace; letter-spacing:.2em; text-transform:uppercase; }
.collections-heading h1 { margin:16px 0 0; font-family:"Archivo Black","Space Grotesk",sans-serif; font-size:clamp(46px,8vw,100px); line-height:.84; letter-spacing:-.055em; }
.collections-heading > p { max-width:440px; color:var(--muted); font-size:clamp(15px,1.7vw,20px); line-height:1.6; }
.drop-tabs { display:grid; grid-template-columns:repeat(4,1fr); border-inline:1px solid; border-bottom:1px solid; }
.drop-tabs button { min-height:64px; padding:14px 18px; border:0; border-right:1px solid; background:#fff; display:flex; align-items:center; gap:14px; font:700 10px/1 sans-serif; letter-spacing:.14em; cursor:pointer; }
.drop-tabs button:last-child { border-right:0; }
.drop-tabs button span { color:var(--accent); font-family:monospace; }
.drop-tabs button.active { background:#0b0b0b; color:#fff; }
.collection-grid { padding-top:var(--ng-space-section); }
.collection-meta { margin-bottom:22px; padding-bottom:14px; border-bottom:1px solid; display:flex; justify-content:space-between; gap:20px; font:700 9px/1 monospace; letter-spacing:.15em; }
.collection-meta span { color:var(--accent); }
@media (max-width:700px) {
  .collections-page { width:100%; padding:20px 14px 36px; overflow-x:clip; }
  main { margin-top:22px; }
  .collections-hero { padding:24px 18px; }
  .collections-index { align-items:flex-start; flex-direction:column; }
  .collections-heading { padding-top:42px; grid-template-columns:1fr; gap:24px; }
  .collections-heading h1 { font-size:clamp(42px,15vw,60px); line-height:.88; }
  .drop-tabs { grid-template-columns:repeat(2,1fr); }
  .drop-tabs button:nth-child(2) { border-right:0; }
  .drop-tabs button:nth-child(-n+2) { border-bottom:1px solid; }
  .drop-tabs button { min-width:0; min-height:54px; padding:12px; font-size:9px; }
}
</style>
