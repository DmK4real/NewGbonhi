<template>
  <ScrollProgress />
  <RouterView />
</template>

<script>
import ScrollProgress from "./components/ScrollProgress.vue";

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
    };
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
