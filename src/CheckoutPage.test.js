import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutPage from "./CheckoutPage.vue";
import { createOrder } from "./data/orders.js";

vi.mock("./data/orders.js", () => ({ createOrder: vi.fn(), createMobileMoneyPayment: vi.fn(), reportOrderPaid: vi.fn() }));
vi.mock("./utils/checkout.ts", async (original) => ({ ...await original(), VITE_MOBILE_MONEY_API_ENABLED: false }));

const paymentUrl = "https://payment.example/checkout?amount=13000";
function pageForTest() {
  const page = {
    ...CheckoutPage.data(), $t: (key) => key,
    cartItems: [{ key: "camo:L", title: "CAMO", price: 13000, qty: 1, selectedSize: "L" }],
    cartTotal: 13000, isFormValid: true, selectedShipping: { id: "test", label: "Abidjan", fee: 1000 },
    shippingFee: 1000, totalWithShipping: 14000, preorderFulfillment: {},
    currentManualPaymentMethod: { id: "wave", label: "Wave", launchUrl: paymentUrl, apiProvider: "wave" },
  };
  for (const [name, method] of Object.entries(CheckoutPage.methods)) page[name] = method.bind(page);
  page.buildOrderMessage = vi.fn(() => "Test order");
  return page;
}

describe("checkout payment handoff", () => {
  let popup;
  beforeEach(() => {
    vi.clearAllMocks();
    popup = { closed: false, location: { href: "about:blank" }, close: vi.fn() };
    vi.stubGlobal("window", { open: vi.fn(() => popup) });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("waits for the saved order before sending the customer to payment", async () => {
    let complete;
    createOrder.mockReturnValue(new Promise(resolve => { complete = resolve; }));
    const page = pageForTest();
    const sending = page.sendOrder();
    expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
    expect(popup.location.href).toBe("about:blank");
    complete({ id: "NG-TEST", paymentToken: "test-token", subtotal: 13000 });
    await sending;
    expect(popup.location.href).toBe(paymentUrl);
    expect(page.lastOrderId).toBe("NG-TEST");
    expect(page.orderSent).toBe(true);
  });

  it("closes the placeholder and keeps the order form when saving fails", async () => {
    createOrder.mockRejectedValue(new Error("Service unavailable"));
    const page = pageForTest(); await page.sendOrder();
    expect(popup.location.href).toBe("about:blank");
    expect(popup.close).toHaveBeenCalledOnce();
    expect(page.orderSent).toBe(false);
    expect(page.error).toBe("Service unavailable");
    expect(page.isSubmitting).toBe(false);
  });

});
