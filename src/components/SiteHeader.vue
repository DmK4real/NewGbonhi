<template>
  <header class="shop-header site-header-shell" :class="{ 'menu-open': menuOpen }">
    <div class="site-header">
      <RouterLink class="site-brand" to="/" aria-label="NewGbonhi home" @click="closeMenu">
      <img :src="logoUrl" alt="NewGbonhi logo" decoding="async" />
      <div>
        <strong>NewGbonhi</strong>
        <span>{{ $t("brandTagline") }}</span>
      </div>
      </RouterLink>

      <button
      class="site-menu-toggle"
      type="button"
      :aria-expanded="menuOpen"
      aria-controls="site-primary-navigation"
      @click="menuOpen = !menuOpen"
    >
      <span class="site-menu-label">{{ menuOpen ? $t("close") : "Menu" }}</span>
      <small aria-hidden="true">01—05</small>
      <i aria-hidden="true"></i>
      </button>

      <nav id="site-primary-navigation" class="shop-nav site-navigation" aria-label="Primary">
      <div class="site-navigation-meta" aria-hidden="true">
        <span>NewGbonhi / Index</span>
        <span>Abidjan / 2026</span>
      </div>
      <RouterLink :class="{ 'is-active': $route.name === 'shop' }" to="/" @click="closeMenu">
        {{ $t("navShop") }}
      </RouterLink>
      <RouterLink :class="{ 'is-active': $route.name === 'collections' }" to="/collections" @click="closeMenu">{{ $t("navCollections") }}</RouterLink>
      <RouterLink :class="{ 'is-active': $route.name === 'lab' }" to="/lab" @click="closeMenu">
        {{ $t("navLab") }}
      </RouterLink>
      <RouterLink :class="{ 'is-active': $route.name === 'studio' }" to="/studio" @click="closeMenu">
        {{ $t("navStudio") }}
      </RouterLink>
      <RouterLink
        :class="{ 'is-active': $route.name === 'lookbook' }"
        to="/lookbook"
        @click="closeMenu"
      >
        {{ $t("navLookbook") }}
      </RouterLink>
      </nav>

      <div class="site-tools">
      <LanguageSwitch class="site-language" />
      <RouterLink class="site-tool" to="/orders" @click="closeMenu">{{ $t("navOrders") }}</RouterLink>
      <button class="site-cart" type="button" @click="openCart">
        {{ $t("cart") }} <span>{{ cartCount }}</span>
      </button>
      </div>

      <div class="site-mobile-campaign" aria-hidden="true">
      <img :src="campaignImage" alt="" loading="lazy" decoding="async" />
      <div>
        <span>DROP 04 / ABIDJAN</span>
        <strong>CAMÉLÉON CAMO × NEWGBONHI</strong>
      </div>
      </div>
    </div>
  </header>
</template>

<script>
import LanguageSwitch from "./LanguageSwitch.vue";
import { cartStore } from "../data/cart.ts";

const logoUrl = new URL("../assets/newgbonhi-logo.png", import.meta.url).href;
const campaignImage = new URL(
  "../assets/editorial/cameleon-worn-01.jpg",
  import.meta.url
).href;

export default {
  name: "SiteHeader",
  components: {
    LanguageSwitch,
  },
  emits: ["toggle-cart"],
  data() {
    return {
      logoUrl,
      campaignImage,
      menuOpen: false,
    };
  },
  computed: {
    cartCount() {
      return cartStore.cartCount.value;
    },
  },
  watch: {
    $route() {
      this.closeMenu();
    },
    menuOpen(open) {
      document.documentElement.classList.toggle("navigation-open", open);
    },
  },
  mounted() {
    window.addEventListener("keydown", this.onKeydown);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeydown);
    document.documentElement.classList.remove("navigation-open");
  },
  methods: {
    closeMenu() {
      this.menuOpen = false;
    },
    onKeydown(event) {
      if (event.key === "Escape" && this.menuOpen) this.closeMenu();
    },
    openCart() {
      this.closeMenu();
      this.$emit("toggle-cart");
    },
  },
};
</script>

<style scoped>
:global(html.navigation-open) { overflow: hidden; }
.site-header-shell {
  display: block !important;
}

.site-header {
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(300px, 1fr) auto;
  align-items: center;
  gap: clamp(18px, 3vw, 42px);
}

.site-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.site-brand img {
  width: 54px;
  height: 54px;
  object-fit: contain;
}

.site-brand div {
  display: grid;
  gap: 2px;
}

.site-brand strong {
  font-family: "Archivo Black", "Space Grotesk", sans-serif;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.site-brand span {
  color: #606060;
  text-transform: uppercase;
  letter-spacing: .16em;
  font-size: 9px;
}

.site-navigation {
  display: flex;
  justify-content: center;
  gap: clamp(12px, 1.5vw, 22px);
  overflow: visible;
}

.site-navigation a {
  color: inherit;
  padding: 6px 0;
  border-bottom: 2px solid transparent;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: .14em;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.site-navigation a.is-active {
  border-color: #e10600;
}

.site-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.site-tool {
  border: 0;
  background: transparent;
  color: inherit;
  padding: 8px 3px;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: .12em;
  font: 700 9px/1 "Space Grotesk", sans-serif;
  cursor: pointer;
}

.site-cart {
  border: 1px solid currentColor;
  background: #fff;
  color: #0b0b0b;
  padding: 8px 11px;
  text-transform: uppercase;
  letter-spacing: .12em;
  font: 700 9px/1 "Space Grotesk", sans-serif;
  cursor: pointer;
}

.site-cart span {
  display: inline-grid;
  width: 20px;
  height: 20px;
  margin-left: 4px;
  place-items: center;
  border-radius: 50%;
  background: #0b0b0b;
  color: #fff;
}

.site-menu-toggle,
.site-mobile-campaign,
.site-navigation-meta {
  display: none;
}

@media (min-width: 761px) and (max-width: 1100px) {
  .site-header {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 14px;
  }

  .site-brand div {
    display: none;
  }

  .site-navigation {
    gap: clamp(8px, 1.2vw, 16px);
  }

  .site-navigation a {
    font-size: 9px;
    letter-spacing: .1em;
  }

  .site-tools {
    gap: 5px;
  }

  .site-tool {
    font-size: 8px;
    letter-spacing: .08em;
  }
}

@media (max-width: 760px) {
  .site-header {
    grid-template-columns: auto 1fr auto;
  }

  .site-brand div,
  .site-language,
  .site-tools .site-tool {
    display: none;
  }

  .site-menu-toggle {
    grid-column: 3;
    display: grid;
    grid-template-columns: auto auto 22px;
    min-width: 142px;
    min-height: 46px;
    align-items: center;
    gap: 14px;
    border: 1px solid #0b0b0b;
    background: #0b0b0b;
    color: #f6f3ea;
    padding: 0 14px;
    text-transform: uppercase;
    letter-spacing: .14em;
    font: 700 10px/1 "Space Grotesk", sans-serif;
    cursor: pointer;
    transition: background .25s ease, color .25s ease, border-color .25s ease;
  }

  .site-menu-toggle small {
    color: #e10600;
    font: 700 8px/1 "Space Grotesk", sans-serif;
    letter-spacing: .08em;
  }

  .site-menu-toggle i,
  .site-menu-toggle i::before,
  .site-menu-toggle i::after {
    display: block;
    width: 20px;
    height: 1px;
    background: currentColor;
    content: "";
    transition: transform .35s cubic-bezier(.2,.8,.2,1), opacity .2s ease;
  }

  .site-menu-toggle i::before { transform: translateY(-5px); }
  .site-menu-toggle i::after { transform: translateY(4px); }
  .menu-open .site-menu-toggle {
    border-color: rgba(246,243,234,.35);
    background: #f6f3ea;
    color: #0b0b0b;
  }
  .menu-open .site-menu-toggle i { transform: rotate(45deg); }
  .menu-open .site-menu-toggle i::before { transform: translateY(0) rotate(90deg); }
  .menu-open .site-menu-toggle i::after { opacity: 0; transform: translateY(0); }

  .site-header .site-navigation {
    display: none;
  }

  .site-tools {
    grid-column: 2;
    grid-row: 1;
    margin-left: auto;
  }

  .site-header-shell.menu-open .site-header {
    height: 100dvh;
    overflow-y: auto;
    align-content: start;
    background: #0b0b0b;
    color: #f6f3ea;
    animation: menu-reveal .48s cubic-bezier(.22,1,.36,1) both;
  }

  .menu-open .site-navigation {
    grid-column: 1 / -1;
    grid-row: 2;
    display: grid;
    width: 100%;
    padding: clamp(28px, 8vh, 72px) 0 24px;
    gap: 0;
    counter-reset: nav-item;
  }

  .menu-open .site-navigation-meta {
    display: flex;
    justify-content: space-between;
    padding-bottom: 14px;
    color: rgba(246,243,234,.5);
    border-bottom: 1px solid rgba(255,255,255,.18);
    font: 700 8px/1 "Space Grotesk", sans-serif;
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .menu-open .site-navigation a {
    display: grid;
    grid-template-columns: clamp(38px, 6vw, 64px) 1fr;
    align-items: baseline;
    padding: 13px 0;
    border: 0;
    border-bottom: 1px solid rgba(255,255,255,.18);
    font-family: "Archivo Black", "Space Grotesk", sans-serif;
    font-size: clamp(28px, 8vw, 54px);
    line-height: .95;
    letter-spacing: .02em;
    counter-increment: nav-item;
    transition: color .25s ease, padding-left .3s cubic-bezier(.2,.8,.2,1);
    animation: menu-item-in .52s cubic-bezier(.22,1,.36,1) both;
  }

  .menu-open .site-navigation a::before {
    content: "0" counter(nav-item);
    color: #e10600;
    font: 700 9px/1 "Space Grotesk", sans-serif;
    letter-spacing: .12em;
  }

  .menu-open .site-navigation a::after {
    content: "↗";
    color: rgba(246,243,234,.36);
    font: 400 16px/1 sans-serif;
  }

  .menu-open .site-navigation a:nth-of-type(2) { animation-delay: .035s; }

  .menu-open .site-navigation a::after { display: none; }

  .menu-open .site-navigation a:nth-of-type(3) { animation-delay: .07s; }
  .menu-open .site-navigation a:nth-of-type(4) { animation-delay: .105s; }
  .menu-open .site-navigation a:nth-of-type(5) { animation-delay: .14s; }

  .menu-open .site-navigation a:hover,
  .menu-open .site-navigation a:focus-visible {
    color: #e10600;
    padding-left: 10px;
  }

  .menu-open .site-tools {
    grid-column: 1 / -1;
    grid-row: 3;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .menu-open .site-language,
  .menu-open .site-tools .site-tool {
    display: flex;
  }

  .menu-open .site-cart {
    grid-column: 1 / -1;
    border-color: #f6f3ea;
    background: #f6f3ea;
  }

  .menu-open .site-mobile-campaign {
    grid-column: 1 / -1;
    grid-row: 4;
    min-height: 180px;
    margin-top: 22px;
    display: grid;
    grid-template-columns: minmax(120px, .7fr) 1fr;
    align-items: end;
    border: 1px solid rgba(255,255,255,.24);
    overflow: hidden;
    background: #151515;
  }

  .site-mobile-campaign img {
    width: 100%;
    height: 190px;
    object-fit: cover;
    filter: saturate(.85) contrast(1.04);
  }

  .site-mobile-campaign div {
    padding: 18px;
    display: grid;
    gap: 8px;
  }

  .site-mobile-campaign span {
    color: #e10600;
    font: 700 9px/1 monospace;
    letter-spacing: .14em;
  }

  .site-mobile-campaign strong {
    font-family: "Archivo Black", "Space Grotesk", sans-serif;
    font-size: clamp(20px, 5vw, 32px);
    line-height: .95;
  }
}

@keyframes menu-reveal {
  from { opacity: 0; clip-path: inset(0 0 100% 0); }
  to { opacity: 1; clip-path: inset(0); }
}

@keyframes menu-item-in {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 560px) {
  .site-brand img {
    width: 46px;
    height: 46px;
  }

  .site-tools {
    margin-left: 0;
  }

  .site-menu-toggle {
    min-width: 112px;
    grid-template-columns: auto 20px;
  }

  .site-menu-toggle small { display: none; }

  .site-header-shell:not(.menu-open) .site-cart {
    padding: 8px;
    font-size: 0;
  }

  .site-header-shell:not(.menu-open) .site-cart::before {
    content: "BAG";
    font-size: 9px;
  }

  .site-header-shell:not(.menu-open) .site-cart span {
    font-size: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-header-shell.menu-open .site-header,
  .menu-open .site-navigation a { animation: none; }
}
</style>
