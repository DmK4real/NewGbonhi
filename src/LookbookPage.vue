<template>
  <div class="lookbook-page">
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

    <section class="lookbook-hero">
      <div class="hero-copy">
        <p class="hero-kicker">Lookbook</p>
        <h1>Frames from the city</h1>
        <p class="hero-sub">
          A visual journal of Drop 01. Clean cuts, bold marks, no noise.
        </p>
      </div>
      <div class="hero-panel">
        <img class="hero-logo" :src="logoUrl" alt="" />
        <div class="hero-strip">NewGbonhi / Lookbook</div>
      </div>
    </section>

    <section class="gallery">
      <div class="gallery-head">
        <p>Lookbook</p>
        <h2>Drop 01 Gallery</h2>
      </div>
      <div class="gallery-grid">
        <figure v-for="frame in lookbookImages" :key="frame.label" class="gallery-card">
          <img :src="frame.src" :alt="frame.label" loading="lazy" />
          <figcaption>{{ frame.label }}</figcaption>
        </figure>
      </div>
    </section>

    <section class="moodboard">
      <div class="moodboard-head">
        <p>Moodboard</p>
        <h2>Textures & marks</h2>
      </div>
      <div class="moodboard-grid">
        <figure v-for="tile in moodboardImages" :key="tile.label" class="moodboard-tile">
          <img :src="tile.src" :alt="tile.label" loading="lazy" />
          <figcaption>{{ tile.label }}</figcaption>
        </figure>
      </div>
    </section>

    <section class="editorial">
      <div class="editorial-copy">
        <p class="editorial-kicker">Editorial</p>
        <h2>Uniform for the everyday</h2>
        <p>
          Built for movement and repetition. Each graphic is a marker in the
          NewGbonhi language.
        </p>
      </div>
      <div class="editorial-grid">
        <div class="editorial-card">
          <img :src="whiteCameleonUrl" alt="White Cameleon" loading="lazy" />
        </div>
        <div class="editorial-card">
          <img :src="blackCameleonUrl" alt="Black Cameleon" loading="lazy" />
        </div>
      </div>
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
  </div>
</template>

<script>
import CartPanel from "./components/CartPanel.vue";
import { cartStore } from "./data/cart.js";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;
const safeZoneUrl = new URL(
  "./assets/BLACK SAFE zone 4 BOY.png",
  import.meta.url
).href;
const whiteCameleonUrl = new URL(
  "./assets/WHITE CAMELEON.png",
  import.meta.url
).href;
const safeBabiGirlBlackUrl = new URL(
  "./assets/BLACK SAFE BABI GIRL.png",
  import.meta.url
).href;
const whiteSafeBabiGirlUrl = new URL(
  "./assets/WHITE SAFE BABI GIRL.png",
  import.meta.url
).href;
const whiteSafeZoneUrl = new URL(
  "./assets/WHITE SAFE zone 4 BOY.png",
  import.meta.url
).href;
const blackCameleonUrl = new URL(
  "./assets/BLACK CAMELEON.png",
  import.meta.url
).href;
const newGbonhiOnTopUrl = new URL(
  "./assets/NEW GBONHI ON TOP CAMELEON.png",
  import.meta.url
).href;
const newGbonhiOnTopBgabUrl = new URL(
  "./assets/NEW GBONHI ON TOP BGAB.png",
  import.meta.url
).href;
const redCameleonUrl = new URL(
  "./assets/RED CAMELEON.jpeg",
  import.meta.url
).href;

export default {
  name: "LookbookPage",
  components: {
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      cartOpen: false,
      whiteCameleonUrl,
      blackCameleonUrl,
      lookbookImages: [
        {
          src: safeZoneUrl,
          label: "SAFE zone 4 BOY BLACK",
        },
        {
          src: whiteSafeZoneUrl,
          label: "SAFE zone 4 BOY WHITE",
        },
        {
          src: safeBabiGirlBlackUrl,
          label: "SAFE BABI GIRL BLACK",
        },
        {
          src: whiteSafeBabiGirlUrl,
          label: "WHITE SAFE BABI GIRL",
        },
        {
          src: whiteCameleonUrl,
          label: "WHITE CAMELEON",
        },
        {
          src: blackCameleonUrl,
          label: "BLACK CAMELEON",
        },
        {
          src: newGbonhiOnTopUrl,
          label: "NEW GBONHI ON TOP CAMELEON",
        },
        {
          src: newGbonhiOnTopBgabUrl,
          label: "NEW GBONHI ON TOP BGAB",
        },
      ],
      moodboardImages: [
        {
          src: safeZoneUrl,
          label: "SAFE zone 4 BOY BLACK",
        },
        {
          src: whiteCameleonUrl,
          label: "WHITE CAMELEON",
        },
        {
          src: redCameleonUrl,
          label: "RED CAMELEON",
        },
        {
          src: blackCameleonUrl,
          label: "BLACK CAMELEON",
        },
        {
          src: newGbonhiOnTopUrl,
          label: "NEW GBONHI ON TOP CAMELEON",
        },
        {
          src: whiteSafeZoneUrl,
          label: "SAFE zone 4 BOY WHITE",
        },
      ],
    };
  },
  computed: {
    cartCount() {
      return cartStore.cartCount.value;
    },
  },
  methods: {
    toggleCart() {
      this.cartOpen = !this.cartOpen;
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

.lookbook-page {
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

.lookbook-page::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(222, 30, 30, 0.04),
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

.lookbook-hero {
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
  margin: 0;
  color: var(--muted);
  max-width: 420px;
}

.hero-panel {
  background: #0b0b0b;
  border-radius: 16px;
  padding: 18px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hero-logo {
  width: 140px;
  height: 140px;
  object-fit: contain;
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

.gallery {
  margin-top: 32px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  animation: rise 0.75s ease both;
}

.gallery-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.gallery-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.gallery-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.gallery-card {
  position: relative;
  aspect-ratio: 4 / 5;
  border: 1px solid rgba(0, 0, 0, 0.45);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}

.gallery-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  filter: saturate(1.05);
  background: transparent;
}

.gallery-card figcaption {
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

.moodboard {
  margin-top: 32px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  animation: rise 0.76s ease both;
}

.moodboard-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.moodboard-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.moodboard-grid {
  margin-top: 18px;
  column-count: 3;
  column-gap: 16px;
}

.moodboard-tile {
  break-inside: avoid;
  margin: 0 0 16px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.35);
  background: #fff;
}

.moodboard-tile img {
  width: 100%;
  display: block;
  object-fit: contain;
  object-position: center;
  transition: transform 0.3s ease;
  background: transparent;
}

.moodboard-tile:hover img {
  transform: scale(1.04);
}

.moodboard-tile figcaption {
  padding: 8px 10px;
  background: #0b0b0b;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 10px;
}

.editorial {
  margin-top: 32px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  display: grid;
  gap: 20px;
  animation: rise 0.8s ease both;
}

.editorial-copy {
  max-width: 520px;
}

.editorial-kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.editorial-copy h2 {
  margin: 8px 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.editorial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.editorial-card {
  border: 1px solid rgba(0, 0, 0, 0.45);
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
}

.editorial-card img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  background: transparent;
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
  .lookbook-hero {
    grid-template-columns: 1fr;
  }

  .moodboard-grid {
    column-count: 2;
  }
}

@media (max-width: 700px) {
  .lookbook-page {
    padding: 24px 16px 40px;
  }

  .shop-header {
    align-items: flex-start;
  }

  .shop-cta {
    width: 100%;
  }

  .moodboard-grid {
    column-count: 1;
  }
}
</style>
