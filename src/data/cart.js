import { reactive, computed } from "vue";

const state = reactive({
  items: [],
});

const getItemKey = (product) =>
  product?.id ?? product?.slug ?? product?.title ?? `item-${state.items.length + 1}`;

const cartCount = computed(() =>
  state.items.reduce((total, item) => total + item.qty, 0)
);

const cartTotal = computed(() =>
  state.items.reduce((total, item) => total + item.qty * item.price, 0)
);

const addToCart = (product) => {
  if (!product || product.soldOut) {
    return;
  }
  const baseKey = getItemKey(product);
  const colorToken = product.selectedColorId || product.selectedColor;
  const sizeToken = product.selectedSize;
  const key = [baseKey, colorToken, sizeToken].filter(Boolean).join("-");
  const existing = state.items.find((item) => item.key === key);
  if (existing) {
    existing.qty += 1;
    return;
  }
  state.items.push({
    key,
    id: product.id ?? null,
    slug: product.slug ?? null,
    title: product.title || "NewGbonhi item",
    price: typeof product.price === "number" ? product.price : 0,
    imagePrimary: product.imagePrimary || "",
    url: product.url || "",
    selectedSize: product.selectedSize || null,
    selectedColor: product.selectedColor || null,
    qty: 1,
  });
};

const removeFromCart = (key) => {
  const index = state.items.findIndex((item) => item.key === key);
  if (index >= 0) {
    state.items.splice(index, 1);
  }
};

const updateQty = (key, qty) => {
  const item = state.items.find((entry) => entry.key === key);
  if (!item) {
    return;
  }
  const nextQty = Math.max(1, Number(qty) || 1);
  item.qty = nextQty;
};

const clearCart = () => {
  state.items.splice(0, state.items.length);
};

export const cartStore = {
  state,
  cartCount,
  cartTotal,
  addToCart,
  removeFromCart,
  updateQty,
  clearCart,
};
