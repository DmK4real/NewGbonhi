import { reactive } from "vue";

export const appErrorState = reactive({
  active: false,
  title: "Temporary issue",
  message:
    "Something went wrong while loading this page. Please try again.",
  source: "",
});

const normalizeMessage = (value, fallback) => {
  const message = String(value || "").trim();
  return message || fallback;
};

export const reportAppError = (error, context = {}) => {
  const title = normalizeMessage(context.title, "Temporary issue");
  const fallbackMessage =
    context.fallbackMessage ||
    "Something went wrong while loading this page. Please try again.";
  const message = normalizeMessage(error?.message, fallbackMessage);

  appErrorState.active = true;
  appErrorState.title = title;
  appErrorState.message = message;
  appErrorState.source = normalizeMessage(context.source, "application");
};

export const clearAppError = () => {
  appErrorState.active = false;
  appErrorState.title = "Temporary issue";
  appErrorState.message =
    "Something went wrong while loading this page. Please try again.";
  appErrorState.source = "";
};
