const apiBase = String(import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
export const facesTileUrl = src => `${apiBase}${src}`;

export async function facesRequest(path, payload, token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${apiBase}/api/faces/${path}`, {
      method: payload ? "POST" : "GET", cache: "no-store",
      headers: { ...(payload ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(payload ? { body: JSON.stringify(payload) } : {}), signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.error || "unavailable"), { code: result.error || "unavailable" });
    return result;
  } finally { clearTimeout(timeout); }
}

// Keep a visitor's arrangement only if it still contains the exact published pieces.
export function restoreFacesBoards(portraits, saved, playable) {
  return Object.fromEntries(portraits.map(portrait => {
    const published = portrait.tiles.map(tile => tile?.id ?? null);
    const previous = saved?.[portrait.id];
    const valid = playable && Array.isArray(previous) && previous.length === 9 && [...previous].sort().join() === [...published].sort().join();
    return [portrait.id, valid ? [...previous] : published];
  }));
}

export function swapFacesTiles(board, first, second) {
  if (!Number.isInteger(first) || !Number.isInteger(second) || first < 0 || second < 0 || first > 8 || second > 8) return board;
  const next = [...board];
  [next[first], next[second]] = [next[second], next[first]];
  return next;
}
