<template>
  <div class="arw-page">
    <div class="arw-topline">Drop 03 // ARW Film x NewGbonhi // Abidjan</div>

    <header class="arw-header">
      <nav class="arw-nav" aria-label="ARW navigation">
        <RouterLink to="/">Boutique</RouterLink>
        <a href="#collection">Collection</a>
        <RouterLink to="/lookbook">Lookbook</RouterLink>
      </nav>

      <RouterLink class="arw-brand" to="/lab/arw-studio" aria-label="ARW Studio">
        <img :src="chromeLogo" alt="ARW Film" />
      </RouterLink>

      <div class="arw-actions">
        <RouterLink to="/lab">Lab</RouterLink>
        <button type="button" @click="toggleCart">Cart ({{ cartCount }})</button>
      </div>
    </header>

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <main>
      <section class="arw-hero">
        <div class="hero-copy">
          <img class="hero-logo" :src="chromeLogo" alt="ARW Film" />
          <p class="eyebrow">Resident 001 // NewGbonhi Lab</p>
          <h1>L'heritage.<br />Le style.<br />L'attitude.</h1>
          <p>
            ARW Film entre dans l'univers NewGbonhi avec une capsule noire,
            chrome et graphique. Une room digitale pensee comme une vitrine
            premium pour la collaboration.
          </p>
          <div class="hero-buttons">
            <a class="chrome-button" href="#collection">Decouvrir la collection</a>
            <RouterLink class="chrome-button ghost" to="/lookbook">Voir le lookbook</RouterLink>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <img class="denim-shirt" :src="cityBlackBack" alt="" />
          <img class="coin-mark" :src="chromeLogo" alt="" />
          <div class="hero-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      <section class="quick-links" aria-label="ARW capsule categories">
        <a v-for="item in quickLinks" :key="item.label" :href="item.href">
          <span>{{ item.icon }}</span>
          <strong>{{ item.label }}</strong>
        </a>
      </section>

      <section id="collection" class="collection-section">
        <div class="section-head">
          <div>
            <p>Nouveaute</p>
            <h2>Nouvelle collection</h2>
          </div>
          <RouterLink to="/">Voir toute la boutique</RouterLink>
        </div>

        <div class="arw-products" role="list">
          <article
            v-for="product in arwProducts"
            :key="product.slug"
            class="arw-product-card"
            role="listitem"
          >
            <RouterLink
              class="product-image"
              :class="`product-image-${product.slug}`"
              :to="product.url"
            >
              <img
                :class="`product-visual product-visual-${product.slug}`"
                :src="product.imagePrimary"
                :alt="product.title"
              />
            </RouterLink>
            <div class="product-info">
              <RouterLink :to="product.url">{{ product.title }}</RouterLink>
              <p>{{ formatPrice(product.price) }}</p>
            </div>
            <button
              type="button"
              :disabled="product.soldOut"
              @click="addToCart(product)"
            >
              {{ product.soldOut ? "Out of stock" : "Ajouter au panier" }}
            </button>
          </article>
        </div>
      </section>

      <section class="service-strip" aria-label="ARW service highlights">
        <article v-for="service in services" :key="service.title">
          <span>{{ service.icon }}</span>
          <div>
            <h3>{{ service.title }}</h3>
            <p>{{ service.text }}</p>
          </div>
        </article>
      </section>
    </main>

    <footer class="arw-footer">
      <div>
        <img :src="chromeLogo" alt="ARW Film" />
        <p>
          ARW Studio presente sa room digitale dans le NewGbonhi Lab: capsule,
          graphisme, film energy et produits references.
        </p>
      </div>
      <nav aria-label="ARW footer">
        <RouterLink to="/">Boutique</RouterLink>
        <RouterLink to="/lab">NewGbonhi Lab</RouterLink>
        <RouterLink to="/lookbook">Lookbook</RouterLink>
        <a href="#contact">Contact</a>
      </nav>
    </footer>
  </div>
</template>

<script>
import CartPanel from "./components/CartPanel.vue";
import { cartStore } from "./data/cart.ts";
import { products } from "./data/products.ts";

const chromeLogo = new URL("./assets/ARW FILM CHROME LOGO CUTOUT.png", import.meta.url).href;
const cityBlackBack = new URL(
  "./assets/ARW FILM CITY TEE BLACK BACK CUTOUT.png",
  import.meta.url
).href;

export default {
  name: "ArwStudioPage",
  components: {
    CartPanel,
  },
  data() {
    return {
      chromeLogo,
      cityBlackBack,
      cartOpen: false,
      products,
      quickLinks: [
        { label: "Capsule", href: "#collection", icon: "03" },
        { label: "City tees", href: "#collection", icon: "CT" },
        { label: "Chrome", href: "#collection", icon: "AR" },
        { label: "Editorial", href: "/lookbook", icon: "LB" },
      ],
      services: [
        { title: "Livraison rapide", text: "Abidjan et commandes locales", icon: "01" },
        { title: "Paiement securise", text: "Validation avant expedition", icon: "02" },
        { title: "Retours faciles", text: "Support commande direct", icon: "03" },
        { title: "Produit officiel", text: "Capsule NewGbonhi x ARW", icon: "04" },
      ],
    };
  },
  computed: {
    cartCount() {
      return cartStore.cartCount.value;
    },
    arwProducts() {
      const slugs = [
        "arw-film-city-tee-white",
        "arw-film-city-tee-black",
        "arw-film-logo-tee",
        "arw-film-dopamine-tee",
      ];
      return slugs
        .map((slug) => this.products.find((product) => product.slug === slug))
        .filter(Boolean);
    },
  },
  methods: {
    toggleCart() {
      this.cartOpen = !this.cartOpen;
    },
    addToCart(product) {
      if (!product || product.soldOut) {
        return;
      }
      cartStore.addToCart(product);
      this.cartOpen = true;
    },
    formatPrice(value) {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return "";
      }
      const formatted = new Intl.NumberFormat("fr-CI", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(value);
      return `${formatted} FCFA`;
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
  background: #070707;
  color: #f5f5f5;
}

.arw-page {
  --chrome: #d7d7d7;
  --soft: rgba(255, 255, 255, 0.68);
  --line: rgba(255, 255, 255, 0.22);
  --red: #e10600;

  min-height: 100vh;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 22px 42px;
  position: relative;
  isolation: isolate;
}

.arw-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.045), transparent 28%),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.035),
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px,
      transparent 52px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.025),
      rgba(255, 255, 255, 0.025) 1px,
      transparent 1px,
      transparent 52px
    ),
    #070707;
}

.arw-page::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.42;
  background:
    radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.12), transparent 24%),
    repeating-radial-gradient(
      circle at 24% 12%,
      rgba(255, 255, 255, 0.045) 0,
      rgba(255, 255, 255, 0.045) 1px,
      transparent 1px,
      transparent 4px
    );
  mix-blend-mode: screen;
}

.arw-topline {
  min-height: 38px;
  display: grid;
  place-items: center;
  border-bottom: 1px solid var(--line);
  color: var(--soft);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
}

.arw-header {
  min-height: 92px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid var(--line);
}

.arw-nav,
.arw-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.arw-actions {
  justify-content: flex-end;
}

.arw-nav a,
.arw-actions a,
.arw-actions button {
  color: var(--soft);
  background: transparent;
  border: 0;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font: 700 11px/1 "Space Grotesk", Arial, sans-serif;
  cursor: pointer;
}

.arw-brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.arw-brand img {
  width: clamp(150px, 20vw, 230px);
  height: 62px;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.22));
}

main {
  display: grid;
  gap: 28px;
  padding-top: 24px;
}

.arw-hero {
  min-height: 640px;
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 0 0 28px 28px;
  background:
    linear-gradient(90deg, rgba(6, 6, 6, 0.98), rgba(10, 10, 10, 0.74)),
    #090909;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 30px 70px rgba(0, 0, 0, 0.4);
}

.hero-copy {
  padding: clamp(28px, 6vw, 66px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.hero-logo {
  width: min(470px, 92%);
  max-height: 170px;
  object-fit: contain;
  object-position: left center;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 22px rgba(255, 255, 255, 0.2));
}

.eyebrow {
  margin: 0 0 14px;
  color: var(--soft);
  text-transform: uppercase;
  letter-spacing: 0.24em;
  font-size: 10px;
  font-weight: 800;
}

.hero-copy h1 {
  margin: 0;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: clamp(34px, 5vw, 72px);
  line-height: 1.02;
  color: #f5f5f5;
  text-shadow:
    0 1px 0 #fff,
    0 7px 20px rgba(255, 255, 255, 0.16),
    0 18px 34px rgba(0, 0, 0, 0.9);
}

.hero-copy p:not(.eyebrow) {
  max-width: 500px;
  margin: 22px 0 0;
  color: var(--soft);
  font-size: 15px;
  line-height: 1.7;
}

.hero-buttons {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.chrome-button,
.arw-product-card button {
  min-height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 12px;
  padding: 13px 18px;
  color: #f7f7f7;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04)),
    #111;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.36),
    inset 0 -12px 18px rgba(0, 0, 0, 0.52),
    0 10px 24px rgba(0, 0, 0, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10px;
  font-weight: 800;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chrome-button.ghost {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    #080808;
}

.hero-visual {
  min-height: 100%;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(115deg, transparent 0 38%, rgba(255, 255, 255, 0.05) 38% 39%, transparent 39%),
    radial-gradient(circle at 64% 48%, rgba(255, 255, 255, 0.08), transparent 28%),
    repeating-linear-gradient(
      118deg,
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px,
      transparent 9px
    ),
    #080808;
}

.hero-visual::before,
.hero-visual::after {
  content: "";
  position: absolute;
  pointer-events: none;
}

.hero-visual::before {
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.96), transparent 18%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 32%),
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.035),
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px,
      transparent 7px
    );
  mix-blend-mode: screen;
}

.hero-visual::after {
  right: 16%;
  top: 20%;
  width: 230px;
  height: 230px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  box-shadow:
    inset 0 0 24px rgba(255, 255, 255, 0.16),
    0 0 40px rgba(255, 255, 255, 0.08);
}

.denim-shirt {
  position: absolute;
  right: -12%;
  bottom: -19%;
  width: min(720px, 92%);
  height: auto;
  opacity: 0.74;
  filter: grayscale(1) contrast(1.18) brightness(0.66)
    drop-shadow(0 30px 45px rgba(0, 0, 0, 0.7));
  transform: rotate(-4deg);
}

.coin-mark {
  position: absolute;
  right: 13%;
  top: 35%;
  width: min(190px, 24%);
  filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.2));
}

.hero-dots {
  position: absolute;
  right: 22px;
  top: 50%;
  display: grid;
  gap: 10px;
}

.hero-dots span {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
}

.hero-dots span:first-child {
  background: #fff;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.quick-links a,
.service-strip,
.arw-product-card,
.arw-footer {
  border: 1px solid var(--line);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.025)),
    rgba(8, 8, 8, 0.92);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    inset 0 -18px 36px rgba(0, 0, 0, 0.48);
}

.quick-links a {
  min-height: 78px;
  border-radius: 14px;
  padding: 14px 18px;
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.quick-links span {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--soft);
  font-weight: 800;
}

.quick-links strong {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 12px;
}

.collection-section {
  padding-top: 10px;
}

.section-head {
  margin-bottom: 16px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
}

.section-head p {
  margin: 0 0 4px;
  color: var(--soft);
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 10px;
}

.section-head h2 {
  margin: 0;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: clamp(24px, 4vw, 42px);
  text-shadow: 0 10px 28px rgba(255, 255, 255, 0.16);
}

.section-head a {
  color: var(--soft);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  font-weight: 800;
}

.arw-products {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}

.arw-product-card {
  border-radius: 14px;
  overflow: hidden;
  padding: 10px;
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(96px, auto) auto;
  align-content: start;
}

.product-image {
  aspect-ratio: 3 / 4;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  background:
    radial-gradient(circle at 50% 44%, rgba(255, 255, 255, 0.11), transparent 35%),
    #050505;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  display: block;
  filter: drop-shadow(0 22px 24px rgba(0, 0, 0, 0.55));
  transition: transform 0.35s ease;
}

.product-visual-arw-film-city-tee-white,
.product-visual-arw-film-city-tee-black {
  transform: scale(1.1);
}

.product-visual-arw-film-logo-tee,
.product-visual-arw-film-dopamine-tee {
  transform: translateY(-7%) scale(1.24);
}

.arw-product-card:hover .product-image img {
  transform: scale(1.05);
}

.arw-product-card:hover .product-visual-arw-film-city-tee-white,
.arw-product-card:hover .product-visual-arw-film-city-tee-black {
  transform: scale(1.16);
}

.arw-product-card:hover .product-visual-arw-film-logo-tee,
.arw-product-card:hover .product-visual-arw-film-dopamine-tee {
  transform: translateY(-7%) scale(1.3);
}

.product-info {
  min-height: 96px;
  padding: 16px 4px 12px;
  text-align: center;
  display: grid;
  align-content: center;
}

.product-info a {
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  font-weight: 800;
}

.product-info p {
  margin: 8px 0 0;
  color: var(--soft);
  font-size: 13px;
  font-weight: 700;
}

.arw-product-card button {
  width: 100%;
  min-height: 38px;
  border-radius: 9px;
  cursor: pointer;
}

.arw-product-card button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.service-strip {
  border-radius: 16px;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
}

.service-strip article {
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.service-strip span {
  color: #fff;
  font-weight: 900;
}

.service-strip h3 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
}

.service-strip p {
  margin: 4px 0 0;
  color: var(--soft);
  font-size: 11px;
}

.arw-footer {
  margin-top: 28px;
  border-radius: 16px;
  padding: 22px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
}

.arw-footer img {
  width: 150px;
  height: 52px;
  object-fit: contain;
  object-position: left center;
}

.arw-footer p {
  max-width: 420px;
  margin: 10px 0 0;
  color: var(--soft);
  font-size: 12px;
  line-height: 1.6;
}

.arw-footer nav {
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 12px 28px;
  align-content: center;
}

.arw-footer a {
  color: var(--soft);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10px;
  font-weight: 800;
}

@media (max-width: 980px) {
  .arw-header {
    grid-template-columns: 1fr;
    justify-items: center;
    padding: 16px 0;
  }

  .arw-nav,
  .arw-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .arw-hero {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .hero-visual {
    min-height: 420px;
  }

  .quick-links,
  .arw-products,
  .service-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}

@media (max-width: 640px) {
  .arw-page {
    padding: 0 12px 32px;
  }

  .arw-topline {
    padding: 0 12px;
    text-align: center;
    line-height: 1.5;
  }

  .arw-nav,
  .arw-actions {
    gap: 14px;
  }

  .hero-copy {
    padding: 24px 18px;
  }

  .hero-logo {
    width: 100%;
    margin-bottom: 16px;
  }

  .hero-copy h1 {
    font-size: clamp(32px, 12vw, 48px);
  }

  .hero-buttons,
  .section-head,
  .arw-footer {
    display: grid;
    grid-template-columns: 1fr;
  }

  .chrome-button {
    width: 100%;
  }

  .hero-visual {
    min-height: 360px;
  }

  .denim-shirt {
    right: -35%;
    bottom: -20%;
    width: 130%;
  }

  .coin-mark {
    right: 12%;
    top: 34%;
    width: 34%;
  }

  .quick-links,
  .arw-products,
  .service-strip {
    grid-template-columns: 1fr;
  }

  .arw-footer nav {
    grid-template-columns: 1fr;
  }
}
</style>
