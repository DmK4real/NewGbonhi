// Browser policies can deny access even when the storage property exists.
// Keep the application usable with in-memory state in that case.
const storage = kind => (typeof window === "undefined" ? globalThis : window)[kind];

export function readStoredValue(key, kind = "localStorage") {
  try { return storage(kind)?.getItem(key) ?? null; } catch { return null; }
}

export function writeStoredValue(key, value, kind = "localStorage") {
  try {
    const target = storage(kind);
    if (!target) return false;
    target.setItem(key, value);
    return true;
  } catch { return false; }
}

export function removeStoredValue(key, kind = "localStorage") {
  try {
    const target = storage(kind);
    if (!target) return false;
    target.removeItem(key);
    return true;
  } catch { return false; }
}
