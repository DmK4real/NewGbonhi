// Only the separately built team preview installs this fetch adapter.
export function createPreviewFetch(fetchImplementation, { apiBase, pageUrl }) {
  const pageOrigin = new URL(pageUrl).origin;
  const apiOrigin = new URL(apiBase, pageUrl).origin;
  const readMethods = new Set(["GET", "HEAD", "OPTIONS"]);

  return async (input, options) => {
    const value = typeof input === "string" || input instanceof URL ? input : input.url;
    const url = new URL(value, pageUrl);
    const method = String(options?.method || input?.method || "GET").toUpperCase();
    const targetsApi = url.origin === apiOrigin ||
      (url.origin === pageOrigin && (url.pathname === "/api" || url.pathname.startsWith("/api/")));
    const facesTest = url.origin === apiOrigin && url.pathname === "/api/faces/submit"
      && method === "POST" && Boolean(url.searchParams.get("preview"));
    if (targetsApi && !readMethods.has(method) && !facesTest) {
      return new Response(JSON.stringify({
        error: "Version de test : les commandes, paiements et inscriptions sont désactivés.",
      }), { status: 403, headers: { "Content-Type": "application/json" } });
    }
    return fetchImplementation(input, options);
  };
}
