<template>
  <aside v-if="privacy.open" class="cookie-notice" aria-labelledby="cookie-title">
    <h2 id="cookie-title">Vos préférences de confidentialité</h2>
    <p>Le panier, la langue et la connexion utilisent le stockage nécessaire au fonctionnement du site.
      <template v-if="analyticsConfigured">Avec votre accord, Plausible mesure la fréquentation des pages publiques, sans transmettre vos formulaires.</template>
      <template v-else>Aucun outil de mesure d’audience n’est actif actuellement.</template>
      <RouterLink to="/confidentialite">En savoir plus</RouterLink>.
    </p>
    <div class="cookie-actions">
      <button type="button" @click="saveConsent(false)">Refuser les statistiques</button>
      <button v-if="analyticsConfigured" type="button" @click="saveConsent(true)">Accepter les statistiques</button>
      <button v-else type="button" @click="saveConsent(false)">Continuer sans statistiques</button>
    </div>
    <p class="cookie-help">Vous pouvez modifier votre choix via « Gérer les cookies » en bas de page.</p>
  </aside>
</template>
<script setup>
import { privacy, saveConsent } from "../utils/privacy.js";
import { analyticsConfigured } from "../utils/analytics.js";
</script>
<style scoped>
.cookie-notice { position: fixed; z-index: 2000; bottom: 16px; right: 16px; width: min(540px, calc(100vw - 32px)); max-height: 80dvh; overflow: auto; box-sizing: border-box; padding: 22px; border: 2px solid #111; background: #fff; color: #171717; box-shadow: 0 8px 40px #0003; font: 15px/1.55 "Space Grotesk", sans-serif; }
h2 { margin: 0; font-size: 20px; } p { margin: 12px 0; } a { color: #941b16; text-decoration: underline; }
.cookie-actions { display: flex; flex-wrap: wrap; gap: 10px; }
button { flex: 1; min-height: 44px; padding: 10px 14px; background: #fff; color: #111; border: 1px solid #111; font: inherit; font-weight: 700; cursor: pointer; }
button:hover { background: #eee; } .cookie-help { font-size: 12px; margin-bottom: 0; }
</style>
