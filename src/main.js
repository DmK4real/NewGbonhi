import { createApp } from "vue";
import App from "./App.vue";
import router from "./router.js";
import { i18nState, setLanguage, translate } from "./i18n.js";
import LanguageSwitch from "./components/LanguageSwitch.vue";
import PaymentMethods from "./components/PaymentMethods.vue";
import SiteFooter from "./components/SiteFooter.vue";
import { reportAppError } from "./utils/appError.js";

const app = createApp(App);
const CHUNK_RELOAD_KEY = "newgbonhi:chunk-reload";
const CHUNK_ERROR_PATTERN =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|loading chunk .* failed/i;

const recoverFromStaleChunk = (error) => {
  const message = String(error?.message || error || "");
  if (!CHUNK_ERROR_PATTERN.test(message)) return false;

  const previousAttempt = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY)) || 0;
  const now = Date.now();
  if (now - previousAttempt < 30_000) return false;

  sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
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
  if (!failure) sessionStorage.removeItem(CHUNK_RELOAD_KEY);
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

app.use(router).mount("#app");
