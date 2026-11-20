// Deployments may configure either the origin or the API root (.../api).
export function normalizeApiBase(value = "") {
  return String(value).trim().replace(/\/+$/, "").replace(/\/api$/i, "");
}

export const apiUrl = (path) =>
  `${normalizeApiBase(import.meta.env.VITE_API_BASE)}/api/${String(path).replace(/^\/+/, "")}`;
