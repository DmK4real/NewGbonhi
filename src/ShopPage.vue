<template>
  <div class="shop-page">
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

    <section class="hero">
      <div class="hero-copy">
        <p class="hero-kicker">Next drop</p>
        <h1>Drop 02 in preparation</h1>
        <p class="hero-sub">
          The first preview piece is BLACK CAMELEON: clean fit, strong visual,
          limited stock.
        </p>
        <div class="hero-actions">
          <button class="hero-button" type="button" @click="scrollToProducts">
            View items
          </button>
          <RouterLink class="hero-button ghost" to="/about">
            Drop details
          </RouterLink>
        </div>
      </div>
      <div class="hero-panel">
        <img class="hero-photo" :src="heroImage" alt="Next drop preview" />
        <div class="hero-countdown">
          <p>Launch in</p>
          <strong>{{ countdown }}</strong>
          <small>{{ nextDropLabel }}</small>
        </div>
      </div>
    </section>

    <section class="drop-details">
      <div class="details-head">
        <p>Drop focus</p>
        <h2>Drop 02 in preparation with BLACK CAMELEON up front</h2>
      </div>
      <div class="details-grid">
        <article class="detail-card">
          <h3>Featured piece</h3>
          <p>BLACK CAMELEON opens the new drop collection.</p>
        </article>
        <article class="detail-card">
          <h3>Visual direction</h3>
          <p>Black base and centered graphic for direct readability.</p>
        </article>
        <article class="detail-card">
          <h3>Drop in preparation</h3>
          <p>Progressive release, short availability based on demand.</p>
        </article>
      </div>
    </section>

    <main class="shop-main" ref="productsSection">
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
          <h2>Filters</h2>
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

      <section class="shop-content">
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

        <div class="search-input-wrap">
          <label for="search" class="sr-only">Search products</label>
          <input
            id="search"
            v-model="searchQuery"
            type="search"
            placeholder="Search products..."
            class="search-input"
          />
        </div>

        <div class="content-head">
          <div>
            <p class="content-kicker">Drop 02 selection</p>
            <h2>Shop</h2>
          </div>
          <p class="content-count">{{ filteredProducts.length }} item(s)</p>
        </div>

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
const heroImage = new URL("./assets/BLACK CAMELEON.png", import.meta.url).href;

export default {
  name: "ShopPage",
  components: {
    ProductGrid,
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      heroImage,
      nextDropAt: new Date("2026-04-04T18:00:00+00:00").getTime(),
      countdown: "",
      toastMessage: "",
      toastVisible: false,
      cartOpen: false,
      filtersOpen: false,
      filters: [
        { id: "drop02", label: "Drop 02" },
        { id: "new", label: "New" },
        { id: "soldOut", label: "Out of stock" },
        { id: "restock", label: "Restock" },
      ],
      activeCategory: "all",
      activeFilter: null,
      products,
      searchQuery: "", // New search query data property
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
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  },
  computed: {
    cartCount() {
      return cartStore.cartCount.value;
    },
    nextDropLabel() {
      return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(this.nextDropAt);
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

      const query = this.searchQuery.toLowerCase(); // New search query processing

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
        } else if (this.activeFilter === "drop02") {
          filterMatch = tagList.includes("drop02");
        } else if (this.activeFilter === "new") {
          filterMatch = tagList.includes("new");
        } else if (this.activeFilter === "restock") {
          filterMatch = tagList.includes("restock");
        }

        // New search logic
        const searchMatch =
          !query ||
          (product.title && product.title.toLowerCase().includes(query)) ||
          (product.description && product.description.toLowerCase().includes(query));

        return categoryMatch && filterMatch && searchMatch;
      });
    },
  },  methods: {
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
      this.activeFilter = this.activeFilter === filterId ? null : filterId;
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
      }, 2200);
    },
    updateCountdown() {
      const now = Date.now();
      const remaining = Math.max(0, this.nextDropAt - now);
      if (remaining <= 0) {
        this.countdown = "Live";
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      this.countdown = `${days}d ${hours}h ${minutes}m`;
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
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
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
  border-radius: 16px;
  background: #0b0b0b;
  color: #fff;
  overflow: hidden;
  display: grid;
  min-height: 340px;
}

.hero-photo {
  width: 100%;
  height: 100%;
  min-height: 300px;
  object-fit: cover;
  opacity: 1;
  filter: contrast(1.04) saturate(1.04);
  image-rendering: -webkit-optimize-contrast;
  image-rendering: auto;
}

.hero-countdown {
  padding: 14px;
  display: grid;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.8);
}

.hero-countdown strong {
  font-size: 18px;
  letter-spacing: 0.1em;
}

.hero-countdown small {
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  letter-spacing: 0.14em;
}

.drop-details {
  margin-top: 24px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
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
  gap: 14px;
}

.detail-card {
  border: 1px solid rgba(0, 0, 0, 0.16);
  border-radius: 14px;
  padding: 14px;
  background: #fafafa;
}

.detail-card h3 {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
}

.detail-card p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.shop-main {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 32px;
  margin-top: 34px;
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

.shop-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.search-input-wrap {
  margin-top: 10px;
}

.search-input {
  width: 100%;
  border: 1px solid var(--line);
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  border-radius: 8px;
}

.search-input::placeholder {
  color: var(--muted);
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

.content-count {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
  color: var(--muted);
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
  .hero {
    grid-template-columns: 1fr;
  }

  .shop-main {
    grid-template-columns: 1fr;
  }

  .shop-sidebar {
    position: static;
  }
}

@media (max-width: 700px) {
  .shop-page {
    padding: 24px 16px 40px;
  }

  .hero {
    padding: 18px;
    gap: 16px;
  }

  .hero-copy h1 {
    font-size: 28px;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .hero-button {
    width: 100%;
  }

  .hero-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .hero-photo {
    height: clamp(240px, 78vw, 340px);
    min-height: 0;
    object-fit: contain;
    display: block;
  }

  .hero-countdown {
    position: relative;
    z-index: 1;
  }

  .drop-details {
    padding: 18px;
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

  .filter-drawer {
    max-height: min(72vh, 560px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .drawer-body {
    display: grid;
    grid-template-columns: 1fr;
  }

  .drawer-body .pill {
    width: 100%;
    margin-bottom: 0;
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
