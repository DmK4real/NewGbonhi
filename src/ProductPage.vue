<template>
  <div class="product-page">
    <SiteHeader @toggle-cart="toggleCart" />

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <section v-if="product" class="product-hero">
      <div class="product-gallery">
        <div class="product-gallery-index">
          <span>OBJECT / {{ String(product.id || 1).padStart(3, "0") }}</span>
          <span>ABIDJAN / {{ isDrop04Product ? "DROP 04" : "DROP 03" }}</span>
        </div>
        <div class="product-media" :class="{ 'is-cutout': isCutoutProduct }">
        <div
          v-if="isDualViewProduct && activeImagePrimary && activeImageSecondary"
          class="product-dual-view"
        >
          <img
            :src="activeImagePrimary"
            :alt="`${product.title} front`"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
          <img
            :src="activeImageSecondary"
            :alt="`${product.title} back`"
            loading="lazy"
            decoding="async"
          />
        </div>
        <picture v-else-if="activeImagePrimary" class="product-picture">
          <source
            v-if="activeImageWebp"
            :srcset="activeImageWebp"
            type="image/webp"
          />
          <img
            :src="activeImagePrimary"
            :alt="product.title"
            :style="activeImageStyle"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        </picture>
        <div v-else class="product-placeholder">{{ $t("imageComingSoon") }}</div>
        </div>
        <figure v-if="activeImageSecondary" class="product-detail-image">
          <img :src="activeImageSecondary" :alt="`${product.title} detail`" loading="lazy" decoding="async" />
          <figcaption>VIEW / 02 — BACK DETAIL</figcaption>
        </figure>
      </div>

      <div class="product-info">
        <p class="product-kicker">{{ categoryLabel }}</p>
        <h1>{{ product.title }}</h1>
        <RouterLink
          v-if="product.creatorName && product.creatorSlug"
          class="product-creator"
          :to="creatorLink(product)"
        >
          {{ $t("creatorBy") }} {{ product.creatorName }}
        </RouterLink>
        <p class="product-price">{{ formatPrice(product.price) }}</p>
        <p class="product-description">
          {{ product.description || $t("defaultDescription") }}
        </p>

        <div v-if="!product.soldOut" class="preorder-note">
          <p>{{ $t("preorderBadge") }}</p>
          <strong>{{ $t("preorderProductTitle") }}</strong>
          <span>{{ $t("preorderProductCopy") }}</span>
        </div>

        <div v-if="colorOptions.length" class="color-picker">
          <p><span>{{ $t("colors") }}</span><strong>{{ activeVariant?.label }}</strong></p>
          <div class="color-grid">
            <button
              v-for="variant in colorOptions"
              :key="variant.id"
              type="button"
              :class="{ active: selectedColor === variant.id }"
              @click="selectColor(variant.id)"
            >
              {{ variant.label }}
            </button>
          </div>
        </div>

        <div class="size-picker">
          <p><span>{{ $t("sizes") }}</span><strong>{{ selectedSize }}</strong></p>
          <div class="size-grid">
            <button
              v-for="size in sizeOptions"
              :key="size"
              type="button"
              :class="{ active: selectedSize === size }"
              @click="selectSize(size)"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <div class="product-actions">
          <button
            class="primary"
            type="button"
            :disabled="product.soldOut"
            @click="addProductToCart"
          >
            {{ product.soldOut ? $t("outOfStock") : $t("addToCart") }}
          </button>
          <RouterLink class="ghost" to="/">{{ $t("backToShop") }}</RouterLink>
        </div>
        <p v-if="product.soldOut" class="product-soldout">
          {{ $t("soldOutRestock") }}
        </p>
      </div>
    </section>

    <section v-if="product && isDrop04Product" class="campaign-gallery" aria-labelledby="campaign-gallery-title">
      <header>
        <div><p>DROP 04 / WORN IN ABIDJAN</p><h2 id="campaign-gallery-title">CAMÉLÉON CAMO<br />EN MOUVEMENT</h2></div>
        <span>04 IMAGES / CAMPAIGN 001</span>
      </header>
      <div class="campaign-gallery-track">
        <figure v-for="(image, index) in campaignImages" :key="image">
          <img :src="image" :alt="`${product.title} porté à Abidjan — vue ${index + 1}`" loading="lazy" decoding="async" />
          <figcaption>VIEW / {{ String(index + 1).padStart(2, "0") }}</figcaption>
        </figure>
      </div>
    </section>

    <section v-if="product" class="product-story" aria-labelledby="product-story-title">
      <div class="product-story-copy">
        <p>{{ productDropLabel }}</p>
        <h2 id="product-story-title">{{ $t("productStoryTitle") }}</h2>
        <span>{{ $t("productStoryText") }}</span>
        <RouterLink v-if="product.creatorName" :to="creatorLink(product)">
          {{ $t("creatorBy") }} {{ product.creatorName }} ↗
        </RouterLink>
      </div>
      <div class="product-facts">
        <p>{{ $t("productDetails") }}</p>
        <ol>
          <li><b>01</b><span>{{ $t("productDetailOne") }}</span></li>
          <li><b>02</b><span>{{ $t("productDetailTwo") }}</span></li>
          <li><b>03</b><span>{{ $t("productDetailThree") }}</span></li>
        </ol>
      </div>
    </section>

    <section v-if="product && relatedProducts.length" class="related-products" aria-labelledby="related-title">
      <header>
        <p>{{ $t("relatedKicker") }}</p>
        <h2 id="related-title">{{ $t("relatedProducts") }}</h2>
      </header>
      <div class="related-grid">
        <RouterLink v-for="item in relatedProducts" :key="item.slug" :to="item.url" class="related-card">
          <img :src="item.imagePrimary" :alt="item.title" loading="lazy" decoding="async" />
          <div><strong>{{ item.title }}</strong><span>{{ formatPrice(item.price) }}</span></div>
        </RouterLink>
      </div>
    </section>

    <section v-if="!product" class="product-missing">
      <h1>{{ $t("productNotFound") }}</h1>
      <RouterLink to="/">{{ $t("backToShop") }}</RouterLink>
    </section>

    <SiteFooter />

    <div class="toast" :class="{ show: toastVisible }" role="status">
      {{ toastMessage }}
    </div>
    <div v-if="product && !product.soldOut" class="mobile-buy-bar">
      <div><strong>{{ product.title }}</strong><span>{{ formatPrice(product.price) }}</span></div>
      <button type="button" @click="addProductToCart">{{ $t("addToCart") }}</button>
    </div>
  </div>
</template>

<script>
import SiteHeader from "./components/SiteHeader.vue";
import CartPanel from "./components/CartPanel.vue";
import { cartStore } from "./data/cart.ts";
import { findProductBySlug, products } from "./data/products.ts";
import { applySeo } from "./utils/seo.js";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;
const campaignImages = [
  new URL("./assets/editorial/cameleon-worn-01.jpg", import.meta.url).href,
  new URL("./assets/editorial/cameleon-worn-02.jpg", import.meta.url).href,
  new URL("./assets/editorial/cameleon-worn-03.jpg", import.meta.url).href,
  new URL("./assets/editorial/cameleon-worn-04.jpg", import.meta.url).href,
];

export default {
  name: "ProductPage",
  components: {
    SiteHeader,
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      campaignImages,
      cartOpen: false,
      selectedSize: null,
      selectedColor: null,
      toastMessage: "",
      toastVisible: false,
    };
  },
  computed: {
    product() {
      return findProductBySlug(this.$route.params.slug);
    },
    cartCount() {
      return cartStore.cartCount.value;
    },
    colorOptions() {
      return Array.isArray(this.product?.variants) ? this.product.variants : [];
    },
    activeVariant() {
      if (!this.colorOptions.length) {
        return null;
      }
      return (
        this.colorOptions.find((variant) => variant.id === this.selectedColor) ||
        this.colorOptions[0]
      );
    },
    activeImagePrimary() {
      return this.activeVariant?.imagePrimary || this.product?.imagePrimary || "";
    },
    activeImageSecondary() {
      return this.product?.imageSecondary || "";
    },
    activeImageWebp() {
      return this.activeVariant?.imageWebp || this.product?.imageWebp || "";
    },
    activeImageZoom() {
      const zoom = Number(this.activeVariant?.imageZoom);
      if (!Number.isFinite(zoom) || zoom <= 0) {
        return 1;
      }
      return zoom;
    },
    activeImageStyle() {
      return {
        "--variant-image-zoom": String(this.activeImageZoom),
        "--variant-image-offset-x": this.activeImageOffsetX,
        "--variant-image-offset-y": this.activeImageOffsetY,
      };
    },
    activeImageOffsetX() {
      return this.activeVariant?.imageOffsetX || "0%";
    },
    activeImageOffsetY() {
      return this.activeVariant?.imageOffsetY || "0%";
    },
    sizeOptions() {
      if (this.product?.sizes?.length) {
        return this.product.sizes;
      }
      return ["S", "M", "L", "XL"];
    },
    categoryLabel() {
      const labels = {
        "t-shirts": this.$t("categoryTshirts"),
        "crop-tops": this.$t("categoryCropTops"),
        pants: this.$t("categoryPants"),
      };
      return labels[this.product?.category] || "Drop 02";
    },
    isCutoutProduct() {
      const tags = Array.isArray(this.product?.tags) ? this.product.tags : [];
      return tags.includes("cutout");
    },
    isDrop04Product() {
      return Array.isArray(this.product?.tags) && this.product.tags.includes("drop04");
    },
    isDualViewProduct() {
      const tags = Array.isArray(this.product?.tags) ? this.product.tags : [];
      return tags.includes("dual-view");
    },
    relatedProducts() {
      if (!this.product) return [];
      const sameCreator = products.filter(
        (item) => item.slug !== this.product.slug && item.creatorName === this.product.creatorName
      );
      const fallback = products.filter(
        (item) => item.slug !== this.product.slug && !sameCreator.some((match) => match.slug === item.slug)
      );
      return [...sameCreator, ...fallback].slice(0, 3);
    },
    productDropLabel() {
      const tags = Array.isArray(this.product?.tags) ? this.product.tags : [];
      if (tags.includes("drop04")) return "OBJECT STORY / DROP 04";
      if (tags.includes("drop03")) return "OBJECT STORY / DROP 03";
      return this.$t("productStoryKicker");
    },
  },
  watch: {
    product: {
      immediate: true,
      handler(product) {
        this.selectedSize = product?.sizes?.[0] || null;
        this.selectedColor = product?.variants?.[0]?.id || null;
        if (product) {
          applySeo({
            title: `${product.title} | New Gbonhi Shop`,
            description:
              product.description ||
              "Produit New Gbonhi Shop: visuels, tailles disponibles et infos de commande.",
            path: `/product/${product.slug}`,
          });
          return;
        }
        applySeo({
          title: "Produit introuvable | New Gbonhi Shop",
          description: "Ce produit New Gbonhi Shop est indisponible ou introuvable.",
          robots: "noindex, nofollow",
          path: this.$route.path,
        });
      },
    },
  },
  methods: {
    formatPrice(value) {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return "";
      }
      const formatted = new Intl.NumberFormat("fr-CI", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(value);
      return `${formatted} FCFA`;
    },
    selectSize(size) {
      this.selectedSize = size;
    },
    selectColor(colorId) {
      this.selectedColor = colorId;
    },
    toggleCart() {
      this.cartOpen = !this.cartOpen;
    },
    creatorLink(product) {
      if (product?.creatorSlug === "arw-studio") {
        return "/lab/arw-studio";
      }
      return `/lab#${product?.creatorSlug || ""}`;
    },
    addProductToCart() {
      if (!this.product || this.product.soldOut) {
        return;
      }
      const variant = this.activeVariant;
      cartStore.addToCart({
        ...this.product,
        selectedSize: this.selectedSize,
        selectedColor: variant?.label || null,
        selectedColorId: variant?.id || null,
        imagePrimary: variant?.imagePrimary || this.product.imagePrimary,
        imageWebp: variant?.imageWebp || this.product.imageWebp,
        preorder: true,
      });
      this.cartOpen = true;
      this.showToast(this.$t("addedToCart"));
    },
    showToast(message) {
      this.toastMessage = message;
      this.toastVisible = true;
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }
      this.toastTimer = setTimeout(() => {
        this.toastVisible = false;
      }, 2200);
    },
  },
};
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: "Space Grotesk", Arial, sans-serif;
  background: #f5f5f5;
  color: #0b0b0b;
}

.product-page {
  --text: #0b0b0b;
  --muted: #606060;
  --accent: #e10600;
  --line: #0b0b0b;

  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  position: relative;
  z-index: 0;
}

.product-page::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.04),
      rgba(0, 0, 0, 0.04) 1px,
      transparent 1px,
      transparent 48px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.04),
      rgba(0, 0, 0, 0.04) 1px,
      transparent 1px,
      transparent 48px
    );
  pointer-events: none;
  z-index: -1;
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  animation: rise 0.6s ease both;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.brand-name {
  margin: 0;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: 20px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-tagline {
  margin: 2px 0 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--muted);
}

.shop-nav {
  display: flex;
  gap: 18px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}

.shop-nav::-webkit-scrollbar {
  display: none;
}

.shop-nav a {
  color: inherit;
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
}

.shop-nav a.is-active {
  border-color: var(--accent);
}

.shop-cta {
  border: 1px solid var(--line);
  background: #fff;
  padding: 10px 16px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.shop-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.product-hero {
  margin-top: 32px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 32px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 28px;
  animation: rise 0.7s ease both;
}

.product-media {
  border-radius: 18px;
  background: #fff;
  padding: 18px;
  display: grid;
  place-items: center;
  min-height: 360px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.campaign-gallery {
  margin-top: var(--ng-space-section);
  border-block: 1px solid var(--line);
  padding-block: clamp(28px, 5vw, 56px);
}
.campaign-gallery header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}
.campaign-gallery header p,
.campaign-gallery header > span {
  margin: 0;
  color: var(--accent);
  font: 700 9px/1.2 monospace;
  letter-spacing: .16em;
}
.campaign-gallery h2 {
  margin: 12px 0 0;
  font-family: "Archivo Black", "Space Grotesk", sans-serif;
  font-size: clamp(34px, 6vw, 76px);
  line-height: .9;
}
.campaign-gallery-track {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.campaign-gallery figure { position: relative; margin: 0; overflow: hidden; background: #ddd; }
.campaign-gallery figure:nth-child(1) { grid-row: span 2; }
.campaign-gallery img { width: 100%; height: 100%; min-height: 340px; object-fit: cover; transition: transform .45s cubic-bezier(.2,.8,.2,1); }
.campaign-gallery figure:first-child img { min-height: 692px; }
.campaign-gallery figure:hover img { transform: scale(1.025); }
.campaign-gallery figcaption { position: absolute; left: 12px; bottom: 12px; padding: 8px 10px; background: #0b0b0b; color: #fff; font: 700 8px/1 monospace; letter-spacing: .14em; }

.product-media.is-cutout {
  background: transparent;
  border-color: transparent;
}

.product-picture img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  max-height: 420px;
  transform:
    translate(var(--variant-image-offset-x, 0%), var(--variant-image-offset-y, 0%))
    scale(var(--variant-image-zoom, 1));
  transform-origin: center center;
  transition: transform 0.2s ease;
}

.product-picture {
  overflow: hidden;
}

.product-dual-view {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.product-dual-view img {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  display: block;
  min-width: 0;
}

.product-placeholder {
  color: #606060;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 12px;
}

.product-info h1 {
  margin: 10px 0 12px;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 32px;
}

.product-kicker {
  margin: 0;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 11px;
  font-weight: 600;
}

.product-price {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
}

.product-creator {
  display: inline-flex;
  margin: -2px 0 12px;
  color: var(--accent);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  font-weight: 700;
}

.product-creator:hover,
.product-creator:focus-visible {
  text-decoration: underline;
  text-decoration-thickness: 2px;
}

.product-description {
  margin: 0 0 20px;
  color: var(--muted);
}

.preorder-note {
  margin: 0 0 20px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 14px;
  padding: 12px;
  background: #fafafa;
  display: grid;
  gap: 5px;
}

.preorder-note p,
.preorder-note strong,
.preorder-note span {
  margin: 0;
}

.preorder-note p {
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 10px;
  font-weight: 700;
}

.preorder-note strong {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
}

.preorder-note span {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.color-picker p {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 11px;
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.color-grid button {
  border: 1px solid var(--line);
  background: #fff;
  padding: 8px 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  cursor: pointer;
}

.color-grid button.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.size-picker p {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 11px;
}

.size-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-grid button {
  border: 1px solid var(--line);
  background: #fff;
  padding: 8px 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  cursor: pointer;
}

.size-grid button.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.product-actions {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.product-actions .primary {
  border: 1px solid var(--line);
  background: #0b0b0b;
  color: #fff;
  padding: 12px 18px;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.product-actions .primary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.product-actions .ghost {
  border: 1px solid var(--line);
  background: #fff;
  color: var(--text);
  padding: 12px 18px;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.product-soldout {
  margin-top: 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  color: var(--accent);
}

.product-missing {
  margin-top: 40px;
  padding: 32px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  text-align: center;
}

.shop-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  animation: rise 0.9s ease both;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links a {
  color: inherit;
  text-decoration: none;
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: #0b0b0b;
  color: #fff;
  padding: 12px 16px;
  border-radius: 999px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 150;
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Editorial product experience */
.product-hero {
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, .85fr);
  gap: clamp(28px, 5vw, 72px);
  align-items: start;
  padding: 24px 0 56px;
  border: 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  border-radius: 0;
  background: transparent;
}
.product-gallery { min-width: 0; }
.product-gallery-index { margin-bottom: 12px; display: flex; justify-content: space-between; gap: 16px; font: 700 9px/1.2 monospace; letter-spacing: .14em; text-transform: uppercase; }
.product-media,
.product-media.is-cutout { min-height: 620px; padding: clamp(18px, 4vw, 42px); border: 1px solid rgba(0,0,0,.12); border-radius: var(--ng-radius); background: #efefeb; }
.product-picture img { max-height: 580px; }
.product-detail-image { margin: 14px 0 0; padding: 18px; border: 1px solid rgba(0,0,0,.14); background: #fff; }
.product-detail-image img { width: 100%; height: 420px; object-fit: contain; }
.product-detail-image figcaption { margin-top: 12px; font: 700 9px/1 monospace; letter-spacing: .14em; }
.product-info { position: sticky; top: calc(var(--header-height) + 24px); padding-top: 34px; }
.product-info h1 { font-size: clamp(34px, 4.5vw, 58px); line-height: .94; }
.product-price { font: 700 18px/1 monospace; }
.preorder-note { border-radius: var(--ng-radius); }
.product-actions .primary { min-height: 48px; flex: 1; transition: background-color .18s ease; }
.product-actions .primary:hover { border-color: var(--accent); background: var(--accent); }
.product-actions .ghost { min-height: 48px; }
.product-story { margin-top: var(--ng-space-section); display: grid; grid-template-columns: minmax(0,1.25fr) minmax(300px,.75fr); border: 1px solid var(--line); background: #0b0b0b; color: #fff; }
.product-story-copy { padding: clamp(32px,7vw,86px); }
.product-story-copy > p,
.product-facts > p,
.related-products header p { margin: 0; color: var(--accent); font: 700 9px/1.2 monospace; letter-spacing: .18em; text-transform: uppercase; }
.product-story-copy h2 { margin: 18px 0 24px; max-width: 760px; font-family: "Archivo Black","Space Grotesk",sans-serif; font-size: clamp(38px,6vw,78px); line-height: .92; text-transform: uppercase; }
.product-story-copy > span { display: block; max-width: 650px; color: rgba(255,255,255,.68); line-height: 1.7; }
.product-story-copy a { display: inline-block; margin-top: 30px; padding-bottom: 5px; border-bottom: 1px solid; color: #fff; text-decoration: none; font: 700 10px/1.2 monospace; letter-spacing: .14em; text-transform: uppercase; }
.product-facts { padding: clamp(32px,5vw,58px); border-left: 1px solid rgba(255,255,255,.25); display: flex; flex-direction: column; justify-content: center; }
.product-facts ol { margin: 24px 0 0; padding: 0; list-style: none; }
.product-facts li { padding: 18px 0; border-top: 1px solid rgba(255,255,255,.22); display: grid; grid-template-columns: 48px 1fr; gap: 12px; }
.product-facts b { color: var(--accent); font: 700 10px/1 monospace; }
.product-facts span { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
.related-products { margin-top: var(--ng-space-section); }
.related-products header { padding-bottom: 20px; border-bottom: 1px solid var(--line); }
.related-products h2 { margin: 10px 0 0; font-family: "Archivo Black","Space Grotesk",sans-serif; font-size: clamp(32px,5vw,64px); line-height: .94; text-transform: uppercase; }
.related-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); }
.related-card { padding: 18px; border-right: 1px solid var(--line); color: inherit; text-decoration: none; }
.related-card:last-child { border-right: 0; }
.related-card img { width: 100%; aspect-ratio: 4/5; object-fit: contain; background: #efefeb; transition: transform .25s ease; }
.related-card div { margin-top: 14px; display: flex; justify-content: space-between; gap: 12px; }
.related-card strong { max-width: 70%; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
.related-card span { white-space: nowrap; font: 700 10px/1 monospace; }
.related-card:hover img { transform: scale(.97); }
.mobile-buy-bar { display: none; }

@media (max-width: 980px) {
  .product-hero {
    grid-template-columns: 1fr;
  }
  .product-info { position: static; padding-top: 0; }
  .product-story { grid-template-columns: 1fr; }
  .product-facts { border-top: 1px solid rgba(255,255,255,.25); border-left: 0; }
}

@media (max-width: 700px) {
  .campaign-gallery header { align-items: start; flex-direction: column; }
  .campaign-gallery-track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .campaign-gallery figure { flex: 0 0 86%; scroll-snap-align: start; }
  .campaign-gallery img,
  .campaign-gallery figure:first-child img { min-height: 460px; }
  .product-page {
    padding: 24px 16px 40px;
  }

  .product-hero {
    padding: 18px;
    gap: 18px;
  }

  .product-media {
    min-height: 280px;
    padding: 12px;
  }
  .product-media,
  .product-media.is-cutout { min-height: 380px; }
  .product-detail-image img { height: 300px; }
  .related-grid { grid-template-columns: 1fr; }
  .related-card { border-right: 0; border-bottom: 1px solid var(--line); }

  .product-dual-view {
    gap: 8px;
  }

  .product-info h1 {
    font-size: 26px;
    overflow-wrap: anywhere;
  }

  .product-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .product-actions .primary,
  .product-actions .ghost {
    width: 100%;
  }

  .shop-header {
    align-items: flex-start;
  }

  .shop-cta {
    width: 100%;
  }

  .toast {
    right: 16px;
    left: 16px;
    text-align: center;
  }
  .mobile-buy-bar { position: fixed; right: 0; bottom: 0; left: 0; z-index: 120; padding: 10px 14px; display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 12px; align-items: center; border-top: 1px solid #0b0b0b; background: rgba(255,255,255,.96); backdrop-filter: blur(14px); }
  .mobile-buy-bar div { min-width: 0; display: grid; gap: 3px; }
  .mobile-buy-bar strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; text-transform: uppercase; }
  .mobile-buy-bar span { font: 700 10px/1 monospace; }
  .mobile-buy-bar button { min-height: 42px; border: 0; background: var(--accent); color: #fff; padding: 10px 14px; font: 700 9px/1 sans-serif; letter-spacing: .14em; text-transform: uppercase; }
  .product-page { padding-bottom: 100px; }
}
</style>
