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
    expect(html).toContain('content="https://newgbonhi.com/faces/social-share.jpg"');
    expect(html).toContain('content="https://newgbonhi.com/faces"');
    expect(result.headers.get("Cache-Control")).toContain("no-store");
  });
  it("still returns 404 for an unknown page", async () => {
    const result = await onRequest({ request: new Request("https://newgbonhi.com/not-a-page"), next: async () => new Response("<html></html>", { headers: { "Content-Type": "text/html" } }) });
    expect(result.status).toBe(404);
  });
});
