import { describe, expect, it } from "vitest";
import {
  calculateCartCount,
  calculateCartTotal,
  createCartItemKey,
} from "./cart.js";

describe("cart helpers", () => {
  it("builds a stable item key from product options", () => {
    expect(
      createCartItemKey({
        id: "tee-01",
        selectedColor: "Black",
        selectedSize: "L",
      })
    ).toBe("tee-01-Black-L");
  });

  it("falls back to the provided key when product data is missing", () => {
    expect(createCartItemKey(null, "item-1")).toBe("item-1");
  });

  it("calculates total quantity across cart items", () => {
    expect(
      calculateCartCount([
        { qty: 1 },
        { qty: 3 },
        { qty: 2 },
      ])
    ).toBe(6);
  });

  it("calculates the cart total from price and quantity", () => {
    expect(
      calculateCartTotal([
        { qty: 2, price: 12000 },
        { qty: 1, price: 18500 },
      ])
    ).toBe(42500);
  });
});
