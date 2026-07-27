<template>
  <div class="lookbook-page">
    <SiteHeader @toggle-cart="toggleCart" />

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <section class="lookbook-hero">
      <div class="hero-copy">
        <div class="journal-index">
          <span>ARCHIVE / 001</span>
          <span>ABIDJAN / 2026</span>
        </div>
        <p class="hero-kicker">{{ $t("navLookbook") }}</p>
        <h1>{{ $t("galleryWornLooks") }}</h1>
        <p class="hero-sub">
          {{ $t("lookbookSub") }}
        </p>
      </div>
      <div class="hero-panel">
        <img class="hero-logo" :src="logoUrl" alt="" decoding="async" />
        <div class="hero-strip">{{ $t("streetLooks") }}</div>
      </div>
    </section>

    <section class="journal-feature" aria-labelledby="journal-feature-title">
      <div class="journal-feature-copy">
        <p>STORY / 001 — ABIDJAN</p>
        <h2 id="journal-feature-title">ARW Film enters the NewGbonhi archive</h2>
        <blockquote>
          A capsule built around the city, chrome identities and the people shaping a new visual language.
        </blockquote>
        <dl>
          <div><dt>Direction</dt><dd>ARW Studio</dd></div>
          <div><dt>Series</dt><dd>Drop 03 / 2026</dd></div>
          <div><dt>Location</dt><dd>Abidjan, Côte d’Ivoire</dd></div>
        </dl>
        <RouterLink to="/lab/arw-studio">Open the resident room <span>↗</span></RouterLink>
      </div>
      <div class="journal-feature-visual">
        <img :src="arwFilmCityWhiteFrontUrl" alt="ARW Film City Tee, white edition" />
        <span>ARCHIVE IMAGE / 03—001</span>
      </div>
    </section>

    <section class="journal-index-section" aria-labelledby="journal-index-title">
      <header>
        <div>
          <p>JOURNAL / INDEX</p>
          <h2 id="journal-index-title">Stories, process and objects</h2>
        </div>
        <span>03 ENTRIES / 2026</span>
      </header>
      <div class="journal-story-grid">
        <RouterLink
          v-for="(story, index) in journalStories"
          :key="story.title"
          :to="story.to"
          class="journal-story"
        >
          <div class="journal-story-media">
            <img :src="story.image" :alt="story.title" loading="lazy" decoding="async" />
            <span>0{{ index + 2 }}</span>
          </div>
          <div class="journal-story-copy">
            <p>{{ story.type }} / {{ story.date }}</p>
            <h3>{{ story.title }}</h3>
            <span>{{ story.excerpt }}</span>
            <b>{{ story.cta }} ↗</b>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="looks-gallery">
      <div class="gallery-head">
        <p>ARCHIVE / 002 — {{ $t("wornLooks") }}</p>
        <h2>{{ $t("editorialSelection") }}</h2>
      </div>
      <div class="gallery-grid">
        <component
          :is="look.to ? 'RouterLink' : 'article'"
          v-for="look in wornLooks"
          :key="look.title"
          :to="look.to"
          class="look-card"
          :class="{ 'is-cutout': look.cutout }"
        >
          <div
            class="look-media"
            :class="{ 'look-media-dual': look.secondarySrc }"
          >
            <img :src="look.src" :alt="look.title" loading="lazy" decoding="async" />
            <img
              v-if="look.secondarySrc"
              :src="look.secondarySrc"
              :alt="`${look.title} back`"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="look-info">
            <p class="look-scene">{{ look.scene }}</p>
            <h3>{{ look.title }}</h3>
            <p>{{ look.note }}</p>
          </div>
        </component>
      </div>
    </section>

    <section class="styling-notes">
      <div class="notes-head">
        <p>{{ $t("styling") }}</p>
        <h2>{{ $t("howToStyle") }}</h2>
      </div>
      <div class="notes-grid">
        <article class="note-card">
          <h3>{{ $t("oversizedFit") }}</h3>
          <p>{{ $t("oversizedFitText") }}</p>
        </article>
        <article class="note-card">
          <h3>{{ $t("monoAccent") }}</h3>
          <p>{{ $t("monoAccentText") }}</p>
        </article>
        <article class="note-card">
          <h3>{{ $t("lightLayering") }}</h3>
          <p>{{ $t("lightLayeringText") }}</p>
        </article>
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
const arwFilmLogoTeeUrl = new URL(
  "./assets/ARW FILM TEE FRONT CUTOUT.png",
  import.meta.url
).href;
const arwFilmCityBlackFrontUrl = new URL(
  "./assets/ARW FILM CITY TEE BLACK FRONT CUTOUT.png",
  import.meta.url
).href;
const arwFilmCityBlackBackUrl = new URL(
  "./assets/ARW FILM CITY TEE BLACK BACK CUTOUT.png",
  import.meta.url
).href;
const arwFilmCityWhiteFrontUrl = new URL(
  "./assets/ARW FILM CITY TEE WHITE FRONT CUTOUT.png",
  import.meta.url
).href;
const arwFilmCityWhiteBackUrl = new URL(
  "./assets/ARW FILM CITY TEE WHITE BACK CUTOUT.png",
  import.meta.url
).href;

export default {
  name: "LookbookPage",
  components: {
    SiteHeader,
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      arwFilmCityWhiteFrontUrl,
      cartOpen: false,
      journalStories: [
        {
          type: "PROCESS",
          date: "JUL 2026",
          title: "Inside the ARW Studio room",
          excerpt: "Chrome marks, city references and the visual process behind Drop 03.",
          cta: "Open the room",
          image: arwFilmLogoTeeUrl,
          to: "/lab/arw-studio",
        },
        {
          type: "OBJECT",
          date: "DROP 03",
          title: "The City Tee, front to back",
          excerpt: "A closer look at the white edition and its architectural back graphic.",
          cta: "View the piece",
          image: arwFilmCityWhiteBackUrl,
          to: "/product/arw-film-city-tee-white",
        },
        {
          type: "STUDIO",
          date: "ONGOING",
          title: "Compose your own NewGbonhi piece",
          excerpt: "Choose a base, place the visual and build an individual edition.",
          cta: "Enter Create",
          image: onTopCameleonUrl,
          to: "/studio",
        },
      ],
      wornLooks: [
        {
          src: arwFilmCityWhiteFrontUrl,
          secondarySrc: arwFilmCityWhiteBackUrl,
          title: "ARW FILM CITY TEE / White",
          scene: "Drop 03 / Front + back",
          note: "White edition with NewGbonhi x ARW Film chest marks and the city building back print.",
          to: "/product/arw-film-city-tee-white",
        },
        {
          src: arwFilmCityBlackFrontUrl,
          secondarySrc: arwFilmCityBlackBackUrl,
          title: "ARW FILM CITY TEE / Black",
          scene: "Drop 03 / Front + back",
          note: "Black edition with NewGbonhi x ARW Film chest marks and the city building back print.",
          to: "/product/arw-film-city-tee-black",
        },
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
  border-radius: var(--ng-radius);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 24px;
  background: #fff;
  animation: rise 0.7s ease both;
}

.journal-index {
  margin-bottom: 28px;
  padding: 10px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid rgba(11, 11, 11, 0.2);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font: 700 9px/1.2 monospace;
  letter-spacing: 0.16em;
  text-transform: uppercase;
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
  border-radius: var(--ng-radius);
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
  border-radius: var(--ng-radius);
  color: #fff;
}

.journal-feature {
  margin-top: 32px;
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
  border: 1px solid var(--line);
  background: #0b0b0b;
  color: #fff;
}
.journal-feature-copy {
  padding: clamp(28px, 5vw, 64px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.journal-feature-copy > p,
.journal-feature-visual > span {
  margin: 0;
  font: 700 9px/1.2 monospace;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgba(255,255,255,.58);
}
.journal-feature-copy h2 {
  margin: 18px 0 24px;
  font-family: "Archivo Black", "Space Grotesk", sans-serif;
  font-size: clamp(32px, 5vw, 64px);
  line-height: .94;
  text-transform: uppercase;
}
.journal-feature-copy blockquote {
  margin: 0;
  max-width: 520px;
  font-size: clamp(17px, 2vw, 23px);
  line-height: 1.45;
}
.journal-feature-copy dl { margin: 32px 0; }
.journal-feature-copy dl div {
  padding: 9px 0;
  border-top: 1px solid rgba(255,255,255,.22);
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 12px;
  font: 700 10px/1.3 monospace;
  text-transform: uppercase;
}
.journal-feature-copy dt { color: rgba(255,255,255,.5); }
.journal-feature-copy dd { margin: 0; }
.journal-feature-copy a {
  align-self: flex-start;
  color: #fff;
  text-decoration: none;
  border-bottom: 1px solid;
  padding-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: .14em;
  font-size: 10px;
}
.journal-feature-copy a span { color: var(--accent); }
.journal-feature-visual {
  min-height: 620px;
  padding: 18px;
  display: grid;
  grid-template-rows: 1fr auto;
  background: var(--accent);
}
.journal-feature-visual img {
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: contain;
}
.journal-index-section {
  margin-top: 32px;
  padding: clamp(24px, 4vw, 46px);
  border: 1px solid var(--line);
  background: #fff;
}
.journal-index-section > header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line);
}
.journal-index-section header p,
.journal-index-section header > span {
  margin: 0;
  font: 700 9px/1.2 monospace;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--muted);
}
.journal-index-section h2 {
  margin: 9px 0 0;
  font-family: "Archivo Black", "Space Grotesk", sans-serif;
  font-size: clamp(30px, 5vw, 58px);
  line-height: .95;
  text-transform: uppercase;
}
.journal-story-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.journal-story {
  min-width: 0;
  padding: 22px;
  border-right: 1px solid var(--line);
  color: inherit;
  text-decoration: none;
}
.journal-story:last-child { border-right: 0; }
.journal-story-media {
  position: relative;
  aspect-ratio: 4 / 3;
  background: #f0f0ec;
  overflow: hidden;
}
.journal-story-media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform .3s ease;
}
.journal-story-media > span {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 8px;
  background: #0b0b0b;
  color: #fff;
  font: 700 9px/1 monospace;
}
.journal-story-copy { padding-top: 18px; }
.journal-story-copy p {
  margin: 0;
  color: var(--accent);
  font: 700 9px/1.2 monospace;
  letter-spacing: .15em;
}
.journal-story-copy h3 {
  margin: 12px 0;
  font-size: clamp(18px, 2.2vw, 28px);
  line-height: 1;
  text-transform: uppercase;
}
.journal-story-copy > span {
  display: block;
  min-height: 58px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}
.journal-story-copy b {
  display: inline-block;
  margin-top: 18px;
  border-bottom: 1px solid;
  padding-bottom: 5px;
  font-size: 9px;
  letter-spacing: .14em;
  text-transform: uppercase;
}
.journal-story:hover .journal-story-media img { transform: scale(1.06); }
.journal-story:hover .journal-story-copy b { color: var(--accent); }
.looks-gallery {
  margin-top: 32px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: var(--ng-radius);
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
  border-radius: var(--ng-radius);
  background: #fff;
  overflow: hidden;
  display: grid;
  color: inherit;
  text-decoration: none;
  transition: border-color .2s ease, transform .2s ease;
}
.look-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
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

.look-media-dual {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.look-media-dual img {
  min-width: 0;
}

.look-card.is-cutout .look-media {
  background: transparent;
  border-bottom-color: transparent;
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
  border-radius: var(--ng-radius);
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
  border-radius: var(--ng-radius);
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
  .journal-feature { grid-template-columns: 1fr; }
  .journal-feature-visual { min-height: 460px; }
  .journal-story-grid { grid-template-columns: 1fr; }
  .journal-story { border-right: 0; border-bottom: 1px solid var(--line); }
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
