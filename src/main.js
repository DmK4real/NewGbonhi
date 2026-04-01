import { createApp } from "vue";
import App from "./App.vue";
import router from "./router.js";
import { reportAppError } from "./utils/appError.js";

const app = createApp(App);

app.config.errorHandler = (error, instance, info) => {
  console.error(error);
  reportAppError(error, {
    source: info || instance?.$options?.name || "vue",
    fallbackMessage: "The application hit an unexpected error.",
  });
};

router.onError((error) => {
  console.error(error);
  reportAppError(error, {
    title: "Navigation error",
    source: "router",
    fallbackMessage: "This page could not be opened.",
  });
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
