<template>
  <div class="shop-page">
    <header class="shop-header">
      <div class="brand">
        <img class="brand-logo" :src="logoUrl" alt="NewGbonhi logo" />
        <div class="brand-meta">
          <p class="brand-name">NewGbonhi</p>
          <p class="brand-tagline">Drop 01 // Street uniform</p>
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

    <section class="hero">
      <div class="hero-copy">
        <p class="hero-kicker">NewGbonhi Drop 01</p>
        <h1>Urban uniform. Clean cut. No noise.</h1>
        <p class="hero-sub">
          Tees, crop tops, and pants built for daily wear. Limited release.
        </p>
        <div class="hero-actions">
          <button class="hero-button" type="button" @click="scrollToProducts">
            Shop now
          </button>
          <RouterLink class="hero-button ghost" to="/lookbook">
            View lookbook
          </RouterLink>
        </div>
      </div>
      <div class="hero-panel">
        <div class="hero-visual">
          <img class="hero-photo" :src="heroImage" alt="Drop preview" />
          <div class="hero-countdown">
            <p>Drop ends in</p>
            <strong>{{ countdown }}</strong>
            <div class="countdown-bar">
              <span :style="{ width: `${dropProgress}%` }"></span>
            </div>
          </div>
        </div>
        <div class="hero-strip">Worldwide shipping - 48h drop window</div>
      </div>
    </section>

    <div class="ticker" aria-hidden="true">
      <div class="ticker-track">
        <div class="ticker-group">
          <span>NewGbonhi Drop 01</span>
          <span>Limited release</span>
          <span>Worldwide shipping</span>
          <span>NewGbonhi Drop 01</span>
          <span>Limited release</span>
          <span>Worldwide shipping</span>
          <span>NewGbonhi Drop 01</span>
          <span>Limited release</span>
          <span>Worldwide shipping</span>
          <span>NewGbonhi Drop 01</span>
          <span>Limited release</span>
          <span>Worldwide shipping</span>
        </div>
        <div class="ticker-group" aria-hidden="true">
          <span>NewGbonhi Drop 01</span>
          <span>Limited release</span>
          <span>Worldwide shipping</span>
          <span>NewGbonhi Drop 01</span>
          <span>Limited release</span>
          <span>Worldwide shipping</span>
          <span>NewGbonhi Drop 01</span>
          <span>Limited release</span>
          <span>Worldwide shipping</span>
          <span>NewGbonhi Drop 01</span>
          <span>Limited release</span>
          <span>Worldwide shipping</span>
        </div>
      </div>
    </div>

    <section class="drop-details">
      <div class="details-head">
        <p>Drop details</p>
        <h2>Cut, fabric, delivery</h2>
      </div>
      <div class="details-grid">
        <article class="detail-card">
          <h3>Fabric</h3>
          <p>Soft cotton blend with a clean matte finish.</p>
        </article>
        <article class="detail-card">
          <h3>Fit</h3>
          <p>Relaxed street fit. True to size, size up for oversize.</p>
        </article>
        <article class="detail-card">
          <h3>Care</h3>
          <p>Cold wash, inside out. Low heat dry to protect prints.</p>
        </article>
        <article class="detail-card">
          <h3>Delivery</h3>
          <p>Worldwide shipping within 48h drop window.</p>
        </article>
      </div>
    </section>

    <section class="lookbook">
      <div class="lookbook-head">
        <p>Lookbook</p>
        <h2>Frames from the city</h2>
      </div>
      <div class="lookbook-grid">
        <figure
          v-for="(frame, index) in lookbookImages"
          :key="frame.label"
          class="lookbook-card"
          :class="{ accent: index === 1 }"
        >
          <img :src="frame.src" :alt="frame.label" loading="lazy" />
          <figcaption>{{ frame.label }}</figcaption>
        </figure>
      </div>
    </section>

    <section class="logo-section">
      <div class="logo-head">
        <p>Logo</p>
        <h2>NewGbonhi marks</h2>
        <p class="logo-sub">Swipe to explore the marks</p>
      </div>
      <div class="logo-grid">
        <figure v-for="logo in logoImages" :key="logo.label" class="logo-card">
          <img :src="logo.src" :alt="logo.label" loading="lazy" />
          <figcaption>{{ logo.label }}</figcaption>
        </figure>
      </div>
    </section>

    <main class="shop-main">
      <aside class="shop-sidebar">
        <div class="sidebar-block">
          <h2>Categories</h2>
          <button
            v-for="category in categoryOptions"
            :key="category.id"
            class="category"
            :class="{ active: activeCategory === category.id }"
            type="button"
            @click="setCategory(category.id)"
          >
            {{ category.label }}
          </button>
        </div>
        <div class="sidebar-block">
          <h2>Drop info</h2>
          <p>NewGbonhi focuses on clean cuts and bold prints.</p>
          <p>Sizes: XS - XXL</p>
        </div>
        <div class="sidebar-block">
          <h2>Quick filters</h2>
          <button
            v-for="filter in filters"
            :key="filter.id"
            class="pill"
            :class="{ active: activeFilter === filter.id }"
            type="button"
            :aria-pressed="activeFilter === filter.id"
            @click="toggleFilter(filter.id)"
          >
            {{ filter.label }}
          </button>
        </div>
      </aside>

      <section class="shop-content" ref="productsSection">
        <div class="mobile-filters">
          <div class="mobile-categories">
            <button
              v-for="category in categoryOptions"
              :key="category.id"
              class="chip"
              :class="{ active: activeCategory === category.id }"
              type="button"
              @click="setCategory(category.id)"
            >
              {{ category.label }}
            </button>
          </div>
          <button
            class="filter-toggle"
            type="button"
            :aria-expanded="filtersOpen"
            @click="toggleFilters"
          >
            Filters
          </button>
        </div>
        <div class="content-head">
          <div>
            <p class="content-kicker">Latest pieces</p>
            <h2>Drop 01 selection</h2>
          </div>
          <div class="content-actions">
            <button class="ghost-button" type="button" @click="toggleFilters">
              Filter
            </button>
            <button class="ghost-button" type="button">Sort</button>
          </div>
        </div>
        <section class="featured-set">
          <div class="featured-head">
            <p>Featured</p>
            <h3>Drop 01 highlights</h3>
          </div>
          <div class="featured-grid">
            <article
              v-for="product in featuredProducts"
              :key="product.id || product.slug || product.title"
              class="featured-card"
            >
              <RouterLink
                :to="product.url || `/product/${product.slug}`"
                class="featured-media"
              >
                <img
                  v-if="product.imagePrimary"
                  :src="product.imagePrimary"
                  :alt="product.title || ''"
                  loading="lazy"
                />
              </RouterLink>
              <div class="featured-info">
                <p class="featured-kicker">{{ categoryLabel(product.category) }}</p>
                <h4>{{ product.title }}</h4>
                <p class="featured-price">{{ formatPrice(product.price) }}</p>
                <RouterLink
                  :to="product.url || `/product/${product.slug}`"
                  class="featured-link"
                >
                  View piece
                </RouterLink>
              </div>
            </article>
          </div>
        </section>
        <ProductGrid
          :products="filteredProducts"
          currency="XOF"
          locale="fr-CI"
          @add-to-cart="addToCart"
        />
      </section>
    </main>

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

    <div
      class="filter-backdrop"
      :class="{ open: filtersOpen }"
      role="presentation"
      @click="closeFilters"
    ></div>
    <aside
      class="filter-drawer"
      :class="{ open: filtersOpen }"
      role="dialog"
      aria-modal="true"
      aria-label="Quick filters"
    >
      <div class="drawer-head">
        <h3>Quick filters</h3>
        <button type="button" class="drawer-close" @click="closeFilters">
          Close
        </button>
      </div>
      <div class="drawer-body">
        <button
          v-for="filter in filters"
          :key="filter.id"
          class="pill"
          :class="{ active: activeFilter === filter.id }"
          type="button"
          :aria-pressed="activeFilter === filter.id"
          @click="toggleFilter(filter.id)"
        >
          {{ filter.label }}
        </button>
      </div>
    </aside>

    <div class="toast" :class="{ show: toastVisible }" role="status">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import ProductGrid from "./components/ProductGrid.vue";
import CartPanel from "./components/CartPanel.vue";
import { products } from "./data/products.js";
import { cartStore } from "./data/cart.js";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;
const whiteCameleonUrl = new URL(
  "./assets/WHITE CAMELEON.png",
  import.meta.url
).href;
const cameleonLogoUrl = new URL(
  "./assets/CAMELEON LOGO.jpeg",
  import.meta.url
).href;
const newGbonhiArtUrl = new URL(
  "./assets/NEW GBONHI ART.jpeg",
  import.meta.url
).href;
const newGbonhiLljUrl = new URL(
  "./assets/NEW GBONHI LLJ.jpeg",
  import.meta.url
).href;
const newGbonhiSolarUrl = new URL(
  "./assets/NEW GBONHI SOLAR.jpeg",
  import.meta.url
).href;
const newGbonhiSolerUrl = new URL(
  "./assets/NEW GBONHI SOLER.jpeg",
  import.meta.url
).href;
const redCameleonUrl = new URL(
  "./assets/RED CAMELEON.jpeg",
  import.meta.url
).href;
const safeZoneUrl = new URL(
  "./assets/BLACK SAFE zone 4 BOY.png",
  import.meta.url
).href;
const safeBabiGirlBlackUrl = new URL(
  "./assets/BLACK SAFE BABI GIRL.png",
  import.meta.url
).href;

export default {
  name: "ShopPage",
  components: {
    ProductGrid,
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      heroImage: safeZoneUrl,
      dropDurationMs: 48 * 60 * 60 * 1000,
      dropEndsAt: Date.now() + 48 * 60 * 60 * 1000,
      countdown: "",
      dropProgress: 0,
      toastMessage: "",
      toastVisible: false,
      cartOpen: false,
      filtersOpen: false,
      filters: [
        { id: "new", label: "New" },
        { id: "soldOut", label: "Sold out" },
        { id: "restock", label: "Restock" },
      ],
      activeCategory: "all",
      activeFilter: null,
      lookbookImages: [
        {
          src: safeZoneUrl,
          label: "SAFE zone 4 BOY BLACK",
        },
        {
          src: whiteCameleonUrl,
          label: "WHITE CAMELEON",
        },
        {
          src: safeBabiGirlBlackUrl,
          label: "BLACK SAFE BABI GIRL",
        },
      ],
      logoImages: [
        {
          src: cameleonLogoUrl,
          label: "NEW GBONHI CAMELEON",
        },
        {
          src: newGbonhiArtUrl,
          label: "New Gbonhi Art",
        },
        {
          src: newGbonhiLljUrl,
          label: "New Gbonhi LLJ",
        },
        {
          src: newGbonhiSolarUrl,
          label: "New Gbonhi Solar",
        },
        {
          src: newGbonhiSolerUrl,
          label: "New Gbonhi Soler",
        },
        {
          src: redCameleonUrl,
          label: "Red Cameleon",
        },
      ],
      products,
    };
  },
  mounted() {
    this.updateCountdown();
    this.countdownTimer = setInterval(this.updateCountdown, 1000);
  },
  beforeUnmount() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },
  computed: {
    cartCount() {
      return cartStore.cartCount.value;
    },
    featuredProducts() {
      const preferredSlugs = ["cameleon-crop-top-black", "crop-top-bgab"];
      const bySlug = this.products.filter((product) =>
        preferredSlugs.includes(product.slug)
      );
      if (bySlug.length === 2) {
        return bySlug;
      }
      const preferred = this.products.filter(
        (product) => product.category === "crop-tops"
      );
      const source = preferred.length ? preferred : this.products;
      return source.slice(0, 2);
    },
    categoryOptions() {
      const labelMap = {
        "t-shirts": "T-shirts",
        "crop-tops": "Crop tops",
        pants: "Pants",
      };
      const order = ["t-shirts", "crop-tops", "pants"];
      const counts = this.products.reduce((acc, product) => {
        const raw = String(product?.category || "").trim().toLowerCase();
        if (!raw) {
          return acc;
        }
        acc[raw] = (acc[raw] || 0) + 1;
        return acc;
      }, {});
      const ids = Object.keys(counts).sort((a, b) => {
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        if (indexA === -1 && indexB === -1) {
          return a.localeCompare(b);
        }
        if (indexA === -1) {
          return 1;
        }
        if (indexB === -1) {
          return -1;
        }
        return indexA - indexB;
      });
      const categories = ids.map((id) => ({
        id,
        label: labelMap[id] || id.replace(/-/g, " "),
      }));
      return [{ id: "all", label: "All" }, ...categories];
    },
    filteredProducts() {
      const available = new Set(
        this.categoryOptions.map((category) => category.id)
      );
      const activeCategory = available.has(this.activeCategory)
        ? this.activeCategory
        : "all";
      return this.products.filter((product) => {
        const productCategory = String(product?.category || "")
          .trim()
          .toLowerCase();
        const categoryMatch =
          activeCategory === "all" || productCategory === activeCategory;
        const tagList = Array.isArray(product.tags) ? product.tags : [];
        let filterMatch = true;

        if (this.activeFilter === "soldOut") {
          filterMatch = Boolean(product.soldOut);
        } else if (this.activeFilter === "new") {
          filterMatch = tagList.includes("new");
        } else if (this.activeFilter === "restock") {
          filterMatch = tagList.includes("restock");
        }

        return categoryMatch && filterMatch;
      });
    },
  },
  methods: {
    categoryLabel(category) {
      const labels = {
        "t-shirts": "T-shirts",
        "crop-tops": "Crop tops",
        pants: "Pants",
      };
      return labels[category] || "Drop 01";
    },
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
    setCategory(categoryId) {
      this.activeCategory = categoryId;
    },
    toggleFilters() {
      this.filtersOpen = !this.filtersOpen;
    },
    closeFilters() {
      this.filtersOpen = false;
    },
    toggleFilter(filterId) {
      this.activeFilter =
        this.activeFilter === filterId ? null : filterId;
    },
    toggleCart() {
      this.cartOpen = !this.cartOpen;
    },
    addToCart(product) {
      cartStore.addToCart(product);
      this.cartOpen = true;
      this.showToast(`${product.title} added to cart`);
    },
    showToast(message) {
      this.toastMessage = message;
      this.toastVisible = true;
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }
      this.toastTimer = setTimeout(() => {
        this.toastVisible = false;
      }, 2400);
    },
    updateCountdown() {
      const now = Date.now();
      const remaining = Math.max(0, this.dropEndsAt - now);
      const total = this.dropDurationMs || 1;
      this.dropProgress = Math.min(
        100,
        Math.max(0, ((total - remaining) / total) * 100)
      );

      if (remaining <= 0) {
        this.countdown = "Closed";
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      this.countdown = `${hours}h ${minutes}m ${seconds}s`;
    },
    scrollToProducts() {
      const target = this.$refs.productsSection;
      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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

.shop-page {
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

.shop-page::before {
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

.hero {
  margin-top: 32px;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 20px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 24px;
  background: #fff;
  animation: rise 0.7s ease both;
}

.hero-copy h1 {
  margin: 8px 0 12px;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: 36px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hero-kicker {
  margin: 0;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 11px;
  font-weight: 600;
}

.hero-sub {
  margin: 0 0 20px;
  color: var(--muted);
  max-width: 420px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-button {
  border: 1px solid var(--line);
  background: #0b0b0b;
  color: #fff;
  padding: 12px 18px;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.2em;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.hero-button.ghost {
  background: #fff;
  color: var(--text);
}

.hero-panel {
  background: #0b0b0b;
  border-radius: 16px;
  padding: 18px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  overflow: hidden;
}

.hero-visual {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #111;
  min-height: 240px;
  display: grid;
  place-items: center;
}

.hero-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0.9;
  filter: contrast(1.05) saturate(1.08);
}

.hero-countdown {
  position: absolute;
  inset: auto 12px 12px 12px;
  background: rgba(0, 0, 0, 0.68);
  border-radius: 12px;
  padding: 10px 12px;
  display: grid;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
}

.hero-countdown strong {
  font-size: 14px;
  letter-spacing: 0.12em;
}

.countdown-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  overflow: hidden;
}

.countdown-bar span {
  display: block;
  height: 100%;
  background: var(--accent);
  width: 0;
  transition: width 0.4s ease;
}

.hero-strip {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.22em;
  background: var(--accent);
  padding: 8px 12px;
  border-radius: 999px;
  color: #fff;
}

.drop-details {
  margin-top: 28px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  animation: rise 0.72s ease both;
}

.details-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.details-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.details-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.detail-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 14px;
  padding: 16px;
  background: #fafafa;
}

.detail-card h3 {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
}

.detail-card p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.ticker {
  margin-top: 28px;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fff;
  padding: 10px 18px;
}

.ticker-track {
  display: flex;
  width: max-content;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  animation: ticker 14s linear infinite;
  will-change: transform;
}

.ticker-group {
  display: flex;
  gap: 28px;
}

.ticker-track span {
  white-space: nowrap;
}

.lookbook {
  margin-top: 32px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  animation: rise 0.75s ease both;
}

.lookbook-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.lookbook-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lookbook-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.lookbook-card {
  position: relative;
  aspect-ratio: 4 / 5;
  border: 1px solid rgba(0, 0, 0, 0.45);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}

.lookbook-card.accent {
  border-color: var(--accent);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.2);
}

.lookbook-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  filter: saturate(1.05);
  background: transparent;
}

.lookbook-card figcaption {
  position: absolute;
  inset: auto 12px 12px 12px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 10px;
}

.logo-section {
  margin-top: 32px;
  padding: 32px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  animation: rise 0.75s ease both;
  overflow: hidden;
}

.logo-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.logo-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.logo-sub {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 12px;
  display: none;
}

.logo-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.logo-card {
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 20px;
  background: #fff;
  padding: 28px;
  display: grid;
  gap: 14px;
  place-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.logo-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.16);
}

.logo-card img {
  width: 100%;
  height: clamp(160px, 24vw, 220px);
  object-fit: contain;
  display: block;
}

.logo-card figcaption {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 10px;
  color: var(--muted);
}

.shop-main {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 32px;
  margin-top: 40px;
  animation: rise 0.8s ease both;
}

.shop-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 24px;
  align-self: start;
}

.sidebar-block h2 {
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 12px;
}

.sidebar-block p {
  margin: 0 0 10px;
  color: var(--muted);
}

.category,
.pill {
  width: 100%;
  text-align: left;
  border: 1px solid var(--line);
  background: #fff;
  padding: 10px 12px;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.18em;
  cursor: pointer;
  margin-bottom: 8px;
}

.category.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.pill {
  text-align: center;
  border-radius: 999px;
}

.pill.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.mobile-filters {
  display: none;
  position: sticky;
  top: 12px;
  z-index: 40;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  gap: 10px;
}

.mobile-categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}

.mobile-categories::-webkit-scrollbar {
  display: none;
}

.chip {
  border: 1px solid var(--line);
  background: #fff;
  padding: 8px 12px;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.16em;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
}

.chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.filter-toggle {
  border: 1px solid var(--line);
  background: #0b0b0b;
  color: #fff;
  padding: 8px 12px;
  border-radius: 999px;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.16em;
  cursor: pointer;
  white-space: nowrap;
}

.shop-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.content-kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 11px;
  color: var(--muted);
}

.content-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.content-actions {
  display: flex;
  gap: 10px;
}

.featured-set {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 18px;
  padding: 20px;
  background: #fff;
}

.featured-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.featured-head h3 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.featured-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.featured-card {
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  display: grid;
  grid-template-rows: 1fr auto;
}

.featured-media {
  display: block;
  background: #fff;
  aspect-ratio: 4 / 5;
  overflow: hidden;
}

.featured-media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 0.3s ease;
}

.featured-card:hover .featured-media img {
  transform: scale(1.03);
}

.featured-info {
  padding: 16px;
  display: grid;
  gap: 8px;
}

.featured-kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 10px;
  color: var(--muted);
}

.featured-info h4 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.featured-price {
  margin: 0;
  font-weight: 600;
}

.featured-link {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
  text-decoration: none;
  color: var(--text);
  border-bottom: 2px solid var(--accent);
  width: fit-content;
}

.filter-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 140;
}

.filter-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

.filter-drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -18px 30px rgba(0, 0, 0, 0.2);
  transform: translateY(110%);
  transition: transform 0.25s ease;
  z-index: 150;
  padding: 18px 20px 24px;
  display: grid;
  gap: 12px;
}

.filter-drawer.open {
  transform: translateY(0);
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.drawer-head h3 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
}

.drawer-close {
  border: 1px solid var(--line);
  background: #fff;
  padding: 6px 12px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  cursor: pointer;
}

.drawer-body {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ghost-button {
  border: 1px solid var(--line);
  background: #fff;
  padding: 8px 14px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  cursor: pointer;
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

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links a {
  color: inherit;
  text-decoration: none;
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

@keyframes ticker {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 980px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .shop-main {
    grid-template-columns: 1fr;
  }

  .shop-sidebar {
    position: static;
  }

  .hero-visual {
    min-height: 220px;
  }
}

@media (max-width: 700px) {
  .shop-page {
    padding: 24px 16px 40px;
  }

  .shop-header {
    align-items: flex-start;
  }

  .shop-cta {
    width: 100%;
  }

  .content-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .mobile-filters {
    display: grid;
  }

  .shop-sidebar {
    display: none;
  }

  .logo-sub {
    display: block;
  }

  .logo-grid {
    grid-auto-flow: column;
    grid-auto-columns: minmax(220px, 70vw);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 6px;
    scrollbar-width: none;
  }

  .logo-grid::-webkit-scrollbar {
    display: none;
  }

  .logo-card {
    scroll-snap-align: start;
  }

  .footer-links {
    flex-direction: column;
  }

  .toast {
    right: 16px;
    left: 16px;
    text-align: center;
  }
}
</style>
