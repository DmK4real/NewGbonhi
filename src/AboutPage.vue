<template>
  <div class="about-page">
    <SiteHeader @toggle-cart="toggleCart" />

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <section class="about-hero">
      <div class="hero-copy">
        <div class="about-index"><span>ABOUT / 001</span><span>ABIDJAN / 2026</span></div>
        <p class="hero-kicker">{{ $t("about") }}</p>
        <h1>{{ $t("dropDetails") }}</h1>
        <p class="hero-sub">
          {{ $t("aboutHeroSub") }}
        </p>
      </div>
      <div class="hero-panel">
        <img class="hero-logo" :src="logoUrl" alt="" decoding="async" />
        <div class="hero-strip">{{ $t("technicalNotes") }}</div>
      </div>
    </section>

    <section class="drop-specs">
      <div class="specs-head">
        <p>{{ $t("drop02Details") }}</p>
        <h2>{{ $t("cutFabricFinish") }}</h2>
      </div>
      <div class="specs-grid">
        <article v-for="spec in dropSpecs" :key="spec.titleKey" class="spec-card">
          <h3>{{ $t(spec.titleKey) }}</h3>
          <p>{{ $t(spec.textKey) }}</p>
        </article>
      </div>
    </section>

    <section class="fit-section">
      <div class="fit-head">
        <p>{{ $t("fitGuide") }}</p>
        <h2>{{ $t("sizesRecommendations") }}</h2>
      </div>
      <div class="fit-grid">
        <article class="fit-card">
          <h3>T-shirts</h3>
          <p>{{ $t("tshirtsFit") }}</p>
        </article>
        <article class="fit-card">
          <h3>Crop tops</h3>
          <p>{{ $t("cropTopsFit") }}</p>
        </article>
        <article class="fit-card">
          <h3>{{ $t("care") }}</h3>
          <p>{{ $t("careText") }}</p>
        </article>
      </div>
    </section>

    <section class="story-section">
      <div class="story-head">
        <p>{{ $t("vision") }}</p>
        <h2>{{ $t("whyThisDrop") }}</h2>
      </div>
      <div class="story-copy">
        <p>
          {{ $t("storyOne") }}
        </p>
        <p>
          {{ $t("storyTwo") }}
        </p>
        <blockquote>NEWGBONHI IS A LIVING ARCHIVE OF OBJECTS, PEOPLE AND IDEAS FROM ABIDJAN.</blockquote>
        <div class="story-links">
          <RouterLink to="/lab">Explore Lab ↗</RouterLink>
          <RouterLink to="/lookbook">Open Journal ↗</RouterLink>
        </div>
      </div>
    </section>

    <SiteFooter />
  </div>
</template>

<script>
import SiteHeader from "./components/SiteHeader.vue";
import CartPanel from "./components/CartPanel.vue";
import { cartStore } from "./data/cart.ts";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;

export default {
  name: "AboutPage",
  components: {
    SiteHeader,
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      cartOpen: false,
      dropSpecs: [
        {
          titleKey: "cut",
          textKey: "cutText",
        },
        {
          titleKey: "fabric",
          textKey: "fabricText",
        },
        {
          titleKey: "weight",
          textKey: "weightText",
        },
        {
          titleKey: "print",
          textKey: "printText",
        },
        {
          titleKey: "finish",
          textKey: "finishText",
        },
        {
          titleKey: "colorway",
          textKey: "colorwayText",
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

/* Editorial about page */
.about-hero { padding: clamp(28px,5vw,62px); border-radius: var(--ng-radius); background: #0b0b0b; color: #fff; }
.about-index { margin-bottom: 28px; padding: 10px 0; border-top: 1px solid rgba(255,255,255,.4); border-bottom: 1px solid rgba(255,255,255,.2); display: flex; justify-content: space-between; gap: 16px; font: 700 9px/1.2 monospace; letter-spacing: .14em; }
.hero-copy h1 { font-size: clamp(42px,7vw,86px); line-height: .9; }
.hero-sub { color: rgba(255,255,255,.64); line-height: 1.7; }
.hero-panel { border-radius: var(--ng-radius); border: 1px solid rgba(255,255,255,.24); }
.hero-strip { border-radius: var(--ng-radius); }
.drop-specs,
.fit-section,
.story-section { margin-top: var(--ng-space-section); padding: clamp(24px,5vw,54px); border-radius: var(--ng-radius); }
.specs-head h2,
.fit-head h2,
.story-head h2 { max-width: 850px; font-family: "Archivo Black","Space Grotesk",sans-serif; font-size: clamp(30px,5vw,60px); line-height: .94; }
.specs-grid { grid-template-columns: repeat(3,minmax(0,1fr)); gap: 0; border-top: 1px solid rgba(0,0,0,.18); border-left: 1px solid rgba(0,0,0,.18); }
.spec-card,
.fit-card { border-radius: var(--ng-radius); background: transparent; }
.spec-card { min-height: 150px; border: 0; border-right: 1px solid rgba(0,0,0,.18); border-bottom: 1px solid rgba(0,0,0,.18); padding: 20px; }
.fit-grid { gap: 0; }
.fit-card { padding: 24px; border-right: 0; border-bottom: 0; border-top: 1px solid rgba(0,0,0,.18); }
.story-section {
  display: grid;
  grid-template-columns: minmax(280px, .72fr) minmax(0, 1.28fr);
  gap: clamp(40px, 7vw, 104px);
  align-items: start;
  background: #e10600;
  color: #fff;
}
.story-head p,
.story-copy p { color: inherit; }
.story-head h2 {
  max-width: 430px;
  margin-top: 18px;
  font-size: clamp(36px, 4.2vw, 64px);
  line-height: .94;
  letter-spacing: 0;
  text-wrap: balance;
}
.story-copy {
  margin: 0;
  max-width: 820px;
  gap: 20px;
  font-size: clamp(16px, 1.65vw, 21px);
  line-height: 1.55;
}
.story-copy p {
  max-width: 760px;
  text-wrap: pretty;
}
.story-copy blockquote {
  max-width: 760px;
  margin: 34px 0 0;
  padding-top: 30px;
  border-top: 1px solid rgba(255,255,255,.45);
  font-family: "Archivo Black","Space Grotesk",sans-serif;
  font-size: clamp(25px, 3.2vw, 44px);
  line-height: 1.02;
  letter-spacing: -.02em;
  text-wrap: balance;
}
.story-links { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 28px; }
.story-links a { color: #fff; text-decoration: none; border-bottom: 1px solid; padding-bottom: 5px; font: 700 10px/1.2 monospace; letter-spacing: .12em; text-transform: uppercase; }

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
  .story-section { grid-template-columns: 1fr; }
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
  .specs-grid { grid-template-columns: 1fr; }
  .about-index { flex-direction: column; }
}
</style>
