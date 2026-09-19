import { privacy } from "./privacy.js";
const scriptUrl = String(import.meta.env.VITE_PLAUSIBLE_SCRIPT_URL || "");
export const analyticsConfigured = /^https:\/\/plausible\.io\/js\/[a-zA-Z0-9_.-]+\.js$/.test(scriptUrl);
let loading;
function loadAnalytics() {
  if (loading) return loading;
  window.plausible = window.plausible || function (...args) { (window.plausible.q = window.plausible.q || []).push(args); };
  window.plausible.init = window.plausible.init || function (options) { window.plausible.o = options; };
  window.plausible.init({ autoCapturePageviews: false, outboundLinks: false, formSubmissions: false,
    transformRequest: (payload) => privacy.analytics ? { ...payload, r: null } : null });
  loading = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => { script.remove(); loading = null; resolve(false); };
    document.head.appendChild(script);
  });
  return loading;
}
export async function trackPage(route) {
  if (!analyticsConfigured || !privacy.analytics || !route.name || route.meta?.robots?.includes("noindex")) return;
  const ready = await loadAnalytics();
  if (!ready || !privacy.analytics) return;
  // Only named public routes; never send search, checkout, tokens or unknown paths.
  const path = route.name === "product" ? "/product" : route.path;
  window.plausible("pageview", { url: new URL(path, window.location.origin).href });
}
