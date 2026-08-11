import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const checkoutEnvKeys = [
  "VITE_WHATSAPP_NUMBER",
  "VITE_CONTACT_EMAIL",
  "VITE_MOMO_WAVE",
  "VITE_MOMO_ORANGE",
  "VITE_MOMO_MTN",
  "VITE_MOMO_MOOV",
  "VITE_MOMO_ADDITIONAL",
  "VITE_PAYMENT_NOTE",
];

describe("checkout utilities", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    checkoutEnvKeys.forEach((key) => {
      vi.stubEnv(key, "");
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds an order id with the expected prefix and length", async () => {
    const { buildOrderId } = await import("./checkout.ts");
    expect(buildOrderId()).toMatch(/^NG-\d{4}-\d{4}$/);
  });

  it("normalizes phone numbers to digits only", async () => {
    const { normalizeNumber } = await import("./checkout.ts");
    expect(normalizeNumber("+225 07 11 11 56 86")).toBe("2250711115686");
  });

  it("validates complete customer details", async () => {
    const { isValidCustomer } = await import("./checkout.ts");
    const customer = {
      firstName: "Kouadio",
      lastName: "Bhegnino",
      email: "test@example.com",
      phone: "+225 07 11 11 56 86",
      address: "Cocody Angre",
      city: "Abidjan",
      zip: "00225",
    };

    expect(isValidCustomer(customer)).toBe(true);
    expect(isValidCustomer({ ...customer, email: "test@" })).toBe(false);
    expect(isValidCustomer({ ...customer, phone: "123" })).toBe(false);
    expect(isValidCustomer({ ...customer, zip: "" })).toBe(false);
  });

  it("builds a preorder WhatsApp confirmation message with default payment numbers", async () => {
    const { buildOrderMessage } = await import("./checkout.ts");
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
    expect(message).toContain("*NewGbonhi Preorder Summary*");
    expect(message).toMatch(
      /Delivery: Cocody \(2[\s\u202f]000 FCFA\) - Window: 48\/72h after payment confirmation/
    );
    expect(message).toContain("Production starts after payment confirmation.");
    expect(message).toContain("Please pay the item amount via Mobile Money");
    expect(message).toContain("- Wave: 07 89 53 83 88");
    expect(message).toContain("- Orange: 07 89 53 83 88");
    expect(message).toContain("- MTN: 05 04 31 53 31");
    expect(message).toMatch(/BLACK CAMELEON \(M\) x2 = 30[\s\u202f]000 FCFA/);
    expect(message).toContain("Thank you for your preorder!");
  });
});
