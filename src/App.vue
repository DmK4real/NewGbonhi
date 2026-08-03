<template>
  <a class="skip-link" href="#app-content">Skip to content</a>
  <ScrollProgress v-if="!appError.active" />
  <main v-if="appError.active" class="app-error-shell">
    <section class="app-error-panel" role="alert" aria-live="assertive">
      <p class="app-error-kicker">NewGbonhi</p>
      <h1>{{ appError.title }}</h1>
      <p class="app-error-copy">{{ appError.message }}</p>
      <p v-if="appError.source" class="app-error-source">
        Source: {{ appError.source }}
      </p>
      <div class="app-error-actions">
        <button type="button" class="app-error-button" @click="clearError">
          Try again
        </button>
        <button
          type="button"
          class="app-error-button app-error-button-secondary"
          @click="reloadPage"
        >
          Reload page
        </button>
      </div>
    </section>
  </main>
  <div v-else id="app-content" tabindex="-1">
    <RouterView v-slot="{ Component, route }">
      <Transition
        :name="route.name === 'lab' || route.name === 'arw-studio' ? 'lab-page' : 'page'"
        mode="out-in"
      >
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<script>
import ScrollProgress from "./components/ScrollProgress.vue";
import { appErrorState, clearAppError, reportAppError } from "./utils/appError.js";

export default {
  name: "App",
  components: {
    ScrollProgress,
  },
  data() {
    return {
      lastScrollY: 0,
      headerObserver: null,
      observedHeader: null,
      headerMeasureFrame: null,
      headerHidden: false,
      appError: appErrorState,
    };
  },
  errorCaptured(error, instance, info) {
    reportAppError(error, {
      source: info || instance?.$options?.name || "component",
      fallbackMessage:
        "A page component failed to render. Please try again.",
    });
    return false;
  },
  mounted() {
    this.lastScrollY = window.scrollY || 0;
    if (this.lastScrollY > 0) {
      this.headerHidden = true;
      document.documentElement.classList.add("header-hidden");
    }
    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.$nextTick(() => {
      this.observeHeader();
    });
  },
  updated() {
    this.observeHeader();
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.onScroll);
    if (this.headerMeasureFrame) cancelAnimationFrame(this.headerMeasureFrame);
    this.disconnectHeaderObserver();
    document.documentElement.classList.remove("header-hidden");
    document.documentElement.style.removeProperty("--header-height");
  },
  methods: {
    observeHeader() {
      const header = document.querySelector(".shop-header");
      if (header === this.observedHeader) return;

      this.disconnectHeaderObserver();
      this.observedHeader = header;

      if (!header) {
        document.documentElement.style.setProperty("--header-height", "88px");
        return;
      }

      if (typeof ResizeObserver !== "undefined") {
        this.headerObserver = new ResizeObserver(() => {
          this.syncHeaderHeight();
        });
        this.headerObserver.observe(header);
      }

      this.syncHeaderHeight();
    },
    disconnectHeaderObserver() {
      if (this.headerObserver) {
        this.headerObserver.disconnect();
        this.headerObserver = null;
      }
      this.observedHeader = null;
    },
    syncHeaderHeight() {
      if (this.headerMeasureFrame) return;
      this.headerMeasureFrame = requestAnimationFrame(() => {
        this.headerMeasureFrame = null;
        const header = this.observedHeader || document.querySelector(".shop-header");
        if (!header) {
          document.documentElement.style.setProperty("--header-height", "88px");
          return;
        }
        const measured = Math.ceil(header.getBoundingClientRect().height);
        const safeHeight = Math.max(88, measured + 8);
        document.documentElement.style.setProperty("--header-height", `${safeHeight}px`);
      });
    },
    onScroll() {
      const currentY = window.scrollY || 0;
      const shouldHide = currentY > 0;
      if (shouldHide === this.headerHidden) return;
      this.headerHidden = shouldHide;
      if (shouldHide) {
        document.documentElement.classList.add("header-hidden");
      } else {
        document.documentElement.classList.remove("header-hidden");
      }
      this.lastScrollY = currentY;
    },
    clearError() {
      clearAppError();
    },
    reloadPage() {
      window.location.reload();
    },
  },
};
</script>

<style>
:root {
  color-scheme: light;
  --header-height: 88px;
  --ng-ink: #0b0b0b;
  --ng-paper: #f5f5f1;
  --ng-white: #fff;
  --ng-red: #e10600;
  --ng-muted: #606060;
  --ng-line: rgba(11, 11, 11, 0.22);
  --ng-space-section: clamp(56px, 8vw, 112px);
  --ng-space-page: clamp(16px, 3vw, 32px);
  --ng-radius: 2px;
  --ng-action-height: 44px;
  --ng-title-xl: clamp(38px, 5.4vw, 76px);
  --ng-title-lg: clamp(32px, 4.2vw, 58px);
  --ng-title-md: clamp(26px, 3.2vw, 46px);
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --ng-ink: #f3f0e8;
    --ng-paper: #101010;
    --ng-white: #181818;
    --ng-muted: #aaa79f;
    --ng-line: rgba(243, 240, 232, .24);
  }

  html,
  body,
  #app,
  #app-content {
    background: #101010 !important;
    color: #f3f0e8 !important;
  }

  :where(
    .shop-page,
    .collections-page,
    .lab-page,
    .product-page,
    .checkout-page,
    .orders-page,
    .studio-page,
    .lookbook-page,
    .about-page
  ) {
    --text: #f3f0e8 !important;
    --muted: #aaa79f !important;
    --line: rgba(243, 240, 232, .28) !important;
    background-color: #101010 !important;
    color: var(--text) !important;
  }

  :where(
    .shop-page,
    .collections-page,
    .lab-page,
    .product-page,
    .checkout-page,
    .orders-page,
    .studio-page,
    .lookbook-page,
    .about-page
  )::before {
    background:
      repeating-linear-gradient(90deg, rgba(243, 240, 232, .085) 0 1px, transparent 1px 48px),
      repeating-linear-gradient(0deg, rgba(243, 240, 232, .085) 0 1px, transparent 1px 48px) !important;
  }

  .shop-header {
    border-bottom-color: rgba(243, 240, 232, .14) !important;
    background: rgba(16, 16, 16, .94) !important;
    color: #f3f0e8;
  }

  .site-home-search {
    border-color: rgba(243, 240, 232, .34) !important;
    background: rgba(255, 255, 255, .035) !important;
  }

  .site-home-search:focus-within {
    border-color: var(--ng-red) !important;
    background: rgba(255, 255, 255, .07) !important;
  }

  .site-cart {
    border-color: rgba(243, 240, 232, .5) !important;
    background: #181818 !important;
    color: #f3f0e8 !important;
  }

  .site-cart span {
    background: #f3f0e8 !important;
    color: #101010 !important;
  }

  .site-home-search input,
  :where(input, select, textarea) {
    color: #f3f0e8;
  }

  .site-home-search input::placeholder,
  :where(input, textarea)::placeholder {
    color: #8e8b84 !important;
  }

  :where(
    .about-hero,
    .story-section,
    .spec-card,
    .hero-copy,
    .hero-showcase,
    .checkout-summary,
    .checkout-mobile-bar,
    .confirmation,
    .delivery-select,
    .summary-item,
    .lab-system,
    .lab-explorer,
    .client-directory,
    .showcase-board,
    .lab-agenda,
    .lookbook-hero,
    .journal-index-section,
    .looks-gallery,
    .look-card,
    .styling-notes,
    .orders-login,
    .orders-empty,
    .order-card,
    .order-status.sent,
    .order-status.paid_reported,
    .product-hero,
    .product-media,
    .product-media.is-cutout,
    .mobile-buy-bar,
    .product-missing,
    .lab-entry,
    .drop-details,
    .mobile-filters,
    .filter-drawer,
    .studio-lock-panel,
    .studio-hero,
    .design-catalog,
    .design-card,
    .cart-panel,
    .cart-item,
    .cart-product-details,
    .cart-footer,
    .collections-hero,
    .collab-lockup,
    .detail-card,
    .lab-shop,
    .preorder-banner,
    .delivery-box,
    .payment-box,
    .journal-story-media,
    .note-card,
    .order-fulfillment,
    .preorder-note,
    .studio-count,
    .studio-mobile-summary,
    .design-media,
    .fit-card,
    .pg-placeholder-text,
    .pg-placeholder,
    .pg-view,
    .pg-badges
  ) {
    border-color: rgba(243, 240, 232, .24) !important;
    background-color: #181818 !important;
    color: #f3f0e8 !important;
  }

  :where(
    .shop-page,
    .collections-page,
    .lab-page,
    .product-page,
    .checkout-page,
    .orders-page,
    .studio-page,
    .lookbook-page,
    .about-page
  ) :where(
    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="url"],
    input[type="password"],
    input[type="number"],
    select,
    textarea
  ) {
    border-color: rgba(243, 240, 232, .3) !important;
    background-color: #1d1d1d !important;
    color: #f3f0e8 !important;
  }

  :where(.shop-page, .collections-page, .lab-page, .product-page, .checkout-page, .orders-page, .studio-page, .lookbook-page, .about-page)
  :where(section, article, aside, main, nav, form) {
    border-color: rgba(243, 240, 232, .24);
  }

  :where(
    .drop-tabs button,
    .category,
    .hero-sticker-drop,
    .shop-cta,
    .hero-button.ghost,
    .lab-button-light,
    .collab-feature .hero-button,
    .early-access button,
    .pill,
    .chip,
    .ghost-button,
    .product-actions .ghost,
    .color-grid button,
    .size-grid button,
    .cart-close,
    .cart-qty,
    .cart-clear,
    .drawer-close,
    .danger-btn,
    .delete-button,
    .studio-lock-form input,
    .render-profile-grid button,
    .sticker-edit select,
    .camo-slider-controls > button,
    .camo-slider-controls > div button.active,
    .discipline-filters button
  ) {
    border-color: rgba(243, 240, 232, .3) !important;
    background-color: #1d1d1d !important;
    color: #f3f0e8 !important;
  }

  :where(.category.active, .pill.active, .discipline-filters button.active) {
    border-color: var(--ng-red) !important;
    background-color: var(--ng-red) !important;
    color: #fff !important;
  }

  /* The Lab open-call card keeps its signature lime identity in both themes. */
  .lab-join {
    --text: #0b0b0b !important;
    --muted: #343434 !important;
    --line: #0b0b0b !important;
    border-color: #0b0b0b !important;
    background: #c7ff00 !important;
    color: #0b0b0b !important;
  }

  .lab-join :where(input, select, textarea) {
    border-color: #0b0b0b !important;
    background: rgba(255, 255, 255, .48) !important;
    color: #0b0b0b !important;
  }

  .pg-grid {
    --pg-card-bg: #181818 !important;
    --pg-image-bg: #181818 !important;
    --pg-text: #f3f0e8 !important;
    --pg-muted: #aaa79f !important;
    --pg-border: rgba(243, 240, 232, .24) !important;
  }

  .pg-badges {
    border-color: rgba(243, 240, 232, .42) !important;
    background: rgba(24, 24, 24, .94) !important;
    box-shadow: 0 5px 18px rgba(0, 0, 0, .28) !important;
  }

  .pg-badge,
  .pg-badge-tag {
    color: #f3f0e8 !important;
  }

  .pg-badge-preorder,
  .pg-badge-soldout {
    color: #ff3b35 !important;
  }

  /* Every frame follows the active theme; only the pixels inside product photos remain untouched. */
  :where(
    .pg-image-wrap,
    .pg-image,
    .pg-picture,
    .product-media img,
    .product-detail-image,
    .summary-item img,
    .summary-item.is-custom-studio img,
    .cart-item img,
    .cart-item.is-custom-studio img,
    .look-media
  ) {
    border-color: rgba(243, 240, 232, .24) !important;
    background-color: #181818 !important;
  }

  .app-error-shell {
    background: linear-gradient(180deg, rgba(225, 6, 0, .14), rgba(16, 16, 16, .97)), #101010;
  }

  .app-error-panel {
    border-color: rgba(243, 240, 232, .2);
    background: rgba(24, 24, 24, .97);
  }

  .app-error-copy,
  .app-error-kicker,
  .app-error-source {
    color: #aaa79f;
  }
}

/* Global typography safety: editorial scale without cropped or overflowing words. */
:where(h1, h2, h3, h4, blockquote) {
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: normal;
  text-wrap: balance;
}

:where(p, li, figcaption, label, a, button, span, strong) {
  overflow-wrap: break-word;
}

:is(.section-head, .orders-head, .product-info, .studio-copy, .hero-copy) h1 {
  font-size: var(--ng-title-lg) !important;
  line-height: .96 !important;
  letter-spacing: -.025em !important;
}

:is(.story-head, .catalog-head, .lab-shop-head, .related-products, .product-story-copy) h2 {
  font-size: var(--ng-title-md) !important;
  line-height: 1 !important;
  letter-spacing: -.02em !important;
}

.manifesto-entry h2,
.featured-drop h2,
.camo-editorial h2,
.journal-feature h2,
.journal-index h2,
.lab-explorer h2,
.lab-projects h2,
.lab-join h2,
.lab-agenda h2,
.campaign-gallery h2 {
  max-width: 100% !important;
  font-size: var(--ng-title-lg) !important;
  line-height: .98 !important;
  letter-spacing: -.025em !important;
  overflow-wrap: break-word;
}

@media (min-width: 701px) and (max-width: 1180px) {
  :root {
    --ng-title-xl: clamp(36px, 5vw, 62px);
    --ng-title-lg: clamp(30px, 4.4vw, 50px);
    --ng-title-md: clamp(25px, 3.6vw, 42px);
  }
}

@media (max-width: 700px) {
  :root {
    --ng-title-xl: clamp(34px, 12vw, 54px);
    --ng-title-lg: clamp(30px, 10vw, 44px);
    --ng-title-md: clamp(25px, 8vw, 38px);
  }

  :where(h1, h2, h3, h4, blockquote) {
    text-wrap: pretty;
  }

  :where(
    .shop-page,
    .collections-page,
    .lab-page,
    .product-page,
    .checkout-page,
    .orders-page,
    .studio-page,
    .lookbook-page,
    .about-page
  ) :where(main, section, article, aside, form) {
    min-width: 0;
    max-width: 100%;
  }

  :where(.checkout-mobile-bar, .mobile-buy-bar, .studio-mobile-summary) {
    box-sizing: border-box;
    width: 100%;
    max-width: 100vw;
  }
}

html {
  scroll-padding-top: var(--header-height);
  overflow-x: clip;
}

body { overflow-x: clip; }

.skip-link { position: fixed; top: 10px; left: 10px; z-index: 1000; padding: 12px 16px; background: #0b0b0b; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: .12em; font-size: 10px; transform: translateY(-150%); }
.skip-link:focus { transform: translateY(0); }
:where(a, button, input, select, textarea):focus-visible { outline: 2px solid var(--ng-red); outline-offset: 3px; }
img { max-width: 100%; }

.page-enter-active,
.page-leave-active { transition: opacity .22s ease, transform .22s ease; }
.page-enter-from { opacity: 0; transform: translateY(10px); }
.page-leave-to { opacity: 0; transform: translateY(-6px); }
.lab-page-enter-active,
.lab-page-leave-active { transition: opacity .32s ease, clip-path .42s cubic-bezier(.76,0,.24,1); }
.lab-page-enter-from { opacity: 0; clip-path: inset(0 100% 0 0); }
.lab-page-leave-to { opacity: 0; clip-path: inset(0 0 0 100%); }

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .lab-page-enter-active,
  .lab-page-leave-active { transition: none; }
}

body {
  padding-top: var(--header-height);
}

.app-error-shell {
  min-height: calc(100vh - var(--header-height));
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(225, 6, 0, 0.08), rgba(255, 255, 255, 0.96)),
    #f5f5f5;
}

.app-error-panel {
  width: min(560px, 100%);
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: var(--ng-radius);
  background: rgba(255, 255, 255, 0.96);
  padding: 28px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.12);
}

.app-error-kicker {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  font-size: 10px;
  color: #606060;
}

.app-error-panel h1 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: clamp(26px, 5vw, 38px);
}

.app-error-copy {
  margin: 16px 0 0;
  font-size: 15px;
  line-height: 1.6;
  color: #303030;
}

.app-error-source {
  margin: 12px 0 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #606060;
}

.app-error-actions {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.app-error-button {
  border: 1px solid #0b0b0b;
  background: #0b0b0b;
  color: #fff;
  padding: 12px 16px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  cursor: pointer;
}

.app-error-button-secondary {
  background: #fff;
  color: #0b0b0b;
}

.shop-header {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 160;
  background: rgba(245, 245, 245, 0.96);
  backdrop-filter: blur(14px);
  padding: 12px clamp(12px, 3vw, 24px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: transform 0.28s ease, opacity 0.28s ease;
  will-change: transform, opacity;
}

.shop-header > * {
  min-width: 0;
}

.shop-header .shop-nav {
  max-width: 100%;
}


/* Utility destinations remain available in the footer and account tools. */
.shop-nav > a[href="/about"],
.shop-nav > a[href="/orders"],
.shop-nav > a[href="#contact"] {
  display: none;
}
.header-hidden .shop-header {
  transform: translateY(-120%);
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 700px) {
  .shop-header {
    padding: 10px 12px;
  }
}

/* The mobile/tablet navigation must remain reachable at every scroll position. */
@media (max-width: 1100px) {
  .header-hidden .shop-header,
  .header-hidden .shop-header.menu-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
