import { afterEach, expect, it, vi } from "vitest";
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

it("keeps checkout contact available when a mobile build has no contact override", async () => {
  vi.stubEnv("VITE_WHATSAPP_NUMBER", ""); vi.resetModules();
  const { checkoutConfig, validateFrontendConfig } = await import("./config.js");
  expect(checkoutConfig.whatsappNumber).toBe("002250789538388");
  expect(validateFrontendConfig().missingRequired).toEqual([]);
});

it("honours an explicitly configured checkout contact", async () => {
  vi.stubEnv("VITE_WHATSAPP_NUMBER", "002250100000000"); vi.resetModules();
  const { checkoutConfig } = await import("./config.js");
  expect(checkoutConfig.whatsappNumber).toBe("002250100000000");
});
