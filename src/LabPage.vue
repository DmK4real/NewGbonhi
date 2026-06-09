<template>
  <div class="lab-page">
    <header class="shop-header">
      <div class="brand">
        <img class="brand-logo" :src="logoUrl" alt="NewGbonhi logo" />
        <div class="brand-meta">
          <p class="brand-name">NewGbonhi</p>
          <p class="brand-tagline">{{ $t("brandTagline") }}</p>
        </div>
      </div>
      <nav class="shop-nav" aria-label="Primary">
        <RouterLink :class="{ 'is-active': $route.name === 'shop' }" to="/">
          {{ $t("navShop") }}
        </RouterLink>
        <RouterLink
          :class="{ 'is-active': $route.name === 'lookbook' }"
          to="/lookbook"
        >
          {{ $t("navLookbook") }}
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'lab' }" to="/lab">
          {{ $t("navLab") }}
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'studio' }" to="/studio">
          {{ $t("navStudio") }}
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'about' }" to="/about">
          {{ $t("navAbout") }}
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'orders' }" to="/orders">
          {{ $t("navOrders") }}
        </RouterLink>
        <a href="#contact">{{ $t("navContact") }}</a>
      </nav>
      <button class="shop-cta" type="button" @click="toggleCart">
        {{ $t("cart") }} ({{ cartCount }})
      </button>
    </header>

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <main>
      <section class="lab-hero">
        <div class="hero-copy">
          <p class="eyebrow">{{ pageCopy.heroKicker }}</p>
          <h1>{{ pageCopy.heroTitle }}</h1>
          <p class="hero-sub">{{ pageCopy.heroSub }}</p>
          <div class="hero-actions">
            <a class="lab-button" href="#clients">
              {{ pageCopy.primaryCta }}
            </a>
            <RouterLink class="lab-button lab-button-light" to="/lab/arw-studio">
              {{ pageCopy.secondaryCta }}
            </RouterLink>
          </div>
        </div>

        <div class="hero-showcase" aria-label="NewGbonhi Lab showcase">
          <div class="showcase-meta">
            <span>Resident 001</span>
            <strong>ARW Studio</strong>
          </div>
          <div class="showcase-stage">
            <img class="showcase-lockup" :src="collabLockup" alt="ARW Film x NewGbonhi" />
            <img class="showcase-shirt" :src="cityWhiteTee" alt="" />
            <img class="showcase-mark" :src="arwLogo" alt="" />
            <img class="showcase-cup" :src="cupSticker" alt="" />
          </div>
          <div class="showcase-footer">
            <span>Drop 03</span>
            <span>Digital showroom</span>
          </div>
        </div>
      </section>

      <section class="lab-system" aria-labelledby="lab-system-title">
        <div class="section-heading">
          <p class="eyebrow">{{ pageCopy.systemKicker }}</p>
          <h2 id="lab-system-title">{{ pageCopy.systemTitle }}</h2>
        </div>
        <div class="system-grid">
          <article v-for="item in pageCopy.systemItems" :key="item.title">
            <span>{{ item.number }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </section>

      <section id="arw-studio" class="resident-section">
        <div class="resident-copy">
          <p class="eyebrow">{{ pageCopy.residentKicker }}</p>
          <h2>{{ pageCopy.residentTitle }}</h2>
          <p class="resident-text">{{ pageCopy.residentText }}</p>
          <dl class="resident-facts">
            <div v-for="fact in pageCopy.residentFacts" :key="fact.label">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
          <div class="hero-actions">
            <RouterLink class="lab-button" to="/lab/arw-studio">
              {{ pageCopy.residentPrimary }}
            </RouterLink>
            <a class="lab-button lab-button-light" href="#contact">
              {{ pageCopy.residentSecondary }}
            </a>
          </div>
        </div>

        <div class="resident-visual">
          <article class="resident-frame resident-frame-large">
            <img :src="collabLockup" alt="ARW Film x NewGbonhi" />
            <span>Room 001</span>
          </article>
          <article class="resident-frame">
            <img :src="arwLogo" alt="ARW Film mark" />
            <span>Identity</span>
          </article>
          <article class="resident-frame resident-frame-mark">
            <img :src="cupSticker" alt="ARW Film sticker" />
            <span>Visual world</span>
          </article>
        </div>
      </section>

      <section id="clients" class="client-directory" aria-labelledby="client-directory-title">
        <div class="directory-topline">
          <span>NEWGBONHI LAB</span>
          <a href="#arw-studio">{{ pageCopy.directoryClose }}</a>
        </div>

        <div class="directory-body">
          <div class="directory-lead">
            <div>
              <p class="eyebrow">{{ pageCopy.indexKicker }}</p>
              <h2 id="client-directory-title">{{ pageCopy.indexTitle }}</h2>
            </div>
            <RouterLink class="directory-total" to="/lab/arw-studio">
              {{ pageCopy.liveListingLabel }}
              <span aria-hidden="true">></span>
            </RouterLink>
          </div>

          <div class="directory-block">
            <p class="directory-label">{{ pageCopy.liveClientsLabel }}</p>
            <div class="client-listing">
              <RouterLink
                v-for="client in clients"
                :key="client.name"
                class="client-row"
                :to="client.to"
              >
                <span>{{ client.kicker }}</span>
                <strong>{{ client.name }}</strong>
                <em>{{ client.meta }}</em>
                <b>{{ client.status }}</b>
              </RouterLink>
            </div>
          </div>

          <div class="directory-columns">
            <section>
              <h3>{{ pageCopy.clientCategoriesTitle }}</h3>
              <ul>
                <li v-for="item in pageCopy.clientCategories" :key="item">
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>

            <section>
              <h3>{{ pageCopy.clientCollectionsTitle }}</h3>
              <ul>
                <li v-for="item in pageCopy.clientCollections" :key="item">
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>

            <section>
              <h3>{{ pageCopy.featuredClientsTitle }}</h3>
              <ul>
                <li v-for="item in pageCopy.featuredClients" :key="item">
                  <span>{{ item }}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script>
import CartPanel from "./components/CartPanel.vue";
import { cartStore } from "./data/cart.ts";
import { i18nState } from "./i18n.js";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;
const arwLogo = new URL("./assets/ARW FILM.png", import.meta.url).href;
const collabLockup = new URL("./assets/ARW FILM X NEW GBONHI.jpeg", import.meta.url).href;
const cityWhiteTee = new URL(
  "./assets/ARW FILM CITY TEE WHITE FRONT CUTOUT.png",
  import.meta.url
).href;
const cupSticker = new URL("./assets/ARW FILM CUP STICKER.png", import.meta.url).href;

const pageCopies = {
  en: {
    heroKicker: "Collective platform",
    heroTitle: "NewGbonhi Lab",
    heroSub:
      "A digital showroom for the NewGbonhi collective: a place to reference, present, and promote clothing, graphics, music, skate projects, design work, and independent creative drops.",
    primaryCta: "Browse clients",
    secondaryCta: "Open ARW Studio",
    systemKicker: "Platform logic",
    systemTitle: "The Lab is built like a digital concept store",
    systemItems: [
      {
        number: "01",
        title: "Reference",
        text: "Each client gets a focused room with identity, discipline, current project, and direct room access.",
      },
      {
        number: "02",
        title: "Present",
        text: "Drops are shown with the visual language behind them, not just a product thumbnail.",
      },
      {
        number: "03",
        title: "Connect",
        text: "Visitors can discover the talent and move directly toward orders, contact, or collaboration.",
      },
    ],
    residentKicker: "Resident 001",
    residentTitle: "ARW Studio",
    residentText:
      "ARW Studio opens the Lab through the Drop 03 collaboration. The room keeps the capsule, graphic identity, and film energy together so the project feels like a complete universe.",
    residentFacts: [
      { label: "Discipline", value: "Graphic direction / film identity" },
      { label: "Current project", value: "Drop 03 ARW Film collab" },
      { label: "Location", value: "Abidjan" },
    ],
    residentPrimary: "Open ARW room",
    residentSecondary: "Contact",
    arwMeta: "Graphic direction / film identity / Drop 03",
    liveLabel: "Live",
    directoryClose: "Resident focus",
    liveListingLabel: "1 live client",
    liveClientsLabel: "Live clients",
    indexKicker: "Client index",
    indexTitle: "Clients referenced in the Lab",
    clientCategoriesTitle: "Categories",
    clientCollectionsTitle: "Collections",
    featuredClientsTitle: "Featured clients",
    clientCategories: [
      "Clothing labels",
      "Graphic studios",
      "Beatmakers",
      "Skaters",
      "Design artists",
      "Photographers",
    ],
    clientCollections: [
      "Just opened",
      "New rooms",
      "Collab drops",
      "Studio profiles",
      "Local picks",
      "Archive projects",
    ],
    featuredClients: [
      "ARW Studio",
      "NewGbonhi Collective",
      "Graphic artists",
      "Beatmakers",
      "Skaters",
      "Designers",
    ],
  },
  fr: {
    heroKicker: "Plateforme collective",
    heroTitle: "NewGbonhi Lab",
    heroSub:
      "Une vitrine digitale pour le collectif NewGbonhi : un espace pour referencer, presenter et promouvoir vetements, graphisme, musique, skate, design et projets creatifs independants.",
    primaryCta: "Voir les clients",
    secondaryCta: "Ouvrir ARW Studio",
    systemKicker: "Logique plateforme",
    systemTitle: "Le Lab fonctionne comme un concept-store digital",
    systemItems: [
      {
        number: "01",
        title: "Referencer",
        text: "Chaque client a une room claire avec identite, discipline, projet en cours et acces direct a son univers.",
      },
      {
        number: "02",
        title: "Presenter",
        text: "Les drops gardent leur univers visuel complet, pas seulement une miniature produit.",
      },
      {
        number: "03",
        title: "Connecter",
        text: "Les visiteurs peuvent decouvrir le talent puis aller vers une commande, un contact ou une collaboration.",
      },
    ],
    residentKicker: "Resident 001",
    residentTitle: "ARW Studio",
    residentText:
      "ARW Studio ouvre le Lab avec la collaboration Drop 03. La room rassemble la capsule, l'identite graphique et l'energie film pour presenter le projet comme un vrai univers.",
    residentFacts: [
      { label: "Discipline", value: "Direction graphique / identite film" },
      { label: "Projet actuel", value: "Drop 03 ARW Film collab" },
      { label: "Base", value: "Abidjan" },
    ],
    residentPrimary: "Ouvrir la room ARW",
    residentSecondary: "Contact",
    arwMeta: "Direction graphique / identite film / Drop 03",
    liveLabel: "Live",
    directoryClose: "Focus resident",
    liveListingLabel: "1 client live",
    liveClientsLabel: "Clients live",
    indexKicker: "Index clients",
    indexTitle: "Clients references dans le Lab",
    clientCategoriesTitle: "Categories",
    clientCollectionsTitle: "Collections",
    featuredClientsTitle: "Clients en avant",
    clientCategories: [
      "Marques vetement",
      "Studios graphiques",
      "Beatmakers",
      "Skaters",
      "Design artists",
      "Photographes",
    ],
    clientCollections: [
      "Just opened",
      "Nouvelles rooms",
      "Collab drops",
      "Profils studio",
      "Local picks",
      "Archives projets",
    ],
    featuredClients: [
      "ARW Studio",
      "NewGbonhi Collective",
      "Graphistes",
      "Beatmakers",
      "Skaters",
      "Designers",
    ],
  },
};

export default {
  name: "LabPage",
  components: {
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      arwLogo,
      collabLockup,
      cityWhiteTee,
      cupSticker,
      cartOpen: false,
    };
  },
  computed: {
    pageCopy() {
      return pageCopies[i18nState.language] || pageCopies.en;
    },
    cartCount() {
      return cartStore.cartCount.value;
    },
    clients() {
      return [
        {
          name: "ARW Studio",
          kicker: this.pageCopy.residentKicker,
          meta: this.pageCopy.arwMeta,
          status: this.pageCopy.liveLabel,
          to: "/lab/arw-studio",
        },
      ];
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

.lab-page {
  --text: #0b0b0b;
  --muted: #646464;
  --accent: #e10600;
  --line: #0b0b0b;

  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  position: relative;
  z-index: 0;
}

.lab-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.045),
      rgba(0, 0, 0, 0.045) 1px,
      transparent 1px,
      transparent 48px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.045),
      rgba(0, 0, 0, 0.045) 1px,
      transparent 1px,
      transparent 48px
    );
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  animation: rise 0.55s ease both;
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

main {
  display: grid;
  gap: 26px;
  margin-top: 32px;
}

.lab-hero,
.lab-system,
.resident-section,
.client-directory {
  animation: rise 0.65s ease both;
}

.lab-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 18px;
  min-height: 560px;
}

.hero-copy,
.hero-showcase,
.lab-system,
.resident-section {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
}

.hero-copy {
  padding: clamp(26px, 5vw, 52px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.28em;
  font-size: 10px;
  font-weight: 800;
}

.hero-copy h1 {
  margin: 14px 0 16px;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: clamp(46px, 7vw, 88px);
  line-height: 0.9;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.hero-sub,
.resident-text {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.7;
}

.hero-actions {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.lab-button {
  border: 1px solid var(--line);
  background: #0b0b0b;
  color: #fff;
  padding: 12px 18px;
  min-height: 44px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lab-button-light {
  background: #fff;
  color: #0b0b0b;
}

.hero-showcase {
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background:
    linear-gradient(135deg, rgba(225, 6, 0, 0.12), transparent 32%),
    #0b0b0b;
  color: #fff;
}

.showcase-meta,
.showcase-footer {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
}

.showcase-meta {
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.showcase-meta strong {
  color: #fff;
}

.showcase-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.16);
}

.showcase-stage {
  min-height: 430px;
  position: relative;
  overflow: hidden;
}

.showcase-stage::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.08) 1px,
      transparent 1px,
      transparent 46px
    );
}

.showcase-lockup {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 2;
  width: min(300px, 54%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 12px;
  background: #fff;
}

.showcase-shirt {
  position: absolute;
  right: 4%;
  bottom: -8%;
  z-index: 2;
  width: min(460px, 72%);
  filter: drop-shadow(0 26px 32px rgba(0, 0, 0, 0.42));
}

.showcase-mark {
  position: absolute;
  left: 7%;
  bottom: 11%;
  z-index: 3;
  width: min(160px, 28%);
  filter: drop-shadow(0 18px 20px rgba(0, 0, 0, 0.3));
}

.showcase-cup {
  position: absolute;
  right: 8%;
  top: 12%;
  z-index: 4;
  width: min(88px, 16%);
  transform: rotate(8deg);
  filter: drop-shadow(0 18px 20px rgba(0, 0, 0, 0.28));
}

.lab-system {
  padding: 24px;
}

.section-heading {
  display: grid;
  gap: 9px;
}

.section-heading h2 {
  margin: 0;
  max-width: 760px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: clamp(22px, 3vw, 34px);
  line-height: 1.05;
}

.system-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid rgba(0, 0, 0, 0.16);
}

.system-grid article {
  min-height: 190px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
}

.system-grid article + article {
  border-left: 1px solid rgba(0, 0, 0, 0.16);
}

.system-grid span {
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.system-grid h3 {
  margin: auto 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 13px;
}

.system-grid p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}

.resident-section {
  padding: 24px;
  display: grid;
  grid-template-columns: minmax(280px, 0.82fr) minmax(0, 1.18fr);
  gap: 24px;
  align-items: stretch;
}

.resident-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.resident-copy h2 {
  margin: 12px 0 14px;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: clamp(38px, 5vw, 62px);
  line-height: 0.95;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.resident-facts {
  margin: 22px 0 0;
  display: grid;
  border-top: 1px solid rgba(0, 0, 0, 0.16);
}

.resident-facts div {
  display: grid;
  grid-template-columns: 0.7fr 1fr;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.16);
}

.resident-facts dt,
.resident-facts dd {
  margin: 0;
}

.resident-facts dt {
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  font-weight: 700;
}

.resident-facts dd {
  font-size: 13px;
  font-weight: 700;
}

.resident-visual {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  grid-template-rows: 1fr 0.82fr;
  gap: 14px;
  min-height: 540px;
}

.resident-frame {
  position: relative;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  background: #f7f7f7;
  display: grid;
  place-items: center;
}

.resident-frame-large {
  grid-row: 1 / span 2;
  background:
    linear-gradient(90deg, rgba(225, 6, 0, 0.06), transparent 30%),
    #fff;
}

.resident-frame-mark {
  background: #0b0b0b;
}

.resident-frame img {
  width: 90%;
  height: 90%;
  object-fit: contain;
  filter: drop-shadow(0 18px 18px rgba(0, 0, 0, 0.18));
}

.resident-frame-large img {
  width: 106%;
  height: 106%;
}

.resident-frame-mark img {
  width: 72%;
  height: 72%;
}

.resident-frame span {
  position: absolute;
  left: 14px;
  bottom: 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  padding: 7px 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10px;
  font-weight: 800;
}

.client-directory {
  border: 1px solid #0b0b0b;
  border-radius: 18px;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 0%, rgba(225, 6, 0, 0.18), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.04), transparent 34%),
    #050505;
  color: #fff;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}

.directory-topline {
  min-height: 58px;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.directory-topline span,
.directory-topline a {
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 11px;
  font-weight: 800;
}

.directory-topline a {
  color: rgba(255, 255, 255, 0.62);
}

.directory-body {
  padding: clamp(20px, 4vw, 34px);
  display: grid;
  gap: 30px;
}

.directory-lead {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: end;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.directory-lead .eyebrow {
  color: rgba(255, 255, 255, 0.54);
}

.directory-lead h2 {
  margin: 10px 0 0;
  max-width: 760px;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: clamp(28px, 5vw, 56px);
  line-height: 0.95;
}

.directory-total {
  color: #fff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.directory-total span {
  font-size: 18px;
}

.directory-block,
.directory-columns section {
  display: grid;
  gap: 18px;
}

.directory-label,
.directory-columns h3 {
  margin: 0;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 12px;
  font-weight: 700;
}

.client-listing {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.client-row {
  min-height: 132px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  padding: 18px;
  color: #fff;
  text-decoration: none;
  background:
    linear-gradient(135deg, rgba(225, 6, 0, 0.18), transparent 40%),
    rgba(255, 255, 255, 0.035);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 14px;
  align-content: space-between;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

.client-row:hover,
.client-row:focus-visible {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.42);
  background:
    linear-gradient(135deg, rgba(225, 6, 0, 0.25), transparent 42%),
    rgba(255, 255, 255, 0.07);
}

.client-row span,
.client-row b {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  font-weight: 800;
}

.client-row span {
  color: rgba(255, 255, 255, 0.54);
}

.client-row strong {
  grid-column: 1 / -1;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: clamp(22px, 3vw, 34px);
}

.client-row em {
  grid-column: 1 / -1;
  color: rgba(255, 255, 255, 0.68);
  font-style: normal;
  font-size: 13px;
}

.client-row b {
  color: #fff;
  justify-self: end;
}

.directory-columns {
  padding-top: 8px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(24px, 5vw, 58px);
}

.directory-columns ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 34px;
}

.directory-columns li {
  min-width: 0;
}

.directory-columns span {
  display: inline-flex;
  color: #fff;
  font-size: 17px;
  line-height: 1.25;
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
  .lab-hero,
  .resident-section {
    grid-template-columns: 1fr;
  }

  .lab-hero {
    min-height: 0;
  }

  .system-grid {
    grid-template-columns: 1fr;
  }

  .system-grid article + article {
    border-left: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.16);
  }

  .resident-visual {
    min-height: 480px;
  }

  .directory-lead,
  .directory-columns {
    grid-template-columns: 1fr;
  }

  .directory-total {
    justify-self: start;
  }
}

@media (max-width: 700px) {
  .lab-page {
    padding: 24px 16px 40px;
  }

  .shop-header {
    align-items: flex-start;
  }

  .shop-cta {
    width: 100%;
  }

  main {
    gap: 18px;
    margin-top: 24px;
  }

  .hero-copy,
  .lab-system,
  .resident-section {
    padding: 18px;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .lab-button {
    width: 100%;
  }

  .showcase-stage {
    min-height: 420px;
  }

  .showcase-meta,
  .showcase-footer {
    padding: 14px;
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .showcase-lockup {
    top: 16px;
    left: 16px;
    width: 64%;
  }

  .showcase-shirt {
    right: -10%;
    bottom: -3%;
    width: 92%;
  }

  .showcase-mark {
    left: 16px;
    bottom: 20px;
    width: 34%;
  }

  .showcase-cup {
    right: 18px;
    top: 92px;
    width: 18%;
  }

  .resident-facts div,
  .resident-visual {
    grid-template-columns: 1fr;
  }

  .resident-visual {
    grid-template-rows: 320px 260px 210px;
    min-height: 0;
  }

  .resident-frame-large {
    grid-row: auto;
  }

  .resident-frame-large img {
    width: 118%;
    height: 118%;
  }

  .directory-topline {
    min-height: 54px;
    padding: 0 16px;
  }

  .directory-topline span,
  .directory-topline a {
    font-size: 10px;
    letter-spacing: 0.16em;
  }

  .directory-body {
    padding: 18px;
    gap: 24px;
  }

  .client-row {
    min-height: 124px;
  }

  .directory-columns ul {
    grid-template-columns: 1fr 1fr;
    gap: 16px 20px;
  }

  .directory-columns span {
    font-size: 15px;
  }
}
</style>
