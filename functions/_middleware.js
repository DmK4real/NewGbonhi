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

  return context.next();
};
