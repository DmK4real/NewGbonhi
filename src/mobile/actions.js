import { isNativePlatform } from "./platform.js";

export async function openExternalUrl(value) {
  const url = new URL(value);
  if (!["https:", "mailto:", "tel:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Unsupported external link.");
  }
  if (!isNativePlatform()) {
    return Boolean(window.open(url.href, "_blank", "noopener,noreferrer"));
  }
  if (["mailto:", "tel:"].includes(url.protocol) || ["wa.me", "api.whatsapp.com"].includes(url.hostname)) {
    const { AppLauncher } = await import("@capacitor/app-launcher");
    const result = await AppLauncher.openUrl({ url: url.href });
    if (!result.completed) throw new Error("Unable to open this link.");
  } else {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: url.href, toolbarColor: "#f5f5f1" });
  }
  return true;
}

export async function copyText(text) {
  if (isNativePlatform()) {
    const { Clipboard } = await import("@capacitor/clipboard");
    await Clipboard.write({ string: String(text) });
  } else {
    await navigator.clipboard.writeText(String(text));
  }
}

export async function shareContent(content) {
  if (isNativePlatform()) {
    const { Share } = await import("@capacitor/share");
    await Share.share(content);
    return true;
  }
  if (navigator.share) {
    await navigator.share(content);
    return true;
  }
  await copyText(content.url);
  return false;
}
