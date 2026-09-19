import { reactive } from "vue";
export const CONSENT_KEY = "newgbonhi-consent-v1";
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export function readConsent(storage, now = Date.now()) {
  try {
    const value = JSON.parse(storage.getItem(CONSENT_KEY));
    return value?.version === 1 && typeof value.analytics === "boolean" &&
      Number.isFinite(value.savedAt) && now >= value.savedAt && now - value.savedAt < CONSENT_MAX_AGE ? value : null;
  } catch { return null; }
}
const saved = typeof window === "undefined" ? null : (() => { try { return readConsent(window.localStorage); } catch { return null; } })();
export const privacy = reactive({ analytics: saved?.analytics === true, open: !saved });
export function saveConsent(analytics) {
  privacy.analytics = analytics === true;
  privacy.open = false;
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, analytics: privacy.analytics, savedAt: Date.now() })); } catch { /* Session-only choice when storage is blocked. */ }
}
export function openPrivacy() { privacy.open = true; }
