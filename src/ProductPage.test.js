import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductPage from "./ProductPage.vue";
import { cartStore } from "./data/cart.ts";

vi.mock("./data/cart.ts", () => ({
  cartStore: { addToCart: vi.fn() },
}));
vi.mock("./utils/seo.js", () => ({ applySeo: vi.fn() }));

const product = {
  id: "camo",
  slug: "camo",
  title: "NewGbonhi CAMO",
  sizes: ["S", "M", "L", "XL"],
  imagePrimary: "/white.png",
  variants: [
    { id: "white", label: "Blanc", imagePrimary: "/white.png" },
    { id: "black", label: "Noir", imagePrimary: "/black.png" },
  ],
};

function createPage(overrides = {}) {
  const page = {
    ...ProductPage.data(),
    product,
    sizeOptions: product.sizes,
    activeVariant: product.variants[1],
    $t: (key) => key,
    $nextTick: (callback) => callback(),
    $refs: { sizePicker: { focus: vi.fn(), scrollIntoView: vi.fn() } },
    ...overrides,
  };
  for (const [name, method] of Object.entries(ProductPage.methods)) {
    page[name] = method.bind(page);
  }
  page.showToast = vi.fn();
  return page;
}

describe("product size selection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires a size and brings the picker into view before adding to cart", () => {
    const page = createPage();
    page.addProductToCart();
    expect(cartStore.addToCart).not.toHaveBeenCalled();
    expect(page.sizeRequired).toBe(true);
    expect(page.$refs.sizePicker.focus).toHaveBeenCalled();
    expect(page.$refs.sizePicker.scrollIntoView).toHaveBeenCalled();
    expect(page.cartOpen).toBe(false);
  });

  it("adds the chosen size and color with their matching image", () => {
    const page = createPage({ sizeRequired: true });
    page.selectSize("L");
    page.addProductToCart();
    expect(page.sizeRequired).toBe(false);
    expect(cartStore.addToCart).toHaveBeenCalledWith(expect.objectContaining({
      selectedSize: "L",
      selectedColorId: "black",
      selectedColor: "Noir",
      imagePrimary: "/black.png",
      preorder: true,
    }));
    expect(page.cartOpen).toBe(true);
    expect(ProductPage.computed.purchaseSelection.call(page)).toBe("Noir / size L");
  });

  it("rejects sizes that are not available on the product", () => {
    const page = createPage();
    page.selectSize("XXXL");
    page.addProductToCart();
    expect(page.selectedSize).toBeNull();
    expect(cartStore.addToCart).not.toHaveBeenCalled();
  });

  it("resets the selection when navigating to another product", () => {
    const page = createPage({ selectedSize: "L", sizeRequired: true });
    ProductPage.watch.product.handler.call(page, product);
    expect(page.selectedSize).toBeNull();
    expect(page.sizeRequired).toBe(false);
    expect(page.selectedColor).toBe("white");
  });

  it("does not add a sold-out product even with a selected size", () => {
    const page = createPage({ product: { ...product, soldOut: true }, selectedSize: "L" });
    page.addProductToCart();
    expect(cartStore.addToCart).not.toHaveBeenCalled();
    expect(page.cartOpen).toBe(false);
  });
});
