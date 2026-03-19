<template>
  <div class="about-page">
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

    <section class="about-hero">
      <div class="hero-copy">
        <p class="hero-kicker">About</p>
        <h1>NewGbonhi studio</h1>
        <p class="hero-sub">
          A graphic language built from city textures. Clean silhouettes, bold
          marks, and repeat wear.
        </p>
      </div>
      <div class="hero-panel">
        <img class="hero-logo" :src="logoUrl" alt="" />
        <div class="hero-strip">NewGbonhi / Studio</div>
      </div>
    </section>

    <section class="about-section">
      <div class="about-head">
        <p>Studio</p>
        <h2>NewGbonhi studio</h2>
      </div>
      <div class="about-content">
        <p>
          NewGbonhi blends graphic statements with everyday uniforms. Each drop
          is built for repeat wear, clean silhouettes, and bold marks.
        </p>
        <p>
          Drop 01 focuses on tees, crop tops, and pants with a monochrome base
          and red signal accents.
        </p>
      </div>
      <div class="timeline">
        <div class="timeline-head">
          <p>Timeline</p>
          <h3>Drop 01 journey</h3>
        </div>
        <div class="timeline-grid">
          <article v-for="step in timeline" :key="step.title" class="timeline-card">
            <span class="timeline-date">{{ step.date }}</span>
            <h4>{{ step.title }}</h4>
            <p>{{ step.text }}</p>
          </article>
        </div>
      </div>

<div class="art-section">
        <div class="art-head">
          <p>New Gbonhi Art</p>
          <h3>Backstage de creation</h3>
        </div>
        <div class="art-grid">
          <article v-for="story in artStories" :key="story.title" class="art-card">
            <img :src="story.src" :alt="story.title" loading="lazy" />
            <div class="art-text">
              <h4>{{ story.title }}</h4>
              <p>{{ story.text }}</p>
            </div>
          </article>
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
const youngWildUrl = new URL(
  "./assets/YOUNG WILD & FREE.jpeg",
  import.meta.url
).href;
const brightArtUrl = new URL(
  "./assets/BRIGHT ART NEW GBONHI.jpeg",
  import.meta.url
).href;
const watchThroneUrl = new URL(
  "./assets/WATCH THE THRONE.jpeg",
  import.meta.url
).href;

export default {
  name: "AboutPage",
  components: {
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      cartOpen: false,
      timeline: [
        {
          date: "Phase 01",
          title: "Sketch & direction",
          text: "Moodboard, typographies, and silhouettes for Drop 01.",
        },
        {
          date: "Phase 02",
          title: "Print tests",
          text: "Prototype prints to validate texture and contrast.",
        },
        {
          date: "Phase 03",
          title: "Sampling",
          text: "Fit checks, sizing, and wear tests.",
        },
        {
          date: "Phase 04",
          title: "Launch",
          text: "48h window, limited release, and restock planning.",
        },
      ],
      artStories: [
        {
          src: youngWildUrl,
          title: "YOUNG WILD & FREE",
          text:
            "Espace pour raconter l'histoire: l'inspiration, le lieu, et le moment ou ce visuel est ne.",
        },
        {
          src: brightArtUrl,
          title: "BRIGHT ART NEW GBONHI",
          text:
            "Espace pour expliquer le processus creatif, les essais, et l'idee derriere la piece.",
        },
        {
          src: watchThroneUrl,
          title: "WATCH THE THRONE",
          text:
            "Espace pour raconter la vision artistique et la symbolique derriere ce drop.",
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

.about-page {
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

.about-page::before {
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

.about-hero {
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

.about-section {
  margin-top: 32px;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  display: grid;
  gap: 16px;
  animation: rise 0.78s ease both;
}

.about-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.about-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.about-content {
  color: var(--muted);
  max-width: 720px;
}

.about-content p {
  margin: 0 0 12px;
}

.timeline {
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 16px;
  background: #f9f9f9;
  display: grid;
  gap: 12px;
}

.timeline-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.timeline-head h3 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 16px;
}

.timeline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.timeline-card {
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 14px;
  padding: 12px;
  background: #fff;
  display: grid;
  gap: 8px;
}

.timeline-date {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
  color: var(--muted);
}

.timeline-card h4 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
}

.timeline-card p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}

.art-section {
  display: grid;
  gap: 16px;
}

.art-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.art-head h3 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 16px;
}

.art-grid {
  display: grid;
  gap: 16px;
}

.art-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  border: 1px solid rgba(0, 0, 0, 0.35);
  border-radius: 16px;
  background: #f7f7f7;
  overflow: hidden;
}

.art-card img {
  width: 100%;
  height: 100%;
  min-height: 200px;
  object-fit: cover;
  display: block;
}

.art-text {
  padding: 16px;
  display: grid;
  gap: 8px;
  align-content: start;
}

.art-text h4 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 12px;
}

.art-text p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
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
  .about-hero {
    grid-template-columns: 1fr;
  }

  .art-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .about-page {
    padding: 24px 16px 40px;
  }

  .shop-header {
    align-items: flex-start;
  }

  .shop-cta {
    width: 100%;
  }
}
</style>
