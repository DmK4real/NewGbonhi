import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { app, router, reportAppError } = vi.hoisted(() => ({
  app: {
    config: { globalProperties: {} },
    component: vi.fn(),
    use: vi.fn(),
    mount: vi.fn(),
  },
  router: { isReady: vi.fn(), onError: vi.fn(), afterEach: vi.fn() },
  reportAppError: vi.fn(),
}));

vi.mock("vue", () => ({ createApp: () => app }));
vi.mock("./App.vue", () => ({ default: {} }));
vi.mock("./router.js", () => ({ default: router }));
vi.mock("./i18n.js", () => ({ i18nState: {}, setLanguage: vi.fn(), translate: vi.fn() }));
vi.mock("./components/LanguageSwitch.vue", () => ({ default: {} }));
vi.mock("./components/PaymentMethods.vue", () => ({ default: {} }));
vi.mock("./components/SiteFooter.vue", () => ({ default: {} }));
vi.mock("./utils/appError.js", () => ({ reportAppError }));

describe("initial application navigation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal("window", { addEventListener: vi.fn() });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("mounts once only after the initial route is ready", async () => {
    let resolve;
    router.isReady.mockReturnValue(new Promise((done) => { resolve = done; }));
    await import("./main.js");
    expect(app.use).toHaveBeenCalledWith(router);
    expect(app.mount).not.toHaveBeenCalled();
    resolve();
    await Promise.resolve();
    expect(app.mount).toHaveBeenCalledExactlyOnceWith("#app");
  });

  it("still mounts the reported error screen if the initial route fails", async () => {
    let reject;
    router.isReady.mockReturnValue(new Promise((resolve, fail) => { reject = fail; }));
    await import("./main.js");
    const error = new Error("Initial route unavailable");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    router.onError.mock.calls[0][0](error);
    reject(error);
    await Promise.resolve();
    expect(reportAppError).toHaveBeenCalledWith(error, expect.objectContaining({ source: "router" }));
    expect(app.mount).toHaveBeenCalledExactlyOnceWith("#app");
    log.mockRestore();
  });
});
