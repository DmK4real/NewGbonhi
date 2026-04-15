import { computed, reactive, watch, type ComputedRef } from "vue";

const STORAGE_KEY = "newgbonhi_cart_v1";

export type ProductLike = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  soldOut?: boolean;
  price?: number | null;
  imagePrimary?: string | null;
  url?: string | null;
  selectedSize?: string | null;
  selectedColor?: string | null;
  selectedColorId?: string | null;
};

export type CartItem = {
  key: string;
  id: string | null;
  slug: string | null;
  title: string;
  price: number;
  imagePrimary: string;
  url: string;
  selectedSize: string | null;
  selectedColor: string | null;
  qty: number;
};

type CartState = {
  items: CartItem[];
};

const state = reactive<CartState>({
  items: [],
});

export const createCartItemKey = (
  product: ProductLike | null | undefined,
  fallback = "item"
): string => {
  if (!product) {
    return fallback;
  }
  const base = product.id ?? product.slug ?? product.title ?? fallback;
  const colorToken = product.selectedColorId || product.selectedColor;
  const sizeToken = product.selectedSize;
  return [base, colorToken, sizeToken].filter(Boolean).join("-");
};

export const calculateCartCount = (items: Array<{ qty?: number }> = []): number =>
  items.reduce((total, item) => total + (item.qty || 0), 0);

export const calculateCartTotal = (
  items: Array<{ qty?: number; price?: number }> = []
): number =>
  items.reduce((total, item) => total + (item.qty || 0) * (item.price || 0), 0);

const hasStorage = (): boolean => typeof localStorage !== "undefined";

const normalizeStoredItem = (item: unknown): CartItem | null => {
  if (!item || typeof item !== "object") {
    return null;
  }
  const record = item as Record<string, unknown>;
  const key = String(record.key || "").trim();
  const title = String(record.title || "").trim();
  const qtyValue = Number(record.qty);
  const priceValue = Number(record.price);

  if (!key || !title || !Number.isFinite(qtyValue) || qtyValue <= 0) {
    return null;
  }

  return {
    key,
    id: record.id ? String(record.id) : null,
    slug: record.slug ? String(record.slug) : null,
    title,
    price: Number.isFinite(priceValue) ? Math.max(0, Math.round(priceValue)) : 0,
    imagePrimary: String(record.imagePrimary || ""),
    url: String(record.url || ""),
    selectedSize: record.selectedSize ? String(record.selectedSize) : null,
    selectedColor: record.selectedColor ? String(record.selectedColor) : null,
    qty: Math.max(1, Math.round(qtyValue)),
  };
};

const saveToStorage = (): void => {
  if (!hasStorage()) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  } catch (error) {
    console.error("Failed to save cart to localStorage", error);
  }
};

const loadFromStorage = (): void => {
  if (!hasStorage()) {
    return;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return;
    }
    state.items = parsed
      .map((entry) => normalizeStoredItem(entry))
      .filter((entry): entry is CartItem => Boolean(entry));
  } catch (error) {
    console.error("Failed to load cart from localStorage", error);
  }
};

loadFromStorage();

watch(
  () => state.items,
  () => {
    saveToStorage();
  },
  { deep: true }
);

const cartCount = computed<number>(() => calculateCartCount(state.items));
const cartTotal = computed<number>(() => calculateCartTotal(state.items));

const addToCart = (product: ProductLike | null | undefined): void => {
  if (!product || product.soldOut) {
    return;
  }
  const key = createCartItemKey(product, `item-${state.items.length + 1}`);
  const existing = state.items.find((item) => item.key === key);

  if (existing) {
    existing.qty += 1;
    return;
  }

  state.items.push({
    key,
    id: product.id ? String(product.id) : null,
    slug: product.slug ? String(product.slug) : null,
    title: product.title || "NewGbonhi item",
    price: typeof product.price === "number" ? product.price : 0,
    imagePrimary: product.imagePrimary || "",
    url: product.url || "",
    selectedSize: product.selectedSize || null,
    selectedColor: product.selectedColor || null,
    qty: 1,
  });
};

const removeFromCart = (key: string): void => {
  const index = state.items.findIndex((item) => item.key === key);
  if (index >= 0) {
    state.items.splice(index, 1);
  }
};

const updateQty = (key: string, qty: number): void => {
  const item = state.items.find((entry) => entry.key === key);
  if (!item) {
    return;
  }
  const nextQty = Math.max(1, Number(qty) || 1);
  item.qty = nextQty;
};

const clearCart = (): void => {
  state.items = [];
};

export const cartStore: {
  state: CartState;
  cartCount: ComputedRef<number>;
  cartTotal: ComputedRef<number>;
  addToCart: (product: ProductLike | null | undefined) => void;
  removeFromCart: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clearCart: () => void;
} = {
  state,
  cartCount,
  cartTotal,
  addToCart,
  removeFromCart,
  updateQty,
  clearCart,
};
