<template>
  <div class="legal-page">
    <SiteHeader @toggle-cart="cartOpen = !cartOpen" />
    <CartPanel :open="cartOpen" @close="cartOpen = false" />
    <main class="legal-content">
      <p>NEWGBONHI / INFORMATIONS</p>
      <h1>{{ isPrivacy ? 'Confidentialité et données personnelles' : 'Conditions générales d’utilisation' }}</h1>
      <p>Dernière mise à jour : 19 septembre 2026.</p>
      <p>NewGbonhi est géré par Dominik Kouakou, Wadja Bright et Yohann Munier.</p>
      <template v-if="isPrivacy">
        <h2>Qui contacter ?</h2>
        <p>Pour toute question sur vos données ou pour exercer vos droits, contactez l’équipe NewGbonhi à <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>.</p>
        <h2>Quelles données et pourquoi ?</h2>
        <ul>
          <li>Commandes : nom, prénom, email, téléphone, adresse, articles et état du paiement, pour préparer votre commande, organiser sa livraison et assurer son suivi. Ce traitement sert à exécuter votre commande.</li>
          <li>Candidatures au Lab : identité ou nom du projet, coordonnées, discipline, ville, portfolio, présentation et acceptation du pacte, pour examiner votre candidature et vous répondre.</li>
          <li>Newsletter : votre email, uniquement si vous demandez à recevoir les nouvelles des drops. Vous pouvez retirer votre accord en nous écrivant ou via le lien de désinscription lorsqu’il figure dans le message.</li>
          <li>Sécurité : informations techniques de connexion pour limiter les abus et protéger les services, sur la base de l’intérêt légitime à sécuriser le site.</li>
        </ul>
        <p>Les champs marqués obligatoires sont nécessaires au service demandé. Les formulaires ne demandent pas vos codes de paiement ni vos numéros de carte : le paiement se déroule auprès du prestataire choisi.</p>
        <h2>Destinataires et services externes</h2>
        <p>Les données nécessaires sont accessibles à l’équipe NewGbonhi et aux prestataires intervenant dans le service : Cloudflare pour l’hébergement, Resend pour les emails lorsqu’il est configuré, le prestataire de paiement sélectionné et le livreur pour la livraison. WhatsApp et les réseaux sociaux appliquent leurs propres politiques lorsque vous ouvrez leurs liens. Les polices Google Fonts sont chargées depuis Google, qui reçoit alors les informations techniques de connexion.</p>
        <h2>Stockage sur votre appareil et statistiques</h2>
        <p>Le panier et la préférence de langue sont conservés dans votre navigateur jusqu’à leur suppression. La session d’administration utilise le stockage de session. Votre préférence de confidentialité est conservée six mois ; elle peut être modifiée à tout moment.</p>
        <p>Si l’outil Plausible est configuré et que vous l’acceptez, seules les visites des pages publiques sont mesurées. Les formulaires, les paramètres d’URL et les pages de commande ou d’administration sont exclus. Aucun outil de publicité n’est installé par cette fonctionnalité.</p>
        <button type="button" @click="openPrivacy">Gérer les cookies</button>
        <h2>Conservation et exercice des droits</h2>
        <p>Les données de commande servent au traitement et au suivi de la relation commerciale, puis aux obligations de conservation applicables. Les candidatures servent à leur examen et aux échanges avec le collectif. Vous pouvez demander des informations sur les durées appliquées et solliciter la suppression des données qui ne sont plus nécessaires en contactant l’équipe.</p>
        <p>Selon la réglementation applicable, vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de vos données et vous opposer à certains traitements. Le retrait d’un consentement n’affecte pas les traitements antérieurs à ce retrait. Vous pouvez également saisir l’autorité compétente en matière de protection des données, notamment l’ARTCI en Côte d’Ivoire ou la CNIL lorsque le RGPD s’applique.</p>
      </template>
      <template v-else>
        <h2>Objet et accès au site</h2>
        <p>NewGbonhi présente ses collections, ses projets et son collectif. Vous pouvez consulter le catalogue, préparer une commande et contacter l’équipe. Certaines fonctionnalités nécessitent une connexion Internet, un navigateur récent ou un accès réservé.</p>
        <h2>Utilisation des services</h2>
        <p>Renseignez des informations exactes dans les formulaires. N’utilisez pas le site pour envoyer du spam, usurper une identité, tenter un accès non autorisé ou perturber les services.</p>
        <h2>Créations et propriété intellectuelle</h2>
        <p>Les marques, visuels, photographies et créations présentés appartiennent à leurs titulaires respectifs. Pour une réutilisation dépassant les usages autorisés par la loi, contactez l’équipe afin d’obtenir l’autorisation correspondante.</p>
        <h2>Commandes et paiements</h2>
        <p>Les prix sont affichés en FCFA. Le récapitulatif précise les articles et les frais de livraison. La production des précommandes débute après validation du paiement ; la fenêtre de livraison annoncée est de 48 à 72 heures après confirmation, sous réserve des informations communiquées pour votre commande. Les frais de livraison sont réglés au livreur selon les indications du parcours de commande.</p>
        <p>Pour une annulation, un retour, une réclamation ou un problème de paiement, contactez <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a> en précisant la référence de commande. Les présentes conditions d’utilisation ne remplacent pas les conditions de vente ni les droits impératifs du consommateur.</p>
        <h2>Disponibilité et liens externes</h2>
        <p>Des interruptions de maintenance ou des erreurs peuvent survenir. Signalez un problème à l’équipe. Les sites de paiement, réseaux sociaux et autres services externes sont régis par leurs propres conditions.</p>
        <h2>Données personnelles</h2>
        <p>Consultez la <RouterLink to="/confidentialite">politique de confidentialité</RouterLink> pour connaître les traitements liés au site et les moyens d’exercer vos droits.</p>
        <h2>Contact</h2>
        <p>Équipe NewGbonhi — Abidjan, Côte d’Ivoire.<br><a :href="'mailto:' + contactEmail">{{ contactEmail }}</a></p>
      </template>
    </main>
    <SiteFooter />
  </div>
</template>
<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";
import CartPanel from "./components/CartPanel.vue";
import { checkoutConfig } from "./utils/config.js";
import { openPrivacy } from "./utils/privacy.js";
const route = useRoute();
const isPrivacy = computed(() => route.name === "privacy");
const cartOpen = ref(false);
const contactEmail = checkoutConfig.contactEmail;
</script>
<style scoped>
.legal-page { background: #faf9f6; color: #171717; min-height: 100vh; }
.legal-content { max-width: 820px; margin: auto; padding: 60px 24px; line-height: 1.8; overflow-wrap: anywhere; }
h1 { font-size: clamp(28px, 5vw, 48px); line-height: 1.15; } h2 { margin-top: 34px; font-size: 23px; }
a { color: #941b16; text-decoration: underline; } button { padding: 12px 18px; background: #111; color: white; border: 0; font: inherit; cursor: pointer; }
</style>
