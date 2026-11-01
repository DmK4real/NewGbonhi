<template>
  <section class="skate-archive" aria-labelledby="skate-archive-title">
    <header class="skate-heading">
      <div><p class="skate-kicker">NG / OBJECTS — 001</p><h2 id="skate-archive-title">{{ copy.title }}</h2></div>
      <p>{{ copy.intro }}</p>
    </header>
    <div class="skate-display">
      <div ref="stage" @mouseenter="hovered = true" @mouseleave="hovered = false" @focusin="focused = true" @focusout="focused = false" class="skate-stage" tabindex="0" role="group" :aria-label="copy.explore" :aria-describedby="'skate-hint'"
        @keydown="onKey" @pointerdown="onDown" @pointerup="onUp" @pointercancel="pointerStart = null">
        <span class="display-orbit" aria-hidden="true"></span>
        <div class="skate-turntable" :style="{ transform: `rotateY(${-step * 60}deg)` }" aria-hidden="true">
          <span class="display-spindle"></span>
          <div v-for="(deck, index) in decks" :key="deck.id" class="skate-hanger" :style="{ transform: `rotateY(${index * 60}deg) translateZ(var(--rack-radius))` }">
            <span class="hanger-clips"></span><img :src="deck.image" alt="" loading="lazy" decoding="async" draggable="false" />
          </div>
        </div>
        <span class="display-base" aria-hidden="true"></span>
      </div>
      <div class="skate-caption" aria-live="polite" aria-atomic="true"><span>{{ String(activeIndex + 1).padStart(2, '0') }} / 06</span><h3>{{ activeDeck.title }}</h3><p>{{ activeDeck.detail }}</p></div>
      <div class="skate-controls">
        <button type="button" :aria-label="copy.previous" @click="move(-1)">←</button>
        <button type="button" class="rotation-toggle" :disabled="reducedMotion" :aria-pressed="playing" @click="toggleRotation">{{ playing ? copy.pause : copy.rotate }}</button>
        <button type="button" :aria-label="copy.next" @click="move(1)">→</button>
      </div>
      <p id="skate-hint" class="skate-hint">{{ copy.hint }}</p>
    </div>
    <nav class="skate-designs" :aria-label="copy.designs">
      <button v-for="(deck, index) in decks" :key="deck.id" type="button" :aria-pressed="index === activeIndex" @click="choose(index)">
        <span>{{ String(index + 1).padStart(2, '0') }}</span>{{ deck.title }}
      </button>
    </nav>
    <p class="skate-note">{{ copy.note }}</p>
  </section>
</template>

<script>
import { skateDecks } from '../data/skateDecks.js';
import { i18nState } from '../i18n.js';

export default {
  name: 'SkateArchive',
  data: () => ({ decks: skateDecks, step: 0, playing: false, reducedMotion: false, hovered: false, focused: false, visible: false, pointerStart: null }),
  computed: {
    activeIndex() { return ((this.step % this.decks.length) + this.decks.length) % this.decks.length; },
    activeDeck() { return this.decks[this.activeIndex]; },
    copy() {
      return i18nState.language === 'fr' ? {
        title: 'Skate archive', intro: 'Six surfaces. Une même énergie. Fais tourner le portant pour explorer les designs NewGbonhi.',
        explore: 'Présentoir rotatif de six planches NewGbonhi', previous: 'Design précédent', next: 'Design suivant',
        rotate: 'Lancer la rotation', pause: 'Mettre en pause', hint: 'Glisse pour tourner · ou utilise les flèches du clavier', designs: 'Choisir un design',
        note: 'Une série NewGbonhi, entre culture skate et archive graphique.',
      } : {
        title: 'Skate archive', intro: 'Six surfaces. The same energy. Turn the rack to explore the NewGbonhi designs.',
        explore: 'Rotating display of six NewGbonhi skate decks', previous: 'Previous design', next: 'Next design',
        rotate: 'Start rotation', pause: 'Pause rotation', hint: 'Swipe to turn · or use the arrow keys', designs: 'Choose a design',
        note: 'A NewGbonhi series exploring skate culture and graphic archives.',
      };
    },
  },
  mounted() {
    this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.onMotionChange = () => { this.reducedMotion = this.motionPreference.matches; if (this.reducedMotion) this.playing = false; };
    this.onMotionChange(); this.motionPreference.addEventListener('change', this.onMotionChange);
    this.observer = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; }, { threshold: .25 });
    this.observer.observe(this.$refs.stage);
    this.timer = window.setInterval(() => {
      if (this.playing && this.visible && !this.hovered && !this.focused && !document.hidden) this.move(1, false);
    }, 3500);
  },
  beforeUnmount() {
    window.clearInterval(this.timer); this.observer?.disconnect();
    this.motionPreference?.removeEventListener('change', this.onMotionChange);
  },
  methods: {
    move(direction, manual = true) { if (manual) this.playing = false; this.step += direction; },
    choose(index) {
      if (!Number.isInteger(index) || index < 0 || index >= this.decks.length) return;
      const offset = ((index - this.activeIndex + this.decks.length + 3) % this.decks.length) - 3;
      this.move(offset);
    },
    toggleRotation() { if (!this.reducedMotion) this.playing = !this.playing; },
    onKey(event) {
      if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); this.move(event.key === 'ArrowRight' ? 1 : -1); }
    },
    onDown(event) { if (event.isPrimary && (event.pointerType !== 'mouse' || event.button === 0)) this.pointerStart = { x: event.clientX, y: event.clientY }; },
    onUp(event) {
      const start = this.pointerStart; this.pointerStart = null;
      if (!start) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) this.move(dx < 0 ? 1 : -1);
    },
  },
};
</script>

<style scoped>
.skate-archive{--rack-radius:220px;--deck-height:330px;--deck-width:92px;position:relative;padding:48px 32px 32px;border:1px solid #282828;background:#121312;color:#eeeae1}
.skate-heading{display:flex;justify-content:space-between;align-items:end;gap:32px;margin-bottom:20px}.skate-kicker{font:10px monospace;letter-spacing:2px;color:#d5292d}.skate-heading h2{font-family:'Archivo Black',Arial,sans-serif;font-size:clamp(34px,5vw,66px);line-height:1;margin:14px 0 0;text-transform:uppercase;letter-spacing:-2px}.skate-heading>p{max-width:330px;font-size:13px;line-height:1.7;color:#aaa69e}
.skate-display{overflow:hidden;border:1px solid #ffffff14;background:radial-gradient(ellipse at 50% 40%,#393630 0%,#1b1b19 45%,#101111 80%);border-radius:4px}
.skate-stage{height:455px;position:relative;perspective:950px;perspective-origin:50% 45%;touch-action:pan-y;cursor:grab;outline-offset:-5px;overflow:hidden}.skate-stage:active{cursor:grabbing}.skate-stage:focus-visible{outline:2px solid #d5292d}
.skate-turntable{position:absolute;left:50%;top:50px;width:0;height:var(--deck-height);transform-style:preserve-3d;transition:transform 1.05s cubic-bezier(.22,.7,.2,1)}
.skate-hanger{position:absolute;left:calc(var(--deck-width) / -2);top:0;width:var(--deck-width);height:var(--deck-height);transform-style:preserve-3d;backface-visibility:hidden}
.skate-hanger img{display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 12px 10px #0009);user-select:none}
.hanger-clips{position:absolute;left:calc(50% - 11px);top:-16px;width:22px;height:13px;border:2px solid #a6a49c;border-top:4px solid #e0ddd4;border-radius:3px;box-shadow:0 0 0 3px #171817;transform:translateZ(-1px)}
.display-spindle{position:absolute;left:-5px;top:0;width:10px;height:365px;background:linear-gradient(90deg,#181918,#a29f95 40%,#373936);transform:translateZ(-2px)}
.display-orbit{position:absolute;left:calc(50% - 220px);top:17px;width:440px;height:98px;border:3px solid #777870;border-radius:50%;box-shadow:0 3px 0 #161714,inset 0 1px #e5dfce55}
.display-base{position:absolute;bottom:22px;left:calc(50% - 100px);width:200px;height:28px;border-radius:50%;background:linear-gradient(#6a6860,#252624 65%);box-shadow:0 18px 25px #000}
.skate-caption{text-align:center;padding:8px 20px 16px}.skate-caption>span{font:10px monospace;letter-spacing:2px;color:#aeaaa0}.skate-caption h3{font-family:'Archivo Black',Arial,sans-serif;font-size:27px;line-height:1;margin:10px 0;text-transform:uppercase}.skate-caption p{font:9px monospace;letter-spacing:2px;color:#b8b3a6}
.skate-controls{display:flex;justify-content:center;gap:10px}.skate-controls button{border:1px solid #ffffff36;border-radius:24px;min-width:44px;min-height:44px;background:#20211e;color:#eeeae1;cursor:pointer;font:12px Arial,sans-serif}.skate-controls .rotation-toggle{padding:0 22px;min-width:170px}.skate-controls button:disabled{opacity:.4;cursor:default}.skate-hint{text-align:center;font-size:11px;color:#b3ada2;margin:18px 12px 24px}
.skate-designs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:18px}.skate-designs button{padding:16px 10px;min-height:60px;border:1px solid #ffffff26;background:transparent;text-align:left;color:#d9d5cc;cursor:pointer;font-size:11px}.skate-designs button span{display:block;font:9px monospace;color:#9a958a;margin-bottom:7px}.skate-designs button[aria-pressed=true]{border-color:#d5292d;background:#d5292d15}.skate-archive button:focus-visible{outline:2px solid #e3ddd0;outline-offset:3px}.skate-note{font-size:11px;color:#9a958c;margin:20px 0;line-height:1.7}
@media(max-width:600px){.skate-archive{--rack-radius:145px;--deck-height:270px;--deck-width:74px;padding:32px 16px 24px}.skate-heading{display:block}.skate-heading>p{max-width:100%;font-size:12px}.skate-stage{height:385px;perspective:800px}.display-orbit{left:calc(50% - 145px);width:290px;top:22px;height:72px}.display-spindle{height:300px}.skate-turntable{top:52px}.skate-designs{grid-template-columns:repeat(3,minmax(0,1fr))}.skate-caption h3{font-size:24px}.skate-hint{font-size:10px}}
@media(prefers-reduced-motion:reduce){.skate-turntable{transition:none}}
</style>
