import products from "../src/data/products.json" with { type: "json" };
import studio from "../src/data/studioMockups.json" with { type: "json" };
import shippingOptions from "../src/data/shipping.json" with { type: "json" };
// Short-lived, bounded in-memory abuse protection. Cloudflare uses this inside
// the single OrdersStore instance; process restarts reset counters.
export const guardedRoute = (method, path) => method === 'POST' && (
  ['/api/admin/login', '/api/studio/login', '/api/orders', '/api/newsletter/subscribe', '/api/lab-applications'].includes(path) ||
  /^\/api\/orders\/[^/]+\/(report-payment|geniuspay-payment|mobile-money-payment)$/.test(path)
);
export function createRateLimiter({ limit = 10, windowMs = 60000, maxEntries = 5000 } = {}) {
  const entries = new Map();
  return (key, now = Date.now()) => {
    for (const [id, value] of entries) if (value.until <= now) entries.delete(id);
    const current = entries.get(key);
    if (current) {
      if (current.count >= limit) return false;
      current.count += 1;
      return true;
    }
    if (entries.size >= maxEntries) return false;
    entries.set(key, { count: 1, until: now + windowMs });
    return true;
  };
}
export function validateCustomerContact(customer) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new Error('Email address is invalid.');
  if (!/^[+\d\s().-]+$/.test(customer.phone) || !/^\d{8,15}$/.test(customer.phone.replace(/\D/g, ''))) throw new Error('Phone number is invalid.');
}
export function validateItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw new Error('Invalid number of order items.');
  for (const item of items) {
    if (!item || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 100 || !Number.isSafeInteger(item.price) || item.price <= 0 || item.price > 10000000) throw new Error('Invalid item quantity or price.');
  }
}

export function validateOrderCatalog(draft) {
  validateItems(draft.items);
  for (const item of draft.items) {
    if (item.isCustomStudio) {
      const template = studio.templates.find(entry => `Custom ${entry.label}` === item.title);
      if (!template || item.price !== 15000) throw new Error('Invalid Studio product or price.');
    } else {
      const product = products.find(entry => entry.title === item.title);
      if (!product || product.soldOut || product.price !== item.price) throw new Error('Product unavailable or price changed. Refresh your cart.');
      if (product.sizes?.length && !product.sizes.includes(item.selectedSize)) throw new Error('Invalid product size.');
    }
  }
  const shipping = shippingOptions.find(entry => entry.id === draft.shipping?.id);
  if (!shipping || shipping.fee !== draft.shipping.fee) throw new Error('Invalid delivery option or fee.');
}
