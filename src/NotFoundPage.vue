<template>
  <div class="not-found-page">
    <SiteHeader @toggle-cart="cartOpen = !cartOpen" />
    <CartPanel :open="cartOpen" @close="cartOpen = false" />
    <main><p class="code">404</p><h1>Cette page est introuvable.</h1><p>Le lien a peut-être changé. Retrouvez les collections et les derniers drops dans la boutique.</p><RouterLink class="return-link" to="/">Retour à la boutique</RouterLink></main>
    <SiteFooter />
  </div>
</template>
<script setup>
import { ref } from "vue";
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";
import CartPanel from "./components/CartPanel.vue";
const cartOpen = ref(false);
</script>
<style scoped>
.not-found-page { color: #171717; background: #faf9f6; min-height: 100vh; } main { max-width: 700px; padding: 70px 24px; margin: auto; } .code { font-size: clamp(72px, 20vw, 150px); font-weight: 900; margin: 0; } h1 { font-size: clamp(26px, 5vw, 40px); } p { line-height: 1.7; } .return-link { display: inline-block; background: #111; color: #fff; padding: 16px 22px; margin-top: 20px; }
</style>
