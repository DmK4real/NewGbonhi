import { build, loadEnv } from "vite";

const env = { ...loadEnv("mobile", process.cwd(), ""), ...process.env };
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
  },
  build: { outDir: "dist-mobile" },
});
