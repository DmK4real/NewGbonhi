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
  gap: 5px;
  color: currentColor;
  opacity: 0.58;
}

.language-switch button {
  border: 0;
  background: transparent;
  color: inherit;
  padding: 2px 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  opacity: 0.58;
}

.language-switch span {
  color: currentColor;
  opacity: 0.42;
  font-size: 10px;
}

.language-switch button.active {
  opacity: 1;
}

.language-switch button:focus-visible {
  outline: 1px solid currentColor;
  outline-offset: 3px;
}

.language-switch button:hover {
  opacity: 1;
}

@media (max-width: 700px) {
  .language-switch {
    width: auto;
  }

  .language-switch button {
    flex: 0 0 auto;
  }
}
</style>
