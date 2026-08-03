const PRIMARY_HOST = "newgbonhi.com";
const REDIRECT_HOSTS = new Set(["www.newgbonhi.com"]);

export const onRequest = async (context) => {
  const url = new URL(context.request.url);

  if (REDIRECT_HOSTS.has(url.hostname.toLowerCase())) {
    url.protocol = "https:";
    url.hostname = PRIMARY_HOST;
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }

  const withHtmlCachePolicy = (response) => {
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("text/html")) return response;
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return new Response(response.body, {
      status: response.status,
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
