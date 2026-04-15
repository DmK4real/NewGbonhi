<template>
  <div class="lookbook-page">
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

    <section class="lookbook-hero">
      <div class="hero-copy">
        <p class="hero-kicker">Lookbook</p>
        <h1>Gallery of worn looks</h1>
        <p class="hero-sub">
          NewGbonhi pieces in real-life use: street, movement, and everyday
          wear. Each look shows the fit and attitude of the drop.
        </p>
      </div>
      <div class="hero-panel">
        <img class="hero-logo" :src="logoUrl" alt="" />
        <div class="hero-strip">Street looks / Drop 02</div>
      </div>
    </section>

    <section class="looks-gallery">
      <div class="gallery-head">
        <p>Worn looks</p>
        <h2>Editorial selection</h2>
      </div>
      <div class="gallery-grid">
        <article v-for="look in wornLooks" :key="look.title" class="look-card">
          <div class="look-media">
            <img :src="look.src" :alt="look.title" loading="lazy" />
          </div>
          <div class="look-info">
            <p class="look-scene">{{ look.scene }}</p>
            <h3>{{ look.title }}</h3>
            <p>{{ look.note }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="styling-notes">
      <div class="notes-head">
        <p>Styling</p>
        <h2>How to style the drop</h2>
      </div>
      <div class="notes-grid">
        <article class="note-card">
          <h3>Clean oversized fit</h3>
          <p>Go one size up for a wider silhouette.</p>
        </article>
        <article class="note-card">
          <h3>Monochrome + accent</h3>
          <p>Start with black or white, then add a strong graphic contrast.</p>
        </article>
        <article class="note-card">
          <h3>Light layering</h3>
          <p>Add a simple outer layer while keeping the print readable.</p>
        </article>
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
import { cartStore } from "./data/cart.ts";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;
const safeZoneBlackUrl = new URL(
  "./assets/BLACK SAFE zone 4 BOY.png",
  import.meta.url
).href;
const safeZoneWhiteUrl = new URL(
  "./assets/WHITE SAFE zone 4 BOY.png",
  import.meta.url
).href;
const safeBabiGirlBlackUrl = new URL(
  "./assets/BLACK SAFE BABI GIRL.png",
  import.meta.url
).href;
const safeBabiGirlWhiteUrl = new URL(
  "./assets/WHITE SAFE BABI GIRL.png",
  import.meta.url
).href;
const blackCameleonUrl = new URL("./assets/BLACK CAMELEON.png", import.meta.url).href;
const whiteCameleonUrl = new URL("./assets/WHITE CAMELEON.png", import.meta.url).href;
const onTopCameleonUrl = new URL(
  "./assets/NEW GBONHI ON TOP CAMELEON.png",
  import.meta.url
).href;
const onTopBgabUrl = new URL(
  "./assets/NEW GBONHI ON TOP BGAB.png",
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
      wornLooks: [
        {
          src: safeZoneBlackUrl,
          title: "SAFE zone 4 BOY / Black",
          scene: "Look 01 / Daywear",
          note: "Straight fit with a front graphic for a clean daily look.",
        },
        {
          src: safeZoneWhiteUrl,
          title: "SAFE zone 4 BOY / White",
          scene: "Look 02 / Daylight",
          note: "Light version for a brighter silhouette.",
        },
        {
          src: safeBabiGirlBlackUrl,
          title: "SAFE BABI GIRL / Black",
          scene: "Look 03 / City run",
          note: "Anchored look, strong contrast, clear print readability.",
        },
        {
          src: safeBabiGirlWhiteUrl,
          title: "SAFE BABI GIRL / White",
          scene: "Look 04 / Street light",
          note: "Minimal approach with a white base and centered graphic.",
        },
        {
          src: blackCameleonUrl,
          title: "BLACK CAMELEON",
          scene: "Look 05 / Night move",
          note: "Statement piece, worn oversized with a clean lower half.",
        },
        {
          src: whiteCameleonUrl,
          title: "WHITE CAMELEON",
          scene: "Look 06 / Clean mode",
          note: "Light version with sharper graphic readability in details.",
        },
        {
          src: onTopCameleonUrl,
          title: "NG ON TOP CAMELEON",
          scene: "Look 07 / Crop set",
          note: "Core crop top of the drop, styled with denim or cargo.",
        },
        {
          src: onTopBgabUrl,
          title: "NG ON TOP BGAB",
          scene: "Look 08 / Crop set",
          note: "Short and sharp look built for urban summer.",
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
  max-width: 460px;
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

.looks-gallery {
  margin-top: 32px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
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
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.look-card {
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
  display: grid;
}

.look-media {
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.look-media img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: contain;
  display: block;
}

.look-info {
  padding: 14px;
  display: grid;
  gap: 8px;
}

.look-scene {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 10px;
  color: var(--muted);
}

.look-info h3 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 14px;
}

.look-info p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.styling-notes {
  margin-top: 28px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
}

.notes-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.notes-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.notes-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.note-card {
  border: 1px solid rgba(0, 0, 0, 0.16);
  border-radius: 14px;
  padding: 14px;
  background: #fafafa;
}

.note-card h3 {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
}

.note-card p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
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

  .footer-links {
    flex-direction: column;
  }
}
</style>
