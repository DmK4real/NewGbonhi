<template>
  <div class="faces-page">
    <SiteHeader @toggle-cart="cartOpen = !cartOpen" />
    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <main>
      <section class="faces-hero" aria-labelledby="faces-title">
        <div class="faces-topline">
          <span>{{ copy.kicker }}</span>
          <time :datetime="dropAt">19.12.2026 · 18:00 ABIDJAN</time>
        </div>

        <div class="faces-hero-grid">
          <div class="faces-intro">
            <p class="faces-eyebrow">{{ copy.newCollection }}</p>
            <h1 id="faces-title">FACES<span>.</span></h1>
            <p class="faces-hook">{{ copy.hook }}</p>
            <a class="faces-puzzle-link" href="#faces-puzzle">{{ copy.explore }}</a>
            <dl v-if="!countdown.finished" class="faces-countdown" role="timer" aria-live="off" :aria-label="copy.countdown">
              <div v-for="unit in timerUnits" :key="unit.key">
                <dt>{{ unit.label }}</dt>
                <dd>{{ String(countdown[unit.key]).padStart(2, '0') }}</dd>
              </div>
            </dl>
            <p class="faces-intro-text">{{ copy.intro }}</p>
            <a class="faces-button" href="#faces-newsletter">{{ copy.join }}</a>
            <p class="faces-existing">{{ copy.existing }}</p>
          </div>

          <FacesPuzzle />
        </div>

        <div v-if="countdown.finished" class="faces-drop-status" role="status">
          <strong>{{ isCollectionOpen ? copy.available : copy.rendezvous }}</strong>
          <a v-if="isCollectionOpen" class="faces-button" href="#faces-collection">{{ copy.shop }}</a>
          <p v-else>{{ copy.waiting }}</p>
        </div>
      </section>

      <section class="faces-story" aria-labelledby="faces-story-title">
        <p class="faces-eyebrow">{{ copy.storyKicker }}</p>
        <h2 id="faces-story-title">{{ copy.storyTitle }}</h2>
        <div class="faces-story-bottom">
          <p>{{ copy.storyText }}</p>
          <div class="faces-utilities">
            <a :href="`${assetBase}drop-faces.ics`" download="FACES-19-decembre.ics">{{ copy.calendar }}</a>
            <button type="button" @click="shareFaces">{{ copy.share }}</button>
          </div>
        </div>
        <p v-if="shareMessage" class="faces-share-feedback" role="status">{{ shareMessage }}</p>
      </section>

      <section v-if="isCollectionOpen" id="faces-collection" class="faces-collection" aria-labelledby="faces-collection-title">
        <p class="faces-eyebrow">NEWGBONHI / FACES</p>
        <h2 id="faces-collection-title">{{ copy.shop }}</h2>
        <ProductGrid :products="facesProducts" currency="XOF" locale="fr-CI" @add-to-cart="addToCart" />
      </section>

      <section id="faces-newsletter" class="faces-newsletter" aria-labelledby="faces-newsletter-title">
        <div class="faces-newsletter-copy">
          <p class="faces-eyebrow">{{ copy.newsKicker }}</p>
          <h2 id="faces-newsletter-title">{{ copy.newsTitle }}</h2>
          <p>{{ copy.newsText }}</p>
          <span class="faces-news-date">19 DÉCEMBRE 2026 · 18:00 GMT</span>
        </div>
        <form class="faces-form" :aria-busy="loading" @submit.prevent="joinNewsletter">
          <label for="faces-email">{{ copy.email }}</label>
          <input id="faces-email" v-model.trim="email" type="email" name="email" autocomplete="email" inputmode="email" maxlength="160" placeholder="toi@email.com" :readonly="loading" required />
          <div class="faces-honeypot" aria-hidden="true" inert>
            <label for="faces-website">Website</label>
            <input id="faces-website" v-model="website" name="website" type="text" tabindex="-1" autocomplete="off" />
          </div>
          <p class="faces-consent">{{ copy.consent }} <RouterLink to="/confidentialite">{{ copy.privacy }}</RouterLink></p>
          <button class="faces-button" type="submit" :disabled="loading">{{ loading ? copy.sending : copy.join }}</button>
          <p v-if="message" class="faces-form-feedback" :class="{ 'is-error': failed }" :role="failed ? 'alert' : 'status'">{{ message }}</p>
          <p class="faces-form-existing">{{ copy.existing }}</p>
        </form>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script setup>
import { shareContent } from "./mobile/actions.js";
import { computed, onMounted, onUnmounted, ref } from "vue";
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";
import CartPanel from "./components/CartPanel.vue";
import ProductGrid from "./components/ProductGrid.vue";
import FacesPuzzle from "./components/FacesPuzzle.vue";
import { i18nState } from "./i18n.js";
import { products } from "./data/products.ts";
import { cartStore } from "./data/cart.ts";
import { FACES_DROP_AT, getFacesCountdown } from "./data/facesDrop.js";
import { subscribeToNewsletter } from "./utils/newsletter.js";

const content = {
  fr: {
    kicker: "LE PROCHAIN DROP NEWGBONHI", newCollection: "NOUVELLE COLLECTION",
    hook: "Trois visages. Une nouvelle pièce chaque jour.",
    explore: "Découvrir les fragments et le défi",
    intro: "27 fragments, dévoilés dans le désordre. Trois visages se précisent jusqu’au défi du 17 décembre. Entre dans le Gbonhi pour suivre Faces avant le drop.",
    join: "Je veux voir Faces", existing: "Déjà dans le Gbonhi ? Tu recevras aussi les nouvelles, sans te réinscrire.",
    artAlt: "Un visage en noir et blanc fragmenté en une mosaïque, entre regards, lèvres et blocs rouges Faces.",
    caption: "TOUT NE SE DÉVOILE PAS D'UN COUP.", countdown: "Le rendez-vous approche.",
    days: "Jours", hours: "Heures", minutes: "Min.", seconds: "Sec.",
    storyKicker: "LE VISAGE SE PRÉCISE", storyTitle: "Un regard. Un détail. Une présence.",
    storyText: "Du 20 novembre au 16 décembre, un nouveau morceau apparaît chaque jour à 18 h, en alternant les trois visages. Le 17 décembre, reconstitue les trois visages : une première validation, un T-shirt FACES. Reveal le 18 décembre à 18 h. Drop le 19 décembre à 18 h, heure d’Abidjan.",
    calendar: "Ajouter à mon agenda", share: "Partager le rendez-vous", copied: "Le lien de Faces est copié.",
    shareError: "Retrouve Faces sur newgbonhi.com/faces.", newsKicker: "LE GBONHI VOIT LA SUITE",
    newsTitle: "Tu n'as pas encore tout vu.", newsText: "Reçois les prochains aperçus de Faces et le lien dès l'ouverture du drop.",
    email: "Ton adresse email", consent: "En t'inscrivant, tu acceptes de recevoir les emails NewGbonhi. Tu peux te désinscrire dans chaque newsletter.",
    privacy: "Confidentialité", sending: "Inscription en cours…", success: "Tu es dans le Gbonhi. Rendez-vous le 19 décembre à 18 h, heure d'Abidjan.",
    already: "Tu es déjà dans le Gbonhi. Tu recevras les nouvelles de Faces.", error: "L'inscription n'a pas abouti. Réessaie dans un instant.",
    available: "Faces est disponible.", rendezvous: "Le rendez-vous est arrivé.",
    waiting: "Retrouve les dernières nouvelles de Faces dans le Gbonhi. Le lien arrive par email dès l'ouverture effective du drop.", shop: "Découvrir la collection",
  },
  en: {
    kicker: "THE NEXT NEWGBONHI DROP", newCollection: "NEW COLLECTION",
    hook: "Three faces. One new piece every day.",
    explore: "Explore the fragments and the challenge",
    intro: "27 fragments, revealed out of order. Three faces come into view before the December 17 challenge. Join the Gbonhi to follow Faces before the drop.",
    join: "I want to see Faces", existing: "Already in the Gbonhi? You'll get the updates too. No need to sign up again.",
    artAlt: "A black-and-white face fragmented into a mosaic of eyes, lips and red Faces blocks.",
    caption: "NOT EVERYTHING IS REVEALED AT ONCE.", countdown: "The date is getting closer.",
    days: "Days", hours: "Hours", minutes: "Min.", seconds: "Sec.",
    storyKicker: "THE PICTURE IS COMING TOGETHER", storyTitle: "A look. A detail. A presence.",
    storyText: "November 20 to December 16: one new piece every day at 6 pm, alternating the three faces. On December 17, rebuild all three faces: the first validated solution wins a FACES T-shirt. Reveal December 18 at 6 pm. Drop December 19 at 6 pm, Abidjan time (GMT).",
    calendar: "Add to my calendar", share: "Share the date", copied: "The Faces link has been copied.",
    shareError: "Find Faces at newgbonhi.com/faces.", newsKicker: "THE GBONHI SEES WHAT'S NEXT",
    newsTitle: "You haven't seen it all yet.", newsText: "Get the next glimpses of Faces and the link when the drop opens.",
    email: "Your email address", consent: "By signing up, you agree to receive NewGbonhi emails. You can unsubscribe in every newsletter.",
    privacy: "Privacy", sending: "Signing you up…", success: "You're in the Gbonhi. See you on December 19 at 6 pm, Abidjan time (GMT).",
    already: "You're already in the Gbonhi. You'll receive the Faces updates.", error: "We couldn't complete your signup. Please try again shortly.",
    available: "Faces is available.", rendezvous: "The date has arrived.",
    waiting: "Get the latest Faces news in the Gbonhi. We'll email the link once the drop is open.", shop: "Discover the collection",
  },
};

const copy = computed(() => content[i18nState.language] || content.fr);
const assetBase = `${import.meta.env.BASE_URL}faces/`;
const dropAt = FACES_DROP_AT;
const cartOpen = ref(false);
const now = ref(Date.now());
const countdown = computed(() => getFacesCountdown(now.value));
const timerUnits = computed(() => ["days", "hours", "minutes", "seconds"].map(key => ({ key, label: copy.value[key] })));
const facesProducts = computed(() => products.filter(product => product.tags?.includes("faces")));
const isCollectionOpen = computed(() => countdown.value.finished && facesProducts.value.length > 0);
let timer;
onMounted(() => { timer = setInterval(() => { now.value = Date.now(); }, 1000); });
onUnmounted(() => clearInterval(timer));

const email = ref("");
const website = ref("");
const loading = ref(false);
const failed = ref(false);
const message = ref("");
async function joinNewsletter() {
  if (loading.value) return;
  loading.value = true;
  failed.value = false;
  message.value = "";
  try {
    const result = await subscribeToNewsletter(email.value, website.value);
    message.value = result.welcomeSent === false ? copy.value.already : copy.value.success;
    email.value = "";
    website.value = "";
  } catch {
    failed.value = true;
    message.value = copy.value.error;
  } finally {
    loading.value = false;
  }
}

const shareMessage = ref("");
async function shareFaces() {
  const url = "https://newgbonhi.com/faces";
  shareMessage.value = "";
  try {
    const shared = await shareContent({ title: "FACES / NEWGBONHI", text: copy.value.hook, url });
    if (!shared) shareMessage.value = copy.value.copied;
  } catch (error) {
    if (error.name !== "AbortError") shareMessage.value = copy.value.shareError;
  }
}
function addToCart(product) {
  cartStore.addToCart({ ...product, preorder: true });
  cartOpen.value = true;
}
</script>

<style scoped>
.faces-page { max-width: 1440px; margin: 0 auto; padding: 32px 24px 0; color: var(--ng-ink); font-family: "Space Grotesk", Arial, sans-serif; }
.faces-page * { box-sizing: border-box; }
.faces-page main { margin-top: 30px; }
.faces-hero { color: #f5f5f1; background: #101010; padding: clamp(24px, 4vw, 56px); }
.faces-topline { display: flex; justify-content: space-between; gap: 16px; padding-bottom: 22px; border-bottom: 1px solid #494949; font-size: .875rem; font-weight: 600; letter-spacing: .06em; }
.faces-topline time { white-space: nowrap; color: #f86b62; }
.faces-hero-grid { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: clamp(28px, 5vw, 72px); padding: 54px 0; }
.faces-eyebrow { margin: 0 0 24px; font-size: .875rem; line-height: 1.4; letter-spacing: .1em; font-weight: 700; }
.faces-intro .faces-eyebrow { color: #f86b62; }
.faces-intro h1 { margin: 0 0 26px -.065em; font: 400 clamp(80px, 10.8vw, 156px)/.9 "Archivo Black", Arial, sans-serif; letter-spacing: -.08em; }
.faces-intro h1 span { color: #e10600; }
.faces-hook { max-width: 440px; margin: 0 0 20px; font-size: clamp(24px, 2.8vw, 38px); line-height: 1.1; letter-spacing: -.035em; font-weight: 600; }
.faces-puzzle-link { display: inline-block; color: #ffa499; font-size: 1rem; line-height: 1.5; text-underline-offset: 4px; }
.faces-intro-text { max-width: 390px; margin: 0 0 28px; font-size: 1rem; line-height: 1.65; color: #c1c1be; }
.faces-button { display: inline-flex; align-items: center; justify-content: center; min-height: 54px; padding: 16px 24px; border: 1px solid #e10600; color: #fff; background: #e10600; font: 700 1rem/1.3 "Space Grotesk", Arial, sans-serif; text-decoration: none; text-align: center; cursor: pointer; border-radius: 0; transition: background .18s; }
.faces-button:hover { background: #ba0500; border-color: #ba0500; }
.faces-button:disabled { opacity: .7; cursor: wait; }
.faces-page :where(a, button, input):focus-visible { outline: 3px solid #ff998e; outline-offset: 4px; }
.faces-existing { margin: 20px 0 0; max-width: 350px; color: #aaa; font-size: .875rem; line-height: 1.6; }
.faces-art { margin: 0; min-width: 0; }
.faces-mosaic { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.faces-tile { aspect-ratio: 1; min-width: 0; background: #252525; overflow: hidden; }
.faces-tile img { display: block; width: 100%; height: 100%; object-fit: cover; }
.faces-type-tile, .faces-date-tile, .faces-time-tile { display: flex; align-items: center; justify-content: center; flex-direction: column; background: #e10600; font-weight: 700; line-height: .94; letter-spacing: -.05em; }
.faces-type-tile { font-size: clamp(18px, 2.6vw, 37px); }
.faces-date-tile { font-size: clamp(38px, 5.7vw, 82px); }
.faces-time-tile { font-size: clamp(24px, 3vw, 43px); }
.faces-time-tile small { margin-top: 12px; font-size: .65rem; letter-spacing: 0; }
.faces-hidden-tile { display: grid; place-items: center; background: #1c1c1c; }
.faces-hidden-tile span { color: #454545; font: 400 clamp(40px, 7vw, 100px)/1 "Archivo Black", Arial, sans-serif; }
.faces-outline span { color: transparent; -webkit-text-stroke: 1px #555; }
.faces-art figcaption { display: flex; justify-content: space-between; gap: 10px; margin-top: 14px; font-size: .75rem; line-height: 1.4; color: #aaa; }
.faces-countdown { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; max-width: 430px; margin: 28px 0; padding: 20px 0; border-top: 1px solid #494949; border-bottom: 1px solid #494949; }
.faces-countdown > div { display: flex; flex-direction: column-reverse; padding-left: 14px; border-left: 1px solid #494949; }
.faces-countdown dt { color: #aaa; font-size: .875rem; }
.faces-countdown dd { margin: 0 0 5px; font-size: clamp(28px, 3.5vw, 48px); font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -.05em; line-height: 1.2; }
.faces-drop-status { padding-top: 24px; border-top: 1px solid #494949; }
.faces-drop-status strong { display: block; font-size: 1.5rem; margin-bottom: 18px; }
.faces-drop-status p { max-width: 620px; color: #c1c1be; line-height: 1.6; }
.faces-story { padding: clamp(48px, 7vw, 96px) clamp(8px, 4vw, 56px); }
.faces-story .faces-eyebrow { color: var(--ng-red); }
.faces-story h2 { max-width: 880px; margin: 0 0 34px; font-size: clamp(36px, 5.4vw, 76px); font-weight: 600; line-height: 1.05; letter-spacing: -.05em; }
.faces-story-bottom { display: flex; justify-content: space-between; align-items: flex-end; gap: 40px; }
.faces-story-bottom > p { max-width: 610px; margin: 0; font-size: 1.125rem; line-height: 1.7; color: var(--ng-muted); }
.faces-utilities { display: flex; flex-direction: column; align-items: flex-start; gap: 20px; flex-shrink: 0; }
.faces-utilities a, .faces-utilities button { padding: 0 0 4px; border: 0; border-bottom: 1px solid currentColor; background: none; color: inherit; font: 500 1rem/1.4 "Space Grotesk", Arial, sans-serif; text-decoration: none; cursor: pointer; }
.faces-share-feedback { margin: 24px 0 0; font-size: 1rem; }
.faces-newsletter { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 7vw, 100px); padding: clamp(28px, 5vw, 68px); background: #e10600; color: #fff; scroll-margin-top: 30px; }
.faces-newsletter h2 { margin: 0 0 24px; font-size: clamp(34px, 4vw, 58px); font-weight: 600; line-height: 1.04; letter-spacing: -.045em; }
.faces-newsletter-copy > p:not(.faces-eyebrow) { max-width: 410px; margin: 0 0 28px; font-size: 1.125rem; line-height: 1.6; }
.faces-news-date { font-size: .875rem; font-weight: 600; }
.faces-form { align-self: center; }
.faces-form > label { display: block; margin-bottom: 12px; font-size: 1rem; font-weight: 600; }
.faces-form > input { width: 100%; min-height: 60px; padding: 16px; border: 1px solid #fff; background: #fff; color: #101010; border-radius: 0; font: 400 1.125rem "Space Grotesk", Arial, sans-serif; }
.faces-form > input::placeholder { color: #666; }
.faces-form .faces-button { width: 100%; color: #fff; background: #101010; border-color: #101010; }
.faces-form .faces-button:hover { background: #303030; }
.faces-consent { margin: 14px 0 20px; font-size: .875rem; line-height: 1.6; }
.faces-consent a { color: inherit; text-underline-offset: 3px; }
.faces-form-feedback { padding: 16px; border: 1px solid #fff; font-size: 1rem; line-height: 1.5; }
.faces-form-feedback.is-error { background: #fff; color: #940400; }
.faces-form-existing { margin: 18px 0 0; font-size: .875rem; line-height: 1.6; }
.faces-honeypot { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.faces-collection { padding: 30px 0 64px; }
.faces-collection h2 { font-size: clamp(32px, 4vw, 54px); letter-spacing: -.04em; }
@media (min-width: 1100px) { .faces-page :deep(.site-header) { gap: 20px; } }
@media (max-width: 900px) {
  .faces-hero-grid { grid-template-columns: 1fr; gap: 38px; padding: 36px 0; }
  .faces-intro h1 { font-size: clamp(84px, 20vw, 170px); }
  .faces-intro { max-width: 620px; }
  .faces-art { width: min(100%, 550px); justify-self: center; }
  .faces-type-tile { font-size: clamp(22px, 5.5vw, 40px); }
  .faces-date-tile { font-size: clamp(42px, 11vw, 88px); }
  .faces-hidden-tile span { font-size: clamp(50px, 16vw, 105px); }
  .faces-time-tile { font-size: clamp(24px, 7vw, 46px); }
  .faces-countdown dd { font-size: clamp(32px, 7vw, 50px); }
  .faces-story-bottom { align-items: flex-start; flex-direction: column; gap: 28px; }
  .faces-utilities { flex-direction: row; flex-wrap: wrap; gap: 24px; }
  .faces-newsletter { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .faces-page { padding: 20px 14px 0; }
  .faces-page main { margin-top: 22px; }
  .faces-hero { padding: 22px 18px; }
  .faces-topline { flex-direction: column; font-size: .875rem; gap: 10px; }
  .faces-intro h1 { font-size: clamp(64px, 21vw, 124px); }
  .faces-hook { font-size: 28px; }
  .faces-art figcaption { flex-direction: column; }
  .faces-mosaic { gap: 6px; }
  .faces-time-tile small { font-size: .6rem; margin-top: 8px; }
  .faces-countdown { gap: 7px; }
  .faces-countdown > div { padding-left: 8px; }
  .faces-countdown dt { font-size: .875rem; }
  .faces-newsletter { padding: 28px 20px; }
  .faces-intro > .faces-button { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .faces-button { transition: none; } }
</style>
