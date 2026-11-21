import { describe, expect, it, vi } from "vitest";
import { createPreviewFetch } from "./preview.js";

const settings = { apiBase: "https://newgbonhi.com/api", pageUrl: "https://preview.example/#/" };

describe("team preview API boundary", () => {
  it("does not send orders, payments, subscriptions or admin changes to the real API", async () => {
    const upstream = vi.fn();
    const fetch = createPreviewFetch(upstream, settings);
    for (const [url, method] of [
      ["https://newgbonhi.com/api/orders", "POST"],
      ["https://newgbonhi.com/api/orders/example/report-payment", "POST"],
      ["https://newgbonhi.com/api/newsletter/subscribe", "POST"],
      ["https://newgbonhi.com/api/lab-applications", "POST"],
      ["https://newgbonhi.com/api/orders/example/status", "PATCH"],
      ["/api/orders/example", "DELETE"],
    ]) {
      const response = await fetch(url, { method, body: "{}" });
      expect(response.status).toBe(403);
      expect((await response.json()).error).toContain("Version de test");
    }
    expect(upstream).not.toHaveBeenCalled();
  });

  it("also checks Request methods and respects explicit method overrides", async () => {
    const upstream = vi.fn().mockResolvedValue(new Response("ok"));
    const fetch = createPreviewFetch(upstream, settings);
    const input = new Request("https://newgbonhi.com/api/orders", { method: "POST", body: "{}" });
    expect((await fetch(input)).status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();
    await fetch(input, { method: "GET" });
    expect(upstream).toHaveBeenCalledWith(input, { method: "GET" });
  });

  it("still loads read-only API content and static assets", async () => {
    const upstream = vi.fn().mockResolvedValue(new Response("ok"));
    const fetch = createPreviewFetch(upstream, settings);
    await fetch("https://newgbonhi.com/api/faces/portraits");
    await fetch("/assets/product.webp");
    expect(upstream).toHaveBeenCalledTimes(2);
  });
});
