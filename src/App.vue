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
    };
  },
  mounted() {
    this.lastScrollY = window.scrollY || 0;
    if (this.lastScrollY > 0) {
      document.documentElement.classList.add("header-hidden");
    }
    window.addEventListener("scroll", this.onScroll, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.onScroll);
    document.documentElement.classList.remove("header-hidden");
  },
  methods: {
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
  padding: 12px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: transform 0.28s ease, opacity 0.28s ease;
  will-change: transform, opacity;
}

.header-hidden .shop-header {
  transform: translateY(-120%);
  opacity: 0;
  pointer-events: none;
}
</style>
