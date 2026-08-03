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
    return context.env.ASSETS.fetch(new Request(indexUrl, context.request));
  }

  return response;
};
