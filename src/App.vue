<template>
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
  <RouterView v-else />
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
      document.documentElement.classList.add("header-hidden");
    }
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.syncHeaderHeight, { passive: true });
    this.$nextTick(() => {
      this.observeHeader();
    });
  },
  updated() {
    this.observeHeader();
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.syncHeaderHeight);
    this.disconnectHeaderObserver();
    document.documentElement.classList.remove("header-hidden");
    document.documentElement.style.removeProperty("--header-height");
  },
  methods: {
    observeHeader() {
      const header = document.querySelector(".shop-header");
      if (header === this.observedHeader) {
        this.syncHeaderHeight();
        return;
      }

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
      const header = this.observedHeader || document.querySelector(".shop-header");
      if (!header) {
        document.documentElement.style.setProperty("--header-height", "88px");
        return;
      }
      const measured = Math.ceil(header.getBoundingClientRect().height);
      const safeHeight = Math.max(88, measured + 8);
      document.documentElement.style.setProperty("--header-height", `${safeHeight}px`);
    },
    onScroll() {
      const currentY = window.scrollY || 0;
      if (currentY > 0) {
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
  --header-height: 88px;
}

html {
  scroll-padding-top: var(--header-height);
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
  border-radius: 24px;
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
</style>
