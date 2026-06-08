<template>
  <div class="shop-page">
    <header class="shop-header">
      <div class="brand">
        <img class="brand-logo" :src="logoUrl" alt="NewGbonhi logo" />
        <div class="brand-meta">
          <p class="brand-name">NewGbonhi</p>
          <p class="brand-tagline">{{ $t("brandTagline") }}</p>
        </div>
      </div>
      <nav class="shop-nav" aria-label="Primary">
        <RouterLink :class="{ 'is-active': $route.name === 'shop' }" to="/">
          {{ $t("navShop") }}
        </RouterLink>
        <RouterLink
          :class="{ 'is-active': $route.name === 'lookbook' }"
          to="/lookbook"
        >
          {{ $t("navLookbook") }}
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'studio' }" to="/studio">
          {{ $t("navStudio") }}
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'about' }" to="/about">
          {{ $t("navAbout") }}
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'orders' }" to="/orders">
          {{ $t("navOrders") }}
        </RouterLink>
        <a href="#contact">{{ $t("navContact") }}</a>
      </nav>
      <button class="shop-cta" type="button" @click="toggleCart">
        {{ $t("cart") }} ({{ cartCount }})
      </button>
    </header>

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <section class="hero">
      <div class="hero-copy">
        <p class="hero-kicker">{{ $t("nextDrop") }}</p>
        <h1>{{ $t("drop02Prep") }}</h1>
        <p class="hero-sub">
          {{ $t("shopHeroSub") }}
        </p>
        <div class="hero-actions">
          <button class="hero-button" type="button" @click="scrollToProducts">
            {{ $t("viewItems") }}
          </button>
          <RouterLink class="hero-button ghost" to="/about">
            {{ $t("dropDetails") }}
          </RouterLink>
        </div>
      </div>
      <div class="hero-panel">
        <img
          class="hero-sticker hero-sticker-logo"
          :src="logoUrl"
          alt=""
          aria-hidden="true"
        />
        <img
          class="hero-sticker hero-sticker-oval"
          :src="stickerOval"
          alt=""
          aria-hidden="true"
        />
        <img
          class="hero-sticker hero-sticker-arw"
          :src="stickerArwFilm"
          alt=""
          aria-hidden="true"
        />
        <img
          class="hero-sticker hero-sticker-arw-alt"
          :src="stickerArwFilm"
          alt=""
          aria-hidden="true"
        />
        <img
          class="hero-sticker hero-sticker-cup"
          :src="stickerCup"
          alt=""
          aria-hidden="true"
        />
        <span class="hero-sticker hero-sticker-text" aria-hidden="true">
          NewGbonhi
        </span>
        <span class="hero-sticker hero-sticker-drop" aria-hidden="true">
          Drop 03
        </span>
        <img class="hero-photo" :src="heroImage" alt="Next drop preview" />
      </div>
    </section>

    <section class="collab-feature" aria-labelledby="collab-title">
      <div class="collab-copy">
        <div class="collab-lockup">
          <img :src="collabLockup" :alt="$t('collabLogoAlt')" />
        </div>
        <p class="collab-kicker">{{ $t("collabKicker") }}</p>
        <h2 id="collab-title">{{ $t("collabTitle") }}</h2>
        <p class="collab-sub">{{ $t("collabSub") }}</p>
        <div class="collab-badges" aria-label="Collaboration details">
          <span>{{ $t("collabBadgeOne") }}</span>
          <span>{{ $t("collabBadgeTwo") }}</span>
          <span>{{ $t("collabBadgeThree") }}</span>
        </div>
        <div class="collab-actions">
          <button class="hero-button" type="button" @click="scrollToProducts">
            {{ $t("collabPrimaryCta") }}
          </button>
          <RouterLink class="hero-button ghost" to="/lookbook">
            {{ $t("collabSecondaryCta") }}
          </RouterLink>
        </div>
      </div>

      <div class="collab-gallery" aria-label="ARW Film collaboration previews">
        <figure class="collab-frame collab-frame-main">
          <img :src="collabDopamineTee" :alt="$t('collabDopamineAlt')" />
          <figcaption>{{ $t("collabEditorialLabel") }}</figcaption>
        </figure>
        <figure class="collab-frame collab-frame-side">
          <img :src="collabFrontTee" :alt="$t('collabFrontAlt')" />
          <figcaption>{{ $t("collabPieceLabel") }}</figcaption>
        </figure>
        <figure class="collab-frame collab-frame-mark">
          <img :src="collabChromeLogo" :alt="$t('collabChromeAlt')" />
          <figcaption>{{ $t("collabMarkLabel") }}</figcaption>
        </figure>
      </div>
    </section>

    <section class="drop-details">
      <div class="details-head">
        <p>{{ $t("dropFocus") }}</p>
        <h2>{{ $t("shopDetailsTitle") }}</h2>
      </div>
      <div class="details-grid">
        <article class="detail-card">
          <h3>{{ $t("featuredPiece") }}</h3>
          <p>{{ $t("featuredPieceText") }}</p>
        </article>
        <article class="detail-card">
          <h3>{{ $t("visualDirection") }}</h3>
          <p>{{ $t("visualDirectionText") }}</p>
        </article>
        <article class="detail-card">
          <h3>{{ $t("dropInPrep") }}</h3>
          <p>{{ $t("dropInPrepText") }}</p>
        </article>
      </div>
    </section>

    <main class="shop-main" ref="productsSection">
      <aside class="shop-sidebar">
        <div class="sidebar-block">
          <h2>{{ $t("categories") }}</h2>
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
          <h2>{{ $t("filters") }}</h2>
          <button
            v-for="filter in filters"
            :key="filter.id"
            class="pill"
            :class="{ active: activeFilter === filter.id }"
            type="button"
            :aria-pressed="activeFilter === filter.id"
            @click="toggleFilter(filter.id)"
          >
            {{ $t(filter.labelKey) }}
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
            {{ $t("filters") }}
          </button>
        </div>

        <div class="search-input-wrap">
          <label for="search" class="sr-only">{{ $t("searchProducts") }}</label>
          <input
            id="search"
            v-model="searchQuery"
            type="search"
            :placeholder="$t('searchPlaceholder')"
            class="search-input"
          />
        </div>

        <div class="content-head">
          <div>
            <p class="content-kicker">{{ $t("drop02Selection") }}</p>
            <h2>{{ $t("navShop") }}</h2>
          </div>
          <p class="content-count">{{ $t("itemCount", { count: filteredProducts.length }) }}</p>
        </div>

        <div
          v-if="isProductsLoading"
          class="skeleton-grid"
          role="status"
          aria-live="polite"
          :aria-label="$t('loading')"
        >
          <article
            v-for="n in skeletonCount"
            :key="`skeleton-${n}`"
            class="skeleton-card"
            aria-hidden="true"
          >
            <div class="skeleton-media"></div>
            <div class="skeleton-line skeleton-line-title"></div>
            <div class="skeleton-line skeleton-line-price"></div>
            <div class="skeleton-line skeleton-line-button"></div>
          </article>
        </div>
        <ProductGrid
          v-else
          :products="filteredProducts"
          currency="XOF"
          locale="fr-CI"
          @add-to-cart="addToCart"
        />
      </section>
    </main>

    <SiteFooter />

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
      :aria-label="$t('quickFilters')"
    >
      <div class="drawer-head">
        <h3>{{ $t("quickFilters") }}</h3>
        <button type="button" class="drawer-close" @click="closeFilters">
          {{ $t("close") }}
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
          {{ $t(filter.labelKey) }}
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
import { products } from "./data/products.ts";
import { cartStore } from "./data/cart.ts";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;
const heroImage = new URL("./assets/ARW FILM DOPAMINE TEE.jpeg", import.meta.url).href;
const stickerOval = new URL("./assets/NEW GBONHI OVAL.png", import.meta.url).href;
const stickerArwFilm = new URL("./assets/ARW FILM.png", import.meta.url).href;
const stickerCup = new URL("./assets/ARW FILM CUP STICKER.png", import.meta.url).href;
const collabLockup = new URL("./assets/ARW FILM X NEW GBONHI.jpeg", import.meta.url).href;
const collabFrontTee = new URL("./assets/ARW FILM TEE FRONT.jpeg", import.meta.url).href;
const collabDopamineTee = new URL("./assets/ARW FILM DOPAMINE TEE.jpeg", import.meta.url).href;
const collabChromeLogo = new URL("./assets/ARW FILM CHROME LOGO.jpeg", import.meta.url).href;

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
      stickerOval,
      stickerArwFilm,
      stickerCup,
      collabLockup,
      collabFrontTee,
      collabDopamineTee,
      collabChromeLogo,
      nextDropAt: null,
      countdown: "",
      toastMessage: "",
      toastVisible: false,
      cartOpen: false,
      filtersOpen: false,
      filters: [
        { id: "drop03", labelKey: "filterDrop02" },
        { id: "new", labelKey: "filterNew" },
        { id: "soldOut", labelKey: "filterSoldOut" },
        { id: "restock", labelKey: "filterRestock" },
      ],
      activeCategory: "all",
      activeFilter: null,
      products,
      searchQuery: "",
      isProductsLoading: true,
      skeletonCount: 8,
    };
  },
  mounted() {
    this.updateCountdown();
    this.countdownTimer = setInterval(this.updateCountdown, 1000);
    this.loadingTimer = setTimeout(() => {
      this.isProductsLoading = false;
    }, 480);
  },
  beforeUnmount() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
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
      if (!this.nextDropAt) {
        return this.$t("drop03Label");
      }
      return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(this.nextDropAt);
    },
    categoryOptions() {
      const labelMap = {
        "t-shirts": this.$t("categoryTshirts"),
        "crop-tops": this.$t("categoryCropTops"),
        pants: this.$t("categoryPants"),
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
      return [{ id: "all", label: this.$t("categoryAll") }, ...categories];
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
        } else if (this.activeFilter === "drop03") {
          filterMatch = tagList.includes("drop03");
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
      this.showToast(`${product.title} ${this.$t("addedToCart").toLowerCase()}`);
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
      if (!this.nextDropAt) {
        this.countdown = this.$t("dropSoon");
        return;
      }
      const now = Date.now();
      const remaining = Math.max(0, this.nextDropAt - now);
      if (remaining <= 0) {
        this.countdown = this.$t("live");
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
  position: relative;
  border-radius: 16px;
  background:
    radial-gradient(circle at 16% 18%, rgba(225, 6, 0, 0.08), transparent 22%),
    radial-gradient(circle at 82% 76%, rgba(11, 11, 11, 0.05), transparent 26%),
    #fff;
  color: #0b0b0b;
  overflow: hidden;
  display: grid;
  place-items: center;
  min-height: 340px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.hero-photo {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  min-height: 300px;
  object-fit: contain;
  opacity: 1;
  filter: contrast(1.08) saturate(1.06) brightness(1.02);
  image-rendering: -webkit-optimize-contrast;
  image-rendering: auto;
}

.hero-sticker {
  position: absolute;
  z-index: 3;
  pointer-events: none;
  user-select: none;
  will-change: transform;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.16));
}

.hero-sticker-logo {
  width: clamp(56px, 9vw, 98px);
  left: 8%;
  top: 10%;
  animation: sticker-float-a 5.8s ease-in-out infinite;
}

.hero-sticker-oval {
  width: clamp(86px, 13vw, 150px);
  right: 6%;
  top: 16%;
  transform: rotate(8deg);
  animation: sticker-float-b 6.6s ease-in-out infinite;
}

.hero-sticker-arw {
  width: clamp(82px, 12vw, 138px);
  left: 13%;
  bottom: 34%;
  transform: rotate(7deg);
  animation: sticker-float-d 7.4s ease-in-out infinite;
}

.hero-sticker-arw-alt {
  width: clamp(58px, 8vw, 96px);
  right: 18%;
  bottom: 28%;
  opacity: 0.92;
  transform: rotate(-12deg);
  animation: sticker-float-e 8s ease-in-out infinite;
}

.hero-sticker-cup {
  width: clamp(72px, 10vw, 126px);
  right: 2%;
  top: 4%;
  border-radius: 8px;
  transform: rotate(6deg);
  animation: sticker-float-f 8.4s ease-in-out infinite;
}

.hero-sticker-text,
.hero-sticker-drop {
  border: 1px solid #0b0b0b;
  border-radius: 999px;
  background: #fff;
  color: #0b0b0b;
  padding: 8px 12px;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: clamp(10px, 1.6vw, 14px);
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-sticker-text {
  left: 6%;
  bottom: 18%;
  transform: rotate(-8deg);
  animation: sticker-float-c 7s ease-in-out infinite;
}

.hero-sticker-drop {
  right: 8%;
  bottom: 12%;
  background: #0b0b0b;
  color: #fff;
  transform: rotate(7deg);
  animation: sticker-float-a 6.2s ease-in-out infinite reverse;
}

.collab-feature {
  margin-top: 24px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(11, 11, 11, 0.96), rgba(28, 28, 28, 0.98)),
    #0b0b0b;
  color: #fff;
  display: grid;
  grid-template-columns: minmax(280px, 0.86fr) minmax(0, 1.14fr);
  gap: 24px;
  overflow: hidden;
  position: relative;
  animation: rise 0.75s ease both;
}

.collab-feature::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.06) 1px,
      transparent 1px,
      transparent 42px
    ),
    linear-gradient(90deg, rgba(225, 6, 0, 0.2), transparent 38%);
  opacity: 0.74;
  pointer-events: none;
}

.collab-copy,
.collab-gallery {
  position: relative;
  z-index: 1;
}

.collab-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.collab-lockup {
  width: min(360px, 100%);
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  background: #f7f7f7;
  overflow: hidden;
}

.collab-lockup img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.collab-kicker {
  margin: 0;
  color: #ff2b24;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 11px;
  font-weight: 700;
}

.collab-copy h2 {
  margin: 10px 0 12px;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: clamp(32px, 5vw, 58px);
  line-height: 0.96;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.collab-sub {
  margin: 0;
  max-width: 500px;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.6;
}

.collab-badges {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.collab-badges span {
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  padding: 7px 10px;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  background: rgba(255, 255, 255, 0.06);
}

.collab-actions {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.collab-feature .hero-button {
  border-color: rgba(255, 255, 255, 0.78);
  background: #fff;
  color: #0b0b0b;
}

.collab-feature .hero-button.ghost {
  background: transparent;
  color: #fff;
}

.collab-gallery {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(150px, 0.8fr);
  grid-template-rows: 1fr 0.72fr;
  gap: 12px;
  min-height: 520px;
}

.collab-frame {
  margin: 0;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  background: #f7f7f7;
}

.collab-frame-main {
  grid-row: 1 / span 2;
}

.collab-frame img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: contrast(1.08) saturate(0.96);
  transition: transform 0.35s ease;
}

.collab-frame-main img,
.collab-frame-side img {
  object-fit: contain;
}

.collab-frame-mark img {
  object-fit: cover;
}

.collab-frame:hover img {
  transform: scale(1.035);
}

.collab-frame figcaption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(11, 11, 11, 0.78);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  backdrop-filter: blur(10px);
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

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 26px 18px;
}

.skeleton-card {
  display: grid;
  gap: 10px;
}

.skeleton-media,
.skeleton-line {
  position: relative;
  overflow: hidden;
  background: #ececec;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.skeleton-media {
  aspect-ratio: 3 / 4;
  border-radius: 14px;
}

.skeleton-line {
  height: 14px;
  border-radius: 8px;
}

.skeleton-line-title {
  width: 72%;
}

.skeleton-line-price {
  width: 48%;
}

.skeleton-line-button {
  width: 100%;
  height: 36px;
  border-radius: 10px;
}

.skeleton-media::after,
.skeleton-line::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-120%);
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.72) 50%,
    transparent 100%
  );
  animation: skeleton-shimmer 1s ease-in-out infinite;
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

@keyframes skeleton-shimmer {
  100% {
    transform: translateX(120%);
  }
}

@keyframes sticker-float-a {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(-6deg);
  }
  50% {
    transform: translate3d(8px, -12px, 0) rotate(4deg);
  }
}

@keyframes sticker-float-b {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(8deg);
  }
  50% {
    transform: translate3d(-10px, 10px, 0) rotate(-3deg);
  }
}

@keyframes sticker-float-c {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(-8deg);
  }
  50% {
    transform: translate3d(10px, 8px, 0) rotate(2deg);
  }
}

@keyframes sticker-float-d {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(7deg);
  }
  50% {
    transform: translate3d(-8px, -10px, 0) rotate(-5deg);
  }
}

@keyframes sticker-float-e {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(-12deg);
  }
  50% {
    transform: translate3d(7px, 11px, 0) rotate(6deg);
  }
}

@keyframes sticker-float-f {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(6deg);
  }
  50% {
    transform: translate3d(-9px, -8px, 0) rotate(-4deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-sticker {
    animation: none;
  }
}

@media (max-width: 980px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .collab-feature {
    grid-template-columns: 1fr;
  }

  .collab-gallery {
    min-height: 460px;
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
    min-height: 0;
    aspect-ratio: 1 / 1;
    background: #fff;
  }

  .hero-photo {
    position: absolute;
    inset: 0;
    height: 100%;
    min-height: 0;
    object-fit: cover;
    display: block;
  }

  .hero-sticker-logo {
    left: 5%;
    top: 7%;
    width: 52px;
  }

  .hero-sticker-oval {
    right: 4%;
    top: 10%;
    width: 82px;
  }

  .hero-sticker-arw {
    left: 7%;
    bottom: 28%;
    width: 78px;
  }

  .hero-sticker-arw-alt {
    right: 8%;
    bottom: 24%;
    width: 58px;
  }

  .hero-sticker-cup {
    right: 2%;
    top: 4%;
    width: 62px;
  }

  .hero-sticker-text {
    left: 5%;
    bottom: 12%;
  }

  .hero-sticker-drop {
    right: 5%;
    bottom: 8%;
  }

  .collab-feature {
    padding: 18px;
    gap: 18px;
  }

  .collab-lockup {
    margin-bottom: 18px;
  }

  .collab-copy h2 {
    font-size: 34px;
  }

  .collab-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .collab-gallery {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    min-height: 0;
  }

  .collab-frame-main {
    grid-column: 1 / -1;
    grid-row: auto;
    aspect-ratio: 3 / 4;
  }

  .collab-frame-side,
  .collab-frame-mark {
    aspect-ratio: 1 / 1.12;
  }

  .collab-frame figcaption {
    left: 8px;
    right: 8px;
    bottom: 8px;
    text-align: center;
    letter-spacing: 0.12em;
    font-size: 9px;
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

  .skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px 14px;
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
