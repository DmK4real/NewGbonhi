import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import { onRequest } from "./_middleware.js";

describe("Faces direct visits and social previews", () => {
  it("serves /faces as a public page with the right date, image and canonical before JavaScript runs", async () => {
    const index = await fs.readFile(new URL("../index.html", import.meta.url), "utf8");
    const result = await onRequest({
      request: new Request("https://newgbonhi.com/faces?utm_source=instagram", { headers: { Accept: "text/html" } }),
      next: async () => new Response("Missing", { status: 404 }),
      env: { ASSETS: { fetch: async () => new Response(index, { headers: { "Content-Type": "text/html" } }) } },
    });
    expect(result.status).toBe(200);
    const html = await result.text();
    expect(html).toContain("<title>FACES — 19 décembre à 18 h | NewGbonhi</title>");
    expect(html).toContain('href="https://newgbonhi.com/faces"');
    expect(html).toContain('content="https://newgbonhi.com/faces/faces-puzzle-preview.jpg"');
    expect(html).toContain('property="og:image:width" content="1047"');
    expect(html).toContain('property="og:image:height" content="1280"');
    expect(html).toContain('content="FACES — un nouveau fragment chaque jour"');
    expect(html).toContain('content="https://newgbonhi.com/faces"');
    expect(result.headers.get("Cache-Control")).toContain("no-store");
  });
  it.each(["/faces/social-share.jpg", "/faces/newgbonhi-logo.png"])("redirects the previous preview %s to the current puzzle image", async path => {
    const result = await onRequest({ request: new Request(`https://newgbonhi.com${path}`), next: async () => new Response("Previous preview") });
    expect(result.status).toBe(301);
    expect(result.headers.get("Location")).toBe("https://newgbonhi.com/faces/faces-puzzle-preview.jpg");
    expect(result.headers.get("Cache-Control")).toBe("no-store");
  });
  it("still returns 404 for an unknown page", async () => {
    const result = await onRequest({ request: new Request("https://newgbonhi.com/not-a-page"), next: async () => new Response("<html></html>", { headers: { "Content-Type": "text/html" } }) });
    expect(result.status).toBe(404);
  });
});
