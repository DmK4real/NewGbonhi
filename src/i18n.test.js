import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

describe("language when browser storage is blocked", () => {
  it("starts in the browser language and still allows language changes", async () => {
    vi.resetModules();
    vi.stubGlobal("window", { navigator: { language: "fr-CI" }, get localStorage() { throw new DOMException("Blocked", "SecurityError"); } });
    const { i18nState, setLanguage, translate } = await import("./i18n.js");
    expect(i18nState.language).toBe("fr");
    expect(() => setLanguage("en")).not.toThrow();
    expect(i18nState.language).toBe("en");
    expect(translate("navShop")).toBeTruthy();
  });
});
