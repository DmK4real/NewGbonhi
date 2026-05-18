<template>
  <div class="language-switch" aria-label="Language selector">
    <button
      type="button"
      :class="{ active: language === 'en' }"
      :aria-pressed="language === 'en'"
      @click="setLanguage('en')"
    >
      EN
    </button>
    <span aria-hidden="true">|</span>
    <button
      type="button"
      :class="{ active: language === 'fr' }"
      :aria-pressed="language === 'fr'"
      @click="setLanguage('fr')"
    >
      FR
    </button>
  </div>
</template>

<script>
import { i18nState, setLanguage } from "../i18n.js";

export default {
  name: "LanguageSwitch",
  computed: {
    language() {
      return i18nState.language;
    },
  },
  methods: {
    setLanguage,
  },
};
</script>

<style scoped>
.language-switch {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line, #0b0b0b);
  background: #050505;
  color: #fff;
  overflow: hidden;
}

.language-switch button {
  border: 0;
  background: transparent;
  color: inherit;
  padding: 10px 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.language-switch span {
  color: rgba(255, 255, 255, 0.48);
  font-size: 12px;
}

.language-switch button.active {
  background: #fff;
  color: #050505;
}

.language-switch button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: -2px;
}

.language-switch button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

.language-switch button.active:hover {
  background: #fff;
  color: #050505;
}

@media (max-width: 700px) {
  .language-switch {
    width: 100%;
  }

  .language-switch button {
    flex: 1;
  }
}
</style>
