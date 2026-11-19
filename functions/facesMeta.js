import { FACES_META } from "../src/data/facesDrop.js";

// Social crawlers need the Faces metadata in the HTML before Vue runs.
export function rewriteFacesHtml(html) {
  const title = FACES_META.title;
  const description = FACES_META.description;
  const url = "https://newgbonhi.com/faces";
  const metadata = {
    description, "og:title": title, "og:description": description,
    "og:url": url, "og:image": FACES_META.image,
    "og:image:alt": "FACES — NewGbonhi, 19 décembre 2026 à 18 h, Abidjan",
    "twitter:title": title, "twitter:description": description,
    "twitter:image": FACES_META.image,
  };
  const seen = new Set();
  const rewritten = html
    .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
    .replace(/<meta\b[^>]*>/gi, tag => {
      const key = tag.match(/\b(?:name|property)=["']([^"']+)["']/i)?.[1];
      if (Object.hasOwn(metadata, key)) seen.add(key);
      return Object.hasOwn(metadata, key)
        ? tag.replace(/\bcontent=(["'])([\s\S]*?)\1/i, `content="${metadata[key]}"`)
        : tag;
    })
    .replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}" />`);
  const missing = Object.entries(metadata).filter(([key]) => !seen.has(key))
    .map(([key, value]) => `<meta ${key.startsWith("og:") ? "property" : "name"}="${key}" content="${value}" />`).join("\n");
  return rewritten.replace(/<\/head>/i, `${missing}\n</head>`);
}
