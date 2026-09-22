// Pages currently bundles Functions with Wrangler 3; use its JSON loader.
import products from "../src/data/products.json";
const appPaths = new Set(["/", "/collections", "/lookbook", "/lab", "/lab/arw-studio", "/about", "/studio", "/checkout", "/orders", "/confidentialite", "/cgu", ...products.map(product => `/product/${product.slug}`)]);
const PRIMARY_HOST = "newgbonhi.com";
const REDIRECT_HOSTS = new Set(["www.newgbonhi.com"]);

export const onRequest = async (context) => {
  const url = new URL(context.request.url);

  if (REDIRECT_HOSTS.has(url.hostname.toLowerCase()) || (url.hostname === PRIMARY_HOST && url.protocol !== "https:")) {
    url.protocol = "https:";
    url.hostname = PRIMARY_HOST;
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  const withHtmlCachePolicy = (response) => {
    const contentType = response.headers.get("Content-Type") || "";
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Frame-Options", "DENY");
    if (url.protocol === "https:") headers.set("Strict-Transport-Security", "max-age=31536000");
    if (contentType.includes("text/html")) headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return new Response(response.body, {
      status: contentType.includes("text/html") && !appPaths.has(url.pathname.replace(/\/$/, "") || "/") ? 404 : response.status,
      statusText: response.statusText,
      headers,
    });
  };

  const response = await context.next();
  const acceptsHtml = context.request.headers
    .get("Accept")
    ?.includes("text/html");
  const isAppRoute =
    context.request.method === "GET" &&
    acceptsHtml &&
    !url.pathname.split("/").pop()?.includes(".");

  if (response.status === 404 && isAppRoute) {
    const indexUrl = new URL("/index.html", url);
    const indexResponse = await context.env.ASSETS.fetch(
      new Request(indexUrl, context.request)
    );
    return withHtmlCachePolicy(indexResponse);
  }

  return withHtmlCachePolicy(response);
};
