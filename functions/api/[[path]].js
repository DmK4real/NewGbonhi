const WORKER_API_ORIGIN = "https://newgbonhi-api.dominiquekouakou2.workers.dev";

const jsonError = (status, message) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

export async function onRequest({ request, params }) {
  const path = Array.isArray(params.path) ? params.path.join("/") : params.path || "";
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`/api/${path}`, WORKER_API_ORIGIN);
  upstreamUrl.search = incomingUrl.search;

  try {
    const upstreamRequest = new Request(upstreamUrl, request);
    const response = await fetch(upstreamRequest);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    return jsonError(502, "Orders service unavailable.");
  }
}
