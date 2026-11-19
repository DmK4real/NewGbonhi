// Deployments may configure either the origin or the API root (.../api).
export function normalizeApiBase(value = "") {
  return String(value).trim().replace(/\/+$/, "").replace(/\/api$/i, "");
}
