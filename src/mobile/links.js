// Only navigation links can enter the router; assets and untrusted hosts stay out.
export function mobileRouteFromUrl(value) {
  try {
    const url = new URL(value);
    const isCustom = url.protocol === "newgbonhi:" && url.hostname === "app";
    const isWebsite = url.protocol === "https:" &&
      ["newgbonhi.com", "www.newgbonhi.com"].includes(url.hostname) && !url.port;
    if ((!isCustom && !isWebsite) || url.username || url.password) return null;
    const path = url.hash.startsWith("#/") ? url.hash.slice(1) : `${url.pathname}${url.search}${url.hash}`;
    if (!/^\/(?:$|\?|#|faces(?:[/?#]|$)|collections(?:[/?#]|$)|product\/[^/]+(?:[?#].*)?$|checkout(?:[/?#]|$)|lookbook(?:[/?#]|$)|lab(?:[/?#]|$)|about(?:[/?#]|$)|studio(?:[/?#]|$)|confidentialite(?:[/?#]|$)|cgu(?:[/?#]|$))/.test(path)) return null;
    return path;
  } catch {
    return null;
  }
}
