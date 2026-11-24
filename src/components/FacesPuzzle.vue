<template>
  <div id="faces-puzzle" class="puzzle" :aria-busy="initialLoading">
    <div class="puzzle-heading"><span>{{ text.kicker }}</span><strong>{{ state ? `${state.revealedCount} / 27` : '— / 27' }}</strong></div>
    <p v-if="initialLoading" role="status">{{ text.loading }}</p>
    <template v-if="state">
      <p v-if="state.preview" class="puzzle-note">{{ previewCopy.status }}</p>
      <div class="puzzle-tabs" role="group" :aria-label="text.choose">
        <button v-for="portrait in state.portraits" :key="portrait.id" type="button" :aria-pressed="active === portrait.id" @click="choose(portrait.id)">
          {{ portraitLabel(portrait) }} <span>{{ portrait.tiles.filter(Boolean).length }}/9</span>
        </button>
      </div>
      <div class="puzzle-grid" :class="{ 'is-playing': playing, 'is-revealed': state.phase === 'revealed' }" :aria-label="`${text.portrait} ${portraitLabel(activePortrait)}`">
        <button v-for="(id, index) in boards[active]" :key="index" type="button" :disabled="!playing || !id" :class="{ 'is-selected': selected === index }" :aria-pressed="selected === index" :aria-label="tileLabel(index, id)" @click="pick(index)">
          <img v-if="id" :src="facesTileUrl(tileMap[id].src)" alt="" width="240" height="240" :draggable="false" referrerpolicy="no-referrer" />
          <span v-else aria-hidden="true">{{ ['F', 'A', 'C', 'E', 'S', '.', 'N', 'G', '.'][index] }}</span>
          <span v-if="selected === index" class="puzzle-selection" aria-hidden="true">✓</span>
        </button>
      </div>
      <div class="puzzle-caption"><span>{{ portraitLabel(activePortrait).toUpperCase() }} / NEWGBONHI</span><span>{{ text.fragmentCaption }}</span></div>
      <p class="puzzle-status" aria-live="polite">{{ phaseMessage }}</p>
      <p v-if="state.nextRevealAt" class="puzzle-next">{{ text.next }} <time :datetime="state.nextRevealAt">{{ formatDate(state.nextRevealAt) }}</time> · 18:00 ABIDJAN</p>

      <template v-if="playing">
        <p class="puzzle-help">{{ text.help }}</p>
        <button class="puzzle-action" type="button" :disabled="busy || (!state.preview && !accessToken)" @click="submit">{{ busy ? text.wait : text.validate }}</button>
        <button class="puzzle-reset" type="button" :disabled="busy" @click="reset">{{ text.reset }}</button>
      </template>

      <details v-if="!state.preview && state.phase !== 'revealed'" class="puzzle-entry" :open="playing">
        <summary class="puzzle-prize">{{ state.winnerClaimed ? text.prizeTaken : text.prize }}</summary>
        <p class="puzzle-dates">{{ text.dates }}</p>
        <p v-if="accessToken" class="puzzle-verified">{{ text.verified }} <button type="button" @click="changeEmail">{{ text.changeEmail }}</button></p>
        <form v-else-if="!challengeId" @submit.prevent="requestCode">
          <label for="puzzle-email">{{ text.emailLabel }}</label>
          <input id="puzzle-email" v-model.trim="email" type="email" autocomplete="email" inputmode="email" maxlength="160" required :readonly="busy" placeholder="toi@email.com" />
          <div class="puzzle-honeypot" aria-hidden="true" inert><label for="puzzle-website">Website</label><input id="puzzle-website" v-model="website" tabindex="-1" autocomplete="off" /></div>
          <label class="puzzle-agree"><input v-model="acceptRules" type="checkbox" required :disabled="busy" /><span>{{ text.accept }} <RouterLink :to="{ path: $route.path, query: $route.query, hash: '#faces-puzzle-rules' }" @click="openRules">{{ text.rulesLink }}</RouterLink>.</span></label>
          <button class="puzzle-action" type="submit" :disabled="busy">{{ busy ? text.wait : text.sendCode }}</button>
          <p class="puzzle-note">{{ text.noSubscription }}</p>
        </form>
        <form v-else @submit.prevent="verifyCode">
          <label for="puzzle-code">{{ text.codeLabel }}</label>
          <input id="puzzle-code" v-model.trim="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{8}" maxlength="8" required :readonly="busy" />
          <p class="puzzle-note">{{ text.codeSent }} {{ email }}. {{ text.codeExpiry }}</p>
          <button class="puzzle-action" type="submit" :disabled="busy">{{ busy ? text.wait : text.confirmCode }}</button>
          <button class="puzzle-reset" type="button" :disabled="busy" @click="challengeId = ''; code = ''">{{ text.anotherCode }}</button>
        </form>
      </details>
      <details v-if="!state.preview" id="faces-puzzle-rules" class="puzzle-rules">
        <summary>{{ text.rulesTitle }}</summary>
        <p>{{ text.rulesBody }}</p><p>{{ text.rulesContact }}</p>
        <p>{{ text.data }} <RouterLink to="/confidentialite">{{ text.privacy }}</RouterLink>.</p>
      </details>
    </template>
    <p v-if="winnerReceipt" class="puzzle-feedback" role="status">{{ text.won }} {{ winnerReceipt }}</p>
    <p v-if="feedback" class="puzzle-feedback" :class="{ 'is-error': failed }" :role="failed ? 'alert' : 'status'">{{ feedback }}</p>
    <button v-if="!state && !initialLoading" class="puzzle-action" type="button" @click="loadState">{{ text.retry }}</button>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { i18nState } from "../i18n.js";
import { FACES_CAMPAIGN } from "../data/facesCampaign.js";
import { facesRequest, facesTileUrl, restoreFacesBoards, swapFacesTiles } from "../utils/facesPuzzle.js";

const content = {
  fr: {
    kicker: "27 JOURS. 3 VISAGES.", loading: "Les fragments arrivent…", choose: "Choisir un visage", portrait: "Puzzle de", fragmentCaption: "CHAQUE JOUR, UN NOUVEAU FRAGMENT.",
    upcoming: "Premier fragment le 20 novembre à 18 h. Reviens chaque jour : un morceau de plus, un visage qui se précise.",
    fragments: "Les morceaux se dévoilent dans le désordre. Le 17 décembre, à toi de retrouver les trois visages.", ready: "Les 27 fragments sont là. Le défi ouvre le 17 décembre à 18 h.",
    game: "À toi de reconstituer les trois visages. Une première validation, un T-shirt à gagner.", gameTaken: "Le T-shirt a été remporté. Tu peux continuer à reconstituer les trois visages pour le plaisir.",
    revealed: "Les trois visages sont réunis. Faces arrive le 19 décembre à 18 h, heure d’Abidjan.", next: "Prochain fragment :", help: "Touche un morceau, puis un autre pour échanger leurs places. Passe d’un visage à l’autre avec les onglets. Valide les trois grilles ensemble.",
    validate: "Valider mes trois visages", reset: "Remélanger ce visage", wait: "Un instant…", prize: "Trois visages à retrouver. Un T-shirt FACES à gagner.", prizeTaken: "Le T-shirt a trouvé son gagnant. Le puzzle continue.",
    dates: "Défi du 17 décembre à 18 h au 18 décembre à 18 h. Heure d’Abidjan / GMT.", verified: "Ton adresse est vérifiée. Tu es prêt pour le défi.", changeEmail: "Changer d’adresse", emailLabel: "Ton email pour participer au défi", accept: "J’accepte", rulesLink: "les règles du défi", sendCode: "Recevoir mon code", noSubscription: "Ce code sert uniquement au défi. Pour les nouvelles de Faces, rejoins la newsletter plus bas.",
    codeLabel: "Le code à 8 chiffres reçu par email", codeSent: "Code envoyé à", codeExpiry: "Valable 10 minutes. Vérifie aussi tes spams.", confirmCode: "Vérifier mon adresse", anotherCode: "Demander un autre code", rulesTitle: "Les règles du défi FACES",
    rulesBody: "Jeu gratuit organisé par NewGbonhi. Du 17 décembre 2026 à 18 h au 18 décembre 2026 à 18 h, heure d’Abidjan (GMT). La première personne dont les trois grilles de neuf pièces sont correctes et validées par le serveur avec une adresse email vérifiée remporte un T-shirt FACES. Un seul lot pour tout le défi, une participation par personne ; plusieurs essais sont possibles dans la limite de dix validations par minute. L’ordre de réception et de validation par le serveur fait foi. Le 18 décembre à 18 h, les visages sont révélés et le défi prend fin, même si personne n’a trouvé. Aucun achat n’est nécessaire. L’inscription à la newsletter est facultative.",
    rulesContact: "Le gagnant recevra un message de NewGbonhi à son adresse vérifiée pour organiser la taille et la remise du T-shirt. Garde ta référence de victoire. Une question : newgbonhifamily@gmail.com.",
    data: "Ton email est utilisé pour vérifier ta participation et contacter le gagnant. Les données du défi seront supprimées au plus tard le 19 mars 2027, indépendamment d’un éventuel abonnement à la newsletter. Consulte notre", privacy: "politique de confidentialité", retry: "Réessayer", incomplete: "Il reste des morceaux à remettre en place. Vérifie les trois visages et réessaie.", complete: "Les trois visages sont corrects ! Le lot a déjà été remporté, merci d’avoir joué.", won: "Tu es la première personne à avoir validé les trois visages : le T-shirt FACES est pour toi ! NewGbonhi te contactera par email. Ta référence :",
    errors: { invalid_email: "Vérifie ton adresse email.", accept_rules: "Accepte les règles pour participer.", invalid_code: "Ce code est incorrect, expiré ou déjà utilisé. Vérifie-le ou demande un nouveau code.", rate_limited: "Trop de tentatives rapprochées. Patiente un moment avant de réessayer. Pour un nouveau code, attends au moins une minute.", verify_email: "Vérifie d’abord ton adresse email avec un nouveau code.", contest_not_open: "Le défi ouvre le 17 décembre à 18 h, heure d’Abidjan.", contest_closed: "Le défi est terminé. Les visages sont maintenant révélés.", unavailable: "Les fragments sont momentanément indisponibles. Réessaie dans un instant.", email_unavailable: "Le code n’a pas pu être envoyé. Patiente une minute puis réessaie." },
  },
  en: {
    kicker: "27 DAYS. 3 FACES.", loading: "Loading the fragments…", choose: "Choose a face", portrait: "Puzzle of", fragmentCaption: "A NEW FRAGMENT, EVERY DAY.", upcoming: "The first fragment arrives November 20 at 6 pm. Come back every day to see more of the picture.", fragments: "The pieces appear out of order. On December 17, put the three faces back together.", ready: "All 27 fragments are here. The challenge opens December 17 at 6 pm.", game: "Rebuild all three faces. The first validated solution wins a T-shirt.", gameTaken: "The T-shirt has been won. You can keep solving all three faces for fun.", revealed: "The three faces are together. Faces drops December 19 at 6 pm, Abidjan time.", next: "Next fragment:", help: "Tap a piece, then another to swap them. Switch faces using the tabs. Submit all three grids together.", validate: "Submit my three faces", reset: "Reset this face", wait: "One moment…", prize: "Three faces to rebuild. One FACES T-shirt to win.", prizeTaken: "The T-shirt has a winner. Keep enjoying the puzzle.", dates: "December 17 at 6 pm to December 18 at 6 pm. Abidjan time / GMT.", verified: "Your email is verified. You’re ready for the challenge.", changeEmail: "Change email", emailLabel: "Your email for the challenge", accept: "I accept", rulesLink: "the challenge rules", sendCode: "Send my code", noSubscription: "This code is only for the challenge. For Faces updates, join the newsletter below.", codeLabel: "The 8-digit code sent by email", codeSent: "Code sent to", codeExpiry: "Valid for 10 minutes. Check your spam folder too.", confirmCode: "Verify my email", anotherCode: "Request another code", rulesTitle: "FACES challenge rules", rulesBody: "A free game organised by NewGbonhi, December 17, 2026 at 6 pm to December 18, 2026 at 6 pm, Abidjan time (GMT). The first person whose three nine-piece grids are correct and validated by the server with a verified email wins one FACES T-shirt. One prize for the entire challenge, one entry per person; you may try again up to ten times per minute. Server receipt and validation order determines the winner. The faces are revealed and the challenge ends December 18 at 6 pm, even if nobody has solved it. No purchase required. Newsletter signup is optional.", rulesContact: "NewGbonhi will email the winner at their verified address to arrange the T-shirt size and handover. Keep your winning reference. Questions: newgbonhifamily@gmail.com.", data: "Your email is used to verify your participation and contact the winner. Challenge data will be deleted by March 19, 2027, independently of any newsletter subscription. Read our", privacy: "privacy policy", retry: "Try again", incomplete: "Some pieces are still out of place. Check all three faces and try again.", complete: "All three faces are correct! The prize has already been won. Thanks for playing.", won: "You were the first to validate all three faces: the FACES T-shirt is yours! NewGbonhi will contact you by email. Your reference:",
    errors: { invalid_email: "Check your email address.", accept_rules: "Accept the rules to enter.", invalid_code: "This code is incorrect, expired or already used. Check it or request a new one.", rate_limited: "Too many attempts. Wait before trying again. Allow at least one minute before requesting a new code.", verify_email: "Verify your email with a new code first.", contest_not_open: "The challenge opens December 17 at 6 pm, Abidjan time.", contest_closed: "The challenge is over. The faces are now revealed.", unavailable: "The fragments are temporarily unavailable. Please try again shortly.", email_unavailable: "We couldn’t send your code. Wait one minute and try again." },
  },
};
const text = computed(() => content[i18nState.language] || content.fr);
const state = ref(null), initialLoading = ref(true), active = ref('leila'), boards = ref({}), selected = ref(null);
const email = ref(''), website = ref(''), acceptRules = ref(false), challengeId = ref(''), code = ref(''), accessToken = ref('');
const busy = ref(false), feedback = ref(''), failed = ref(false);
const winnerReceipt = ref('');
const { previewKey } = defineProps({ previewKey: { type: String, default: '' } });
const emit = defineEmits(['test-date']);
const key = `${FACES_CAMPAIGN.id}.puzzle${previewKey ? '.preview' : ''}`;
const previewCopy = computed(() => i18nState.language === 'en' ? {
  status: 'Test mode · December 17 at 6 pm (Abidjan). Solve all three faces and submit a test entry.',
  game: 'Rebuild all three faces to test your solution.',
  complete: 'All three faces are correct. Test entry validated!',
  denied: 'This test link is invalid or has expired.',
} : {
  status: 'Mode test · 17 décembre à 18 h (Abidjan). Reconstitue les trois visages et valide ta participation test.',
  game: 'Reconstitue les trois visages pour tester ta solution.',
  complete: 'Les trois visages sont corrects. Participation test validée !',
  denied: 'Ce lien de test est invalide ou a expiré.',
});
let poll, abortRefresh = false;
const activePortrait = computed(() => state.value?.portraits.find(p => p.id === active.value));
const playing = computed(() => state.value?.phase === 'game');
const tileMap = computed(() => Object.fromEntries((state.value?.portraits || []).flatMap(p => p.tiles.filter(Boolean).map(t => [t.id, t]))));
const phaseMessage = computed(() => !state.value ? '' : state.value.preview ? previewCopy.value.game : state.value.phase === 'game' ? state.value.winnerClaimed ? text.value.gameTaken : text.value.game : state.value.phase === 'fragments' && state.value.revealedCount === 27 ? text.value.ready : text.value[state.value.phase]);

function stored(suffix) { try { return JSON.parse(localStorage.getItem(`${key}.${suffix}`)); } catch { return null; } }
function save(suffix, value) { try { localStorage.setItem(`${key}.${suffix}`, JSON.stringify(value)); } catch { /* Storage is optional. */ } }
function changeEmail() { accessToken.value = ''; save('access', null); challengeId.value = ''; code.value = ''; }
function choose(id) { active.value = id; selected.value = null; }
function portraitLabel(portrait) { return `${i18nState.language === 'en' ? 'Face' : 'Visage'} ${state.value.portraits.findIndex(item => item.id === portrait.id) + 1}`; }
function tileLabel(index, id) { return `${text.value.portrait} ${portraitLabel(activePortrait.value)}, ${i18nState.language === 'en' ? 'position' : 'case'} ${index + 1}${id ? '' : i18nState.language === 'en' ? ', unrevealed' : ', à dévoiler'}`; }
function formatDate(value) { return new Intl.DateTimeFormat(i18nState.language === 'en' ? 'en-GB' : 'fr-CI', { day:'numeric', month:'long', timeZone:'Africa/Abidjan' }).format(new Date(value)); }
function pick(index) {
  if (!playing.value || !boards.value[active.value][index]) return;
  if (selected.value === null) selected.value = index;
  else { boards.value[active.value] = swapFacesTiles(boards.value[active.value], selected.value, index); selected.value = null; save('boards', boards.value); }
}
function reset() { boards.value[active.value] = activePortrait.value.tiles.map(t=>t.id); selected.value = null; save('boards', boards.value); }
function openRules() { const rules = document.getElementById('faces-puzzle-rules'); if (rules) rules.open = true; }

async function loadState() {
  try {
    const result = await facesRequest('state', undefined, undefined, previewKey);
    if (abortRefresh) return;
    const prior = playing.value ? boards.value : stored('boards');
    boards.value = restoreFacesBoards(result.portraits, prior, result.phase === 'game');
    if (state.value?.phase !== result.phase) selected.value = null;
    state.value = result;
    if (result.preview) emit('test-date', Date.parse(result.serverNow));
    const receipt = stored('receipt');
    if (typeof receipt === 'string' && /^FACES-[A-F0-9]{8}$/.test(receipt)) winnerReceipt.value = receipt;
    const access = stored('access');
    if (access?.token && Date.parse(access.expiresAt) > Date.parse(result.serverNow)) accessToken.value = access.token;
    else if (access) changeEmail();
    if (initialLoading.value) { failed.value = false; feedback.value = ''; }
  } catch (error) {
    if (!state.value) reportError(error);
  } finally { initialLoading.value = false; }
}
function reportError(error) {
  failed.value = true;
  feedback.value = error.code === 'preview_denied' ? previewCopy.value.denied : text.value.errors[error.code] || text.value.errors.unavailable;
  if (error.code === 'verify_email') changeEmail();
  if (error.code === 'contest_closed' || error.code === 'contest_not_open') loadState();
}
async function act(action) {
  if (busy.value) return;
  busy.value = true; feedback.value = ''; failed.value = false;
  try { await action(); } catch (error) { reportError(error); } finally { busy.value = false; }
}
async function requestCode() { await act(async () => { const result = await facesRequest('access', { email: email.value, website: website.value, acceptRules: acceptRules.value, rulesVersion: FACES_CAMPAIGN.rulesVersion }); challengeId.value = result.challengeId; }); }
async function verifyCode() { await act(async () => { const result = await facesRequest('verify', { challengeId: challengeId.value, code: code.value }); accessToken.value = result.token; save('access', result); challengeId.value = ''; code.value = ''; }); }
async function submit() { await act(async () => {
  const result = await facesRequest('submit', { boards: boards.value }, accessToken.value, previewKey);
  feedback.value = result.complete ? state.value.preview ? previewCopy.value.complete : result.winner ? '' : text.value.complete : text.value.incomplete;
  if (result.winner) { save('receipt', result.receipt); winnerReceipt.value = result.receipt; }
  if (result.winnerClaimed) state.value.winnerClaimed = true;
}); }
onMounted(() => { loadState(); poll = setInterval(() => { if (!document.hidden) loadState(); }, 15000); document.addEventListener('visibilitychange', onVisibility); });
function onVisibility() { if (!document.hidden) loadState(); }
onUnmounted(() => { abortRefresh = true; clearInterval(poll); document.removeEventListener('visibilitychange', onVisibility); });
</script>

<style scoped>
.puzzle { min-width:0; color:#f5f5f1; font:400 1rem/1.6 'Space Grotesk',Arial,sans-serif; scroll-margin-top:24px }
.puzzle * { box-sizing:border-box }.puzzle-heading{display:flex;justify-content:space-between;gap:12px;font-size:.875rem;font-weight:700;letter-spacing:.08em;margin-bottom:16px}.puzzle-heading strong{color:#ff8b80;white-space:nowrap}
.puzzle-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-bottom:10px}.puzzle-tabs button{border:1px solid #575757;background:transparent;color:#eee;padding:10px 4px;font:inherit;font-weight:600;line-height:1.4;cursor:pointer}.puzzle-tabs button[aria-pressed=true]{background:#e10600;border-color:#e10600}.puzzle-tabs span{display:block;font-size:.875rem;opacity:.8}
.puzzle-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr));aspect-ratio:1;gap:4.5%}.puzzle-grid button{position:relative;display:grid;place-items:center;aspect-ratio:1;min-width:0;overflow:hidden;padding:0;border:0;background:#242424;color:#606060;opacity:1;font:400 clamp(32px,5vw,72px)/1 'Archivo Black',Arial,sans-serif}.puzzle-grid button:nth-child(3n+1){background:#e10600;color:#f5f5f1}.puzzle-grid img{display:block;width:100%;height:100%;object-fit:contain}.puzzle-grid:is(.is-playing,.is-revealed){gap:0}.puzzle-grid.is-playing button{cursor:pointer}.puzzle-grid button.is-selected{outline:4px solid #ff9086;outline-offset:-4px}.puzzle-selection{position:absolute;top:5px;right:5px;width:30px;height:30px;display:grid;place-items:center;color:#111;background:#fff;font:700 18px/1 Arial}
.puzzle-caption{display:flex;justify-content:space-between;gap:12px;font-size:.75rem;color:#b7b7b7;margin-top:12px}.puzzle-status{font-size:1.125rem;line-height:1.5;margin:20px 0 8px}.puzzle-next{font-size:.875rem;color:#ff9d93;margin:8px 0 0}.puzzle-help{color:#c7c7c7}.puzzle-prize{cursor:pointer;font-size:1.25rem;font-weight:700;line-height:1.4;margin:0 0 12px}.puzzle-entry{border-top:1px solid #535353;margin-top:24px;padding-top:24px}.puzzle-dates,.puzzle-note{font-size:.875rem;color:#c7c7c7;line-height:1.6}.puzzle-entry form{margin-top:18px}.puzzle-entry label{display:block;margin-bottom:8px}.puzzle-entry input[type=email],.puzzle-entry input[type=text]{display:block;width:100%;min-height:48px;padding:12px;border:1px solid #777;background:#151515;color:#fff;font:inherit;border-radius:0}.puzzle-entry .puzzle-agree{display:flex;align-items:flex-start;gap:10px;margin:16px 0;font-size:.875rem}.puzzle-agree input{width:20px;height:20px;flex-shrink:0;margin:2px 0 0;accent-color:#e10600}.puzzle a{color:#ffa499;text-decoration:underline}.puzzle-action{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 18px;border:1px solid #e10600;background:#e10600;color:#fff;font:700 1rem/1.4 'Space Grotesk',Arial,sans-serif;cursor:pointer}.puzzle-action:disabled{opacity:.55;cursor:default}.puzzle-reset,.puzzle-verified button{border:0;background:none;color:#ddd;font:inherit;text-decoration:underline;cursor:pointer;padding:12px 0;margin:0 0 0 16px}.puzzle-verified{color:#d1e8ce}.puzzle-verified button{margin-left:0;display:block}.puzzle-rules{margin-top:20px;font-size:.875rem;color:#ccc}.puzzle-rules summary{cursor:pointer;padding:10px 0;font-weight:700}.puzzle-feedback{padding:14px;border-left:3px solid #b4e3a9;background:#252d23;font-size:1rem}.puzzle-feedback.is-error{border-color:#ff8d81;background:#38231f}.puzzle-honeypot{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden}.puzzle :where(a,button,input,summary):focus-visible{outline:3px solid #ffb0a4;outline-offset:3px}
@media(max-width:600px){.puzzle-caption{flex-direction:column;gap:2px}.puzzle-tabs button{font-size:.9375rem}.puzzle-reset{display:block;margin:8px 0 0}.puzzle-action{width:100%}.puzzle-heading{letter-spacing:.03em}}
</style>
