import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ native: vi.fn(), browser: vi.fn(), launcher: vi.fn(), clipboard: vi.fn(), share: vi.fn() }));
vi.mock("./platform.js", () => ({ isNativePlatform: mocks.native }));
vi.mock("@capacitor/browser", () => ({ Browser: { open: mocks.browser } }));
vi.mock("@capacitor/app-launcher", () => ({ AppLauncher: { openUrl: mocks.launcher } }));
vi.mock("@capacitor/clipboard", () => ({ Clipboard: { write: mocks.clipboard } }));
vi.mock("@capacitor/share", () => ({ Share: { share: mocks.share } }));
import { openExternalUrl, copyText, shareContent } from "./actions.js";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.native.mockReturnValue(true);
  mocks.launcher.mockResolvedValue({ completed: true });
});
afterEach(() => vi.unstubAllGlobals());
describe("native actions", () => {
  it("opens payment HTTPS pages with the native browser", async () => {
    await expect(openExternalUrl("https://pay.wave.com/checkout")).resolves.toBe(true);
    expect(mocks.browser).toHaveBeenCalledWith(expect.objectContaining({ url: "https://pay.wave.com/checkout" }));
  });
  it("hands WhatsApp to the operating system", async () => {
    await openExternalUrl("https://wa.me/2250700000000");
    expect(mocks.launcher).toHaveBeenCalledWith({ url: "https://wa.me/2250700000000" });
    expect(mocks.browser).not.toHaveBeenCalled();
  });
  it.each(["javascript:alert(1)", "http://example.test", "file:///etc/passwd", "https://user:pass@example.test"])('rejects unsafe external link %s', async url => {
    await expect(openExternalUrl(url)).rejects.toThrow();
    expect(mocks.browser).not.toHaveBeenCalled();
    expect(mocks.launcher).not.toHaveBeenCalled();
  });
  it("reports failed app handoffs", async () => {
    mocks.launcher.mockResolvedValue({ completed: false });
    await expect(openExternalUrl("tel:+2250700000000")).rejects.toThrow();
  });
  it("uses native clipboard and sharing APIs", async () => {
    await copyText("NG-123");
    expect(mocks.clipboard).toHaveBeenCalledWith({ string: "NG-123" });
    const content = { title: "FACES", url: "https://newgbonhi.com/faces" };
    await expect(shareContent(content)).resolves.toBe(true);
    expect(mocks.share).toHaveBeenCalledWith(content);
  });
  it("keeps browser copy and share fallback", async () => {
    mocks.native.mockReturnValue(false);
    const writeText = vi.fn();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    await expect(shareContent({ url: "https://newgbonhi.com/faces" })).resolves.toBe(false);
    expect(writeText).toHaveBeenCalledWith("https://newgbonhi.com/faces");
  });
});
