import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const productsPath = path.join(projectRoot, "src", "data", "products.json");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

const normalizeSiteUrl = (value) => {
  const raw = String(value || "").trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const parsed = new URL(withProtocol);
  const cleanPath = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${cleanPath === "/" ? "" : cleanPath}`;
};

const makeAbsoluteUrl = (siteUrl, routePath) => {
  const cleanPath = routePath === "/" ? "/" : `/${String(routePath).replace(/^\/+/, "")}`;
  return `${siteUrl}${cleanPath}`;
};

const loadProducts = async () => {
  const payload = await fs.readFile(productsPath, "utf8");
  const parsed = JSON.parse(payload);
  return Array.isArray(parsed) ? parsed : [];
};

const buildSitemapXml = (siteUrl, routes) => {
  const urlNodes = routes
    .map((entry) => {
      const loc = makeAbsoluteUrl(siteUrl, entry.path);
      return [
        "  <url>",
        `    <loc>${loc}</loc>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlNodes,
    "</urlset>",
    "",
  ].join("\n");
};

const buildRobotsTxt = (siteUrl) =>
  [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${makeAbsoluteUrl(siteUrl, "/sitemap.xml")}`,
    "",
  ].join("\n");

const main = async () => {
  const siteUrl = normalizeSiteUrl(
    process.env.SITE_URL || process.env.VITE_SITE_URL || "https://dmk4real.github.io/NewGbonhi"
  );

  const products = await loadProducts();
  const staticRoutes = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/about", changefreq: "weekly", priority: "0.7" },
    { path: "/lookbook", changefreq: "weekly", priority: "0.8" },
  ];

  const productRoutes = products
    .map((product, index) => {
      const slug = product.slug || slugify(product.title || `product-${index + 1}`);
      if (!slug) {
        return null;
      }
      return { path: `/product/${slug}`, changefreq: "weekly", priority: "0.9" };
    })
    .filter(Boolean);

  const uniqueRoutes = Array.from(
    [...staticRoutes, ...productRoutes].reduce((acc, route) => {
      if (!acc.has(route.path)) {
        acc.set(route.path, route);
      }
      return acc;
    }, new Map()).values()
  );

  const sitemapXml = buildSitemapXml(siteUrl, uniqueRoutes);
  const robotsTxt = buildRobotsTxt(siteUrl);

  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");
  await fs.writeFile(path.join(publicDir, "robots.txt"), robotsTxt, "utf8");

  console.log(`SEO files generated for: ${siteUrl}`);
  console.log(`Routes indexed: ${uniqueRoutes.length}`);
};

await main();
