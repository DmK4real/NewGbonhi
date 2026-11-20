import { App } from "@capacitor/app";
import { isNativePlatform } from "./platform.js";
import { openExternalUrl } from "./actions.js";
import { mobileRouteFromUrl } from "./links.js";

export async function initializeNativeApp(router) {
  if (!isNativePlatform()) return;

  const navigate = async (url) => {
    const path = mobileRouteFromUrl(url);
    if (!path) return;
    await router.push(path);
  };

  await App.addListener("appUrlOpen", ({ url }) => {
    void navigate(url).catch(console.error);
  });
  const launch = await App.getLaunchUrl();
  if (launch?.url) await navigate(launch.url);

  await App.addListener("backButton", () => {
    if (document.querySelector('.cart-panel[aria-modal="true"], .shop-header.menu-open')) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    } else if (window.history.state?.back) {
      router.back();
    } else if (router.currentRoute.value.path !== "/") {
      void router.replace("/");
    } else {
      void App.minimizeApp();
    }
  });

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest?.("a[href]");
    if (!anchor || event.defaultPrevented || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin === window.location.origin) return;
    const path = mobileRouteFromUrl(url.href);
    if (path) {
      event.preventDefault();
      void navigate(url.href).catch(console.error);
    } else if (["https:", "mailto:", "tel:"].includes(url.protocol)) {
      event.preventDefault();
      void openExternalUrl(url.href).catch((error) => {
        console.error("External link unavailable", error);
        window.dispatchEvent(new CustomEvent("newgbonhi:link-error"));
      });
    }
  });
}
