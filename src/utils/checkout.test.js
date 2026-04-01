import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("checkout utilities", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds an order id with the expected prefix and length", async () => {
    const { buildOrderId } = await import("./checkout.js");
    expect(buildOrderId()).toMatch(/^NG-\d{6}$/);
  });

  it("normalizes phone numbers to digits only", async () => {
    const { normalizeNumber } = await import("./checkout.js");
    expect(normalizeNumber("+225 07 11 11 56 86")).toBe("2250711115686");
  });

  it("falls back to a WhatsApp confirmation message when no payment env is set", async () => {
    const { buildOrderMessage } = await import("./checkout.js");
    const message = buildOrderMessage({
      orderId: "NG-123456",
      customer: {
        firstName: "Kouadio",
        lastName: "Bhegnino",
        email: "test@example.com",
        phone: "0711115686",
        address: "Cocody Angre",
        city: "Abidjan",
      },
      cartItems: [{ title: "BLACK CAMELEON", qty: 2, price: 15000, selectedSize: "M" }],
      selectedShipping: {
        label: "Cocody",
        eta: "45 to 75 min",
      },
      shippingFee: 2000,
      totalWithShipping: 32000,
    });

    expect(message).toContain("Order ID: NG-123456");
    expect(message).toMatch(/Delivery: Cocody \(2[\s\u202f]000 FCFA\) - ETA: 45 to 75 min/);
    expect(message).toContain("Payment details will be confirmed on WhatsApp.");
    expect(message).toMatch(/BLACK CAMELEON \(M\) x2 = 30[\s\u202f]000 FCFA/);
  });
});
