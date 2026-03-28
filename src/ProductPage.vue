<template>
  <div class="product-page">
    <header class="shop-header">
      <div class="brand">
        <img class="brand-logo" :src="logoUrl" alt="NewGbonhi logo" />
        <div class="brand-meta">
          <p class="brand-name">NewGbonhi</p>
          <p class="brand-tagline">Drop 02 // In preparation</p>
        </div>
      </div>
      <nav class="shop-nav" aria-label="Primary">
        <RouterLink :class="{ 'is-active': $route.name === 'shop' }" to="/">
          Shop
        </RouterLink>
        <RouterLink
          :class="{ 'is-active': $route.name === 'lookbook' }"
          to="/lookbook"
        >
          Lookbook
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'about' }" to="/about">
          About
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'orders' }" to="/orders">
          Orders
        </RouterLink>
        <a href="#contact">Contact</a>
      </nav>
      <button class="shop-cta" type="button" @click="toggleCart">
        Cart ({{ cartCount }})
      </button>
    </header>

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <section v-if="product" class="product-hero">
      <div class="product-media">
        <picture v-if="activeImagePrimary" class="product-picture">
          <source
            v-if="activeImageWebp"
            :srcset="activeImageWebp"
            type="image/webp"
          />
          <img
            :src="activeImagePrimary"
            :alt="product.title"
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div v-else class="product-placeholder">Image coming soon</div>
      </div>

      <div class="product-info">
        <p class="product-kicker">{{ categoryLabel }}</p>
        <h1>{{ product.title }}</h1>
        <p class="product-price">{{ formatPrice(product.price) }}</p>
        <p class="product-description">
          {{ product.description || "Signature NewGbonhi piece for Drop 02." }}
        </p>

        <div v-if="colorOptions.length" class="color-picker">
          <p>Colors</p>
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
          <p>Sizes</p>
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
            {{ product.soldOut ? "Out of stock" : "Add to cart" }}
          </button>
          <RouterLink class="ghost" to="/">Back to shop</RouterLink>
        </div>
        <p v-if="product.soldOut" class="product-soldout">
          Out of stock. Restock soon.
        </p>
      </div>
    </section>

    <section v-else class="product-missing">
      <h1>Product not found</h1>
      <RouterLink to="/">Back to shop</RouterLink>
    </section>

    <footer class="shop-footer" id="contact">
      <p>Copyright 2026 NewGbonhi. All rights reserved.</p>
      <div class="footer-links">
        <a
          href="https://www.instagram.com/new.gbonhi?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        <a
          href="https://www.tiktok.com/@new_gbonhi0?is_from_webapp=1&sender_device=pc"
          target="_blank"
          rel="noopener noreferrer"
        >
          TikTok
        </a>
        <a href="mailto:hello@newgbonhi.com">Email</a>
      </div>
    </footer>

    <div class="toast" :class="{ show: toastVisible }" role="status">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import CartPanel from "./components/CartPanel.vue";
import { cartStore } from "./data/cart.js";
import { findProductBySlug } from "./data/products.js";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;

export default {
  name: "ProductPage",
  components: {
    CartPanel,
  },
  data() {
    return {
      logoUrl,
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
    activeImageWebp() {
      return this.activeVariant?.imageWebp || this.product?.imageWebp || "";
    },
    sizeOptions() {
      if (this.product?.sizes?.length) {
        return this.product.sizes;
      }
      return ["S", "M", "L", "XL"];
    },
    categoryLabel() {
      const labels = {
        "t-shirts": "T-shirts",
        "crop-tops": "Crop tops",
        pants: "Pants",
      };
      return labels[this.product?.category] || "Drop 02";
    },
  },
  watch: {
    product: {
      immediate: true,
      handler(product) {
        this.selectedSize = product?.sizes?.[0] || null;
        this.selectedColor = product?.variants?.[0]?.id || null;
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
      });
      this.cartOpen = true;
      this.showToast("Added to cart");
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
@import url("https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&display=swap");

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

.product-picture img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  max-height: 420px;
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

.product-description {
  margin: 0 0 20px;
  color: var(--muted);
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

@media (max-width: 980px) {
  .product-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .product-page {
    padding: 24px 16px 40px;
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
}
</style>
