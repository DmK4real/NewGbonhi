const DEFAULT_TITLE = "New Gbonhi Shop | Streetwear en Cote d'Ivoire";
const DEFAULT_DESCRIPTION =
  "New Gbonhi Shop: pieces streetwear New Gbonhi, drops limites, lookbook et commande en ligne.";
const DEFAULT_ROBOTS = "index, follow";

const ensureMetaTag = (attribute, key) => {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.head.querySelector(selector);
  if (existing) {
    return existing;
  }
  const created = document.createElement("meta");
  created.setAttribute(attribute, key);
  document.head.appendChild(created);
  return created;
};

const setMeta = (attribute, key, value) => {
  const element = ensureMetaTag(attribute, key);
  element.setAttribute("content", value);
};

const ensureCanonicalLink = () => {
  const existing = document.head.querySelector('link[rel="canonical"]');
  if (existing) {
    return existing;
  }
  const created = document.createElement("link");
  created.setAttribute("rel", "canonical");
  document.head.appendChild(created);
  return created;
};

const resolveCanonicalPath = (routePath) => {
  if (routePath) {
    return routePath;
  }
  return window.location.pathname || "/";
};

export const applySeo = (options = {}) => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const title = options.title || DEFAULT_TITLE;
  const description = options.description || DEFAULT_DESCRIPTION;
  const robots = options.robots || DEFAULT_ROBOTS;

  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", robots);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:site_name", "New Gbonhi Shop");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("name", "twitter:card", "summary");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);

  const canonicalPath = resolveCanonicalPath(options.path);
  const canonicalUrl = new URL(canonicalPath, window.location.origin).toString();
  const canonicalLink = ensureCanonicalLink();
  canonicalLink.setAttribute("href", canonicalUrl);
  setMeta("property", "og:url", canonicalUrl);
};
