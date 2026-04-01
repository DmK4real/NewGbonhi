import { reactive, computed, watch } from "vue";

const STORAGE_KEY = "newgbonhi_cart_v1";

const state = reactive({
  items: [],
});

// Persistence logic
const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
};

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        state.items = parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load cart from localStorage", e);
  }
};

// Initialize from storage
loadFromStorage();

// Watch for changes and save
watch(
  () => state.items,
  () => {
    saveToStorage();
  },
  { deep: true }
);

const getItemKey = (product) => {
  if (!product) return `item-${Date.now()}`;
  const base = product.id ?? product.slug ?? product.title;
  const colorToken = product.selectedColorId || product.selectedColor;
  const sizeToken = product.selectedSize;
  return [base, colorToken, sizeToken].filter(Boolean).join("-");
};

const cartCount = computed(() =>
  state.items.reduce((total, item) => total + (item.qty || 0), 0)
);

const cartTotal = computed(() =>
  state.items.reduce((total, item) => total + (item.qty || 0) * (item.price || 0), 0)
);

const addToCart = (product) => {
  if (!product || product.soldOut) {
    return;
  }
  const key = getItemKey(product);
  const existing = state.items.find((item) => item.key === key);

  if (existing) {
    existing.qty += 1;
  } else {
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
  }
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
  state.items = [];
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
