export function shouldUseHashRouter(hashMode, hostname = "") {
  const host = hostname.toLowerCase();
  const hasHistoryFallback = host === "newgbonhi.com" || host === "www.newgbonhi.com" ||
    host === "newgbonhi.pages.dev" || host.endsWith(".newgbonhi.pages.dev");
  // Cloudflare serves real paths through functions/_middleware.js. A legacy
  // GitHub Pages build setting must not turn a direct /faces visit into home.
  return hashMode === "true" && !hasHistoryFallback;
}
