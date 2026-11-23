import "./accessibility.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router.js";
import { i18nState, setLanguage, translate } from "./i18n.js";
import LanguageSwitch from "./components/LanguageSwitch.vue";
import PaymentMethods from "./components/PaymentMethods.vue";
import SiteFooter from "./components/SiteFooter.vue";
import { reportAppError } from "./utils/appError.js";
import { isMobileApp, isMobilePreview } from "./mobile/platform.js";
import { createPreviewFetch } from "./mobile/preview.js";
import { readStoredValue, writeStoredValue, removeStoredValue } from "./utils/storage.js";
import "./mobile/mobile.css";

if (isMobileApp) document.documentElement.classList.add("mobile-app");
if (isMobilePreview) {
  document.documentElement.classList.add("mobile-preview");
  globalThis.fetch = createPreviewFetch(globalThis.fetch.bind(globalThis), {
    apiBase: import.meta.env.VITE_API_BASE,
    pageUrl: window.location.href,
  });
}

const app = createApp(App);
const CHUNK_RELOAD_KEY = "newgbonhi:chunk-reload";
const CHUNK_ERROR_PATTERN =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|loading chunk .* failed/i;

const recoverFromStaleChunk = (error) => {
  const message = String(error?.message || error || "");
  if (!CHUNK_ERROR_PATTERN.test(message)) return false;

  const previousAttempt = Number(readStoredValue(CHUNK_RELOAD_KEY, "sessionStorage")) || 0;
  const now = Date.now();
  if (now - previousAttempt < 30_000) return false;

  // Without a persisted throttle, retrying could cause an endless reload loop.
  if (!writeStoredValue(CHUNK_RELOAD_KEY, String(now), "sessionStorage")) return false;
  window.location.reload();
  return true;
};

app.config.globalProperties.$t = translate;
app.config.globalProperties.$language = i18nState;
app.config.globalProperties.$setLanguage = setLanguage;
app.component("LanguageSwitch", LanguageSwitch);
app.component("PaymentMethods", PaymentMethods);
app.component("SiteFooter", SiteFooter);

app.config.errorHandler = (error, instance, info) => {
  console.error(error);
  reportAppError(error, {
    source: info || instance?.$options?.name || "vue",
    fallbackMessage: "The application hit an unexpected error.",
  });
};

router.onError((error) => {
  console.error(error);
  if (recoverFromStaleChunk(error)) return;
  reportAppError(error, {
    title: "Navigation error",
    source: "router",
    fallbackMessage: "This page could not be opened.",
  });
});

router.afterEach((to, from, failure) => {
  if (!failure) removeStoredValue(CHUNK_RELOAD_KEY, "sessionStorage");
});

window.addEventListener("error", (event) => {
  reportAppError(event.error, {
    source: "window",
    fallbackMessage: event.message || "Unexpected browser error.",
  });
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  reportAppError(reason, {
    source: "promise",
    fallbackMessage: "A background request failed unexpectedly.",
  });
});

app.use(router);

// Avoid treating the first async route as an animated page transition.
// On failure, still mount the error screen populated by router.onError.
const mountApp = () => {
  app.mount("#app");
  if (isMobileApp) {
    void import("./mobile/runtime.js")
      .then(({ initializeNativeApp }) => initializeNativeApp(router))
      .catch((error) => console.error("Native app initialization failed", error));
  }
};
router.isReady().then(mountApp, mountApp);
