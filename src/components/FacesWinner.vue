<template>
  <section class="faces-winner" aria-labelledby="faces-winner-title">
    <div><h2 id="faces-winner-title">{{ en ? 'FACES challenge winner' : 'Gagnant du défi FACES' }}</h2><p>{{ en ? 'One T-shirt · first three grids validated by the server' : 'Un T-shirt · première validation des trois grilles par le serveur' }}</p></div>
    <button type="button" :disabled="loading" @click="refresh">{{ loading ? (en ? 'Loading…' : 'Chargement…') : (en ? 'Check the winner' : 'Vérifier le gagnant') }}</button>
    <p v-if="error" role="alert">{{ en ? 'Unable to load the winner. Please try again.' : 'Impossible de charger le gagnant. Réessaie dans un instant.' }}</p>
    <dl v-else-if="winner"><div><dt>Email</dt><dd><a :href="`mailto:${winner.email}`">{{ winner.email }}</a></dd></div><div><dt>{{ en ? 'Validated at' : 'Validé le' }}</dt><dd>{{ date }}</dd></div><div><dt>{{ en ? 'Reference' : 'Référence' }}</dt><dd>{{ winner.receipt }}</dd></div></dl>
    <p v-else-if="checked && !loading">{{ en ? 'No winner recorded yet.' : 'Aucun gagnant enregistré pour le moment.' }}</p>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue';
import { i18nState } from '../i18n.js';
import { facesRequest } from '../utils/facesPuzzle.js';
const props = defineProps({ token: { type:String, required:true } });
const en = computed(() => i18nState.language === 'en');
const winner = ref(null), loading = ref(false), error = ref(false), checked = ref(false);
const date = computed(() => winner.value ? new Intl.DateTimeFormat(en.value ? 'en-GB':'fr-CI',{dateStyle:'long',timeStyle:'medium',timeZone:'Africa/Abidjan'}).format(new Date(winner.value.completedAt))+' · Abidjan' : '');
async function refresh() {
  if (loading.value) return;
  loading.value = true; error.value = false;
  try { winner.value = (await facesRequest('winner', null, props.token)).winner; checked.value = true; }
  catch { error.value = true; }
  finally { loading.value = false; }
}
</script>
<style scoped>
.faces-winner{margin:24px 0;padding:24px;border:1px solid #ccc;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;color:#171717;background:#f5f5f1}.faces-winner h2{font-size:1.25rem;margin:0 0 8px}.faces-winner p{font-size:1rem;margin:0}.faces-winner button{padding:12px 18px;min-height:44px;border:1px solid #171717;color:#fff;background:#171717;font:inherit;font-weight:600;line-height:1.3;cursor:pointer}.faces-winner dl{flex-basis:100%;margin:0;display:flex;flex-wrap:wrap;gap:20px}.faces-winner dd{margin:4px 0;overflow-wrap:anywhere}.faces-winner dt{font-size:.875rem;color:#555}.faces-winner a{color:#a30a00}
</style>
