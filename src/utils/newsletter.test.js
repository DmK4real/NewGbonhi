import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeToNewsletter } from "./newsletter.js";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe("newsletter signup", () => {
  it("uses the existing subscription API and keeps the existing-subscriber result", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, welcomeSent: false }) });
    vi.stubGlobal("fetch", fetch);
    await expect(subscribeToNewsletter(" Person@Example.COM ")).resolves.toEqual({ ok: true, welcomeSent: false });
    expect(fetch.mock.calls[0][0]).toBe("/api/newsletter/subscribe");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ email: "person@example.com", website: "" });
  });
  it("does not confirm an HTTP failure or an unconfirmed response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, json: async () => ({ ok: false }) }));
    await expect(subscribeToNewsletter("person@example.com")).rejects.toThrow();
    await expect(subscribeToNewsletter("person@example.com")).rejects.toThrow();
  });
  it("aborts a stalled signup instead of leaving the form busy forever", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    })));
    const result = expect(subscribeToNewsletter("person@example.com")).rejects.toThrow("Aborted");
    await vi.advanceTimersByTimeAsync(15000);
    await result;
  });
});
