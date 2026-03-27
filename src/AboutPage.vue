<template>
  <div class="about-page">
    <header class="shop-header">
      <div class="brand">
        <img class="brand-logo" :src="logoUrl" alt="NewGbonhi logo" />
        <div class="brand-meta">
          <p class="brand-name">NewGbonhi</p>
          <p class="brand-tagline">Drop 02 // En preparation</p>
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
        <h1>Drop details</h1>
        <p class="hero-sub">
          Fiche technique du drop: coupe, tissu, finition et recommandations de
          port. Tout est pense pour un usage quotidien durable.
        </p>
      </div>
      <div class="hero-panel">
        <img class="hero-logo" :src="logoUrl" alt="" />
        <div class="hero-strip">NewGbonhi / Technical notes</div>
      </div>
    </section>

    <section class="drop-specs">
      <div class="specs-head">
        <p>Drop 02 details</p>
        <h2>Cut, fabric, finish</h2>
      </div>
      <div class="specs-grid">
        <article v-for="spec in dropSpecs" :key="spec.title" class="spec-card">
          <h3>{{ spec.title }}</h3>
          <p>{{ spec.text }}</p>
        </article>
      </div>
    </section>

    <section class="fit-section">
      <div class="fit-head">
        <p>Fit guide</p>
        <h2>Tailles & recommandations</h2>
      </div>
      <div class="fit-grid">
        <article class="fit-card">
          <h3>T-shirts</h3>
          <p>Coupe droite relax. Taille habituelle pour fit standard.</p>
        </article>
        <article class="fit-card">
          <h3>Crop tops</h3>
          <p>Coupe courte pres du corps. Prends une taille au-dessus pour plus d'aisance.</p>
        </article>
        <article class="fit-card">
          <h3>Entretien</h3>
          <p>Lavage a froid, a l'envers. Repassage doux hors visuel.</p>
        </article>
      </div>
    </section>

    <section class="story-section">
      <div class="story-head">
        <p>Vision</p>
        <h2>Pourquoi ce drop</h2>
      </div>
      <div class="story-copy">
        <p>
          NewGbonhi construit un vestiaire street clair: peu de bruit visuel,
          des pieces qui tournent facilement, et des graphiques qui signent
          l'identite.
        </p>
        <p>
          Chaque article du drop est pense pour etre porte souvent, combine
          simplement, et garder sa lecture dans le temps.
        </p>
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

export default {
  name: "AboutPage",
  components: {
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      cartOpen: false,
      dropSpecs: [
        {
          title: "Cut",
          text: "Silhouette street relax: epaules legerement descendues, buste droit.",
        },
        {
          title: "Fabric",
          text: "Jersey coton majoritaire avec toucher sec et tenue stable.",
        },
        {
          title: "Weight",
          text: "Grammage moyen pour equilibrer confort, tenue et resistance.",
        },
        {
          title: "Print",
          text: "Impression graphique a contraste eleve pour lecture nette.",
        },
        {
          title: "Finish",
          text: "Col et coutures renforces sur les zones de tension.",
        },
        {
          title: "Colorway",
          text: "Base noir/blanc avec accents visuels NewGbonhi.",
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
  max-width: 500px;
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

.drop-specs,
.fit-section,
.story-section {
  margin-top: 28px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
}

.specs-head p,
.fit-head p,
.story-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.specs-head h2,
.fit-head h2,
.story-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.specs-grid,
.fit-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.spec-card,
.fit-card {
  border: 1px solid rgba(0, 0, 0, 0.16);
  border-radius: 14px;
  padding: 14px;
  background: #fafafa;
}

.spec-card h3,
.fit-card h3 {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
}

.spec-card p,
.fit-card p {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.story-copy {
  margin-top: 14px;
  display: grid;
  gap: 12px;
  max-width: 760px;
}

.story-copy p {
  margin: 0;
  color: var(--muted);
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

  .footer-links {
    flex-direction: column;
  }
}
</style>
