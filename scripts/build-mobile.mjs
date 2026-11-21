import { build, loadEnv } from "vite";

const env = { ...loadEnv("mobile", process.cwd(), ""), ...process.env };
const preview = process.argv.includes("--preview");
const api = new URL(env.VITE_API_BASE || "");
if (api.protocol !== "https:" || api.username || api.password) {
  throw new Error("The mobile app requires a public HTTPS VITE_API_BASE.");
}

await build({
  mode: "mobile",
  base: "/",
  plugins: [{
    name: "newgbonhi-mobile-home-icon",
    transformIndexHtml(html) {
      if (preview) {
        html = html.replace(/<title>[^<]*<\/title>/, "<title>NewGbonhi — Version de test</title>")
          .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, nofollow" />');
      }
      return {
        html: html.replace(/href="[^"]*apple-touch-icon\.png"/, 'href="/mobile/apple-touch-icon.png"'),
        tags: [{ tag: "meta", attrs: { name: "apple-mobile-web-app-title", content: "NewGbonhi" }, injectTo: "head" }],
      };
    },
  }],
  define: {
    "import.meta.env.VITE_NATIVE_APP": JSON.stringify("true"),
    "import.meta.env.VITE_USE_HASH_ROUTER": JSON.stringify("true"),
    "import.meta.env.VITE_API_BASE": JSON.stringify(api.href.replace(/\/$/, "")),
    "import.meta.env.VITE_MOBILE_PREVIEW": JSON.stringify(String(preview)),
  },
  build: { outDir: preview ? "dist-mobile-preview" : "dist-mobile" },
});
