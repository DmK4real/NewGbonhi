<template>
  <div v-if="!connected || linkError" class="mobile-status" role="status" aria-live="polite">
    <span>{{ !connected ? labels.offline : labels.linkError }}</span>
    <button v-if="linkError && connected" type="button" @click="linkError = false">{{ labels.close }}</button>
  </div>
  <nav class="mobile-tabs" :aria-label="labels.navigation">
    <RouterLink to="/" :aria-current="route.name === 'shop' ? 'page' : undefined">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3Z M9 20v-7h6v7" /></svg>
      <span>{{ labels.shop }}</span>
    </RouterLink>
    <RouterLink to="/collections" :aria-current="['collections', 'product'].includes(route.name) ? 'page' : undefined">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" /></svg>
      <span>{{ labels.collections }}</span>
    </RouterLink>
    <RouterLink to="/faces" :aria-current="route.name === 'faces' ? 'page' : undefined">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H3v4 M17 3h4v4 M21 17v4h-4 M7 21H3v-4 M8 9h.01 M16 9h.01 M8 14q4 5 8 0" /></svg>
      <span>Faces</span>
    </RouterLink>
    <button type="button" :aria-label="`${labels.cart} (${cartCount})`" @click="cartOpen = true">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l2 14H3Z M8 7V6a4 4 0 0 1 8 0v1" /></svg>
      <span>{{ labels.cart }}</span><b v-if="cartCount" class="mobile-cart-count">{{ cartCount > 99 ? '99+' : cartCount }}</b>
    </button>
  </nav>
  <CartPanel :open="cartOpen" @close="cartOpen = false" />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import CartPanel from "./CartPanel.vue";
import { cartStore } from "../data/cart.ts";
import { i18nState } from "../i18n.js";
import { isNativePlatform } from "../mobile/platform.js";

const route = useRoute();
const cartOpen = ref(false);
const connected = ref(typeof navigator === "undefined" || navigator.onLine !== false);
const linkError = ref(false);
const cartCount = cartStore.cartCount;
const labels = computed(() => i18nState.language === "en" ? {
  shop: "Shop", collections: "Collections", cart: "Bag", navigation: "App navigation", close: "Close",
  offline: "You're offline. Your bag is saved. Reconnect to order.",
  linkError: "This link could not be opened. Please try again.",
} : {
  shop: "Boutique", collections: "Collections", cart: "Panier", navigation: "Navigation de l’application", close: "Fermer",
  offline: "Vous êtes hors connexion. Votre panier est conservé. Reconnectez-vous pour commander.",
  linkError: "Ce lien n’a pas pu être ouvert. Réessayez.",
});
watch(() => route.fullPath, () => { cartOpen.value = false; });
const updateConnection = () => { connected.value = navigator.onLine; };
const reportLinkError = () => { linkError.value = true; };
let networkListener;
let disposed = false;
onMounted(async () => {
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
  window.addEventListener("newgbonhi:link-error", reportLinkError);
  if (isNativePlatform()) {
    try {
      const { Network } = await import("@capacitor/network");
      networkListener = await Network.addListener("networkStatusChange", status => { connected.value = status.connected; });
      if (disposed) { await networkListener.remove(); return; }
      connected.value = (await Network.getStatus()).connected;
    } catch (error) { console.error("Network status unavailable", error); }
  }
});
onUnmounted(() => {
  disposed = true;
  window.removeEventListener("online", updateConnection);
  window.removeEventListener("offline", updateConnection);
  window.removeEventListener("newgbonhi:link-error", reportLinkError);
  void networkListener?.remove();
});
</script>
