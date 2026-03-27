const STATUS_VALUES = new Set(["sent", "paid_reported", "paid", "delivered"]);
const DEFAULT_TOKEN_TTL_MS = 1000 * 60 * 60 * 8;
const ORDERS_KEY = "orders.v1";
const SESSIONS_KEY = "sessions.v1";

const baseHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "Content-Type, Authorization",
  "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

const json = (status, payload) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: baseHeaders,
  });

const noContent = () =>
  new Response(null, {
    status: 204,
    headers: baseHeaders,
  });

const safeString = (value, maxLength = 120) =>
  String(value || "").trim().slice(0, maxLength);

const safeInteger = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.round(parsed));
};

const normalizePathname = (pathname) => pathname.replace(/\/+$/, "") || "/";
const toApiPathname = (pathname) => {
  const cleaned = normalizePathname(pathname);
  if (cleaned === "/" || cleaned.startsWith("/api")) {
    return cleaned;
  }
  return `/api${cleaned}`;
};

const parseOrderIdFromPath = (pathname, suffix = "") => {
  const escapedSuffix = suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `^/api/orders/([^/]+)${escapedSuffix ? `/${escapedSuffix}` : ""}$`
  );
  const match = pathname.match(regex);
  if (!match || !match[1]) {
    return "";
  }
  return decodeURIComponent(match[1]);
};

const buildOrderId = () => {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NG-${stamp}-${rand}`;
};

const normalizeCustomer = (customer) => {
  if (!customer || typeof customer !== "object") {
    throw new Error("Customer details are required.");
  }

  const normalized = {
    firstName: safeString(customer.firstName, 80),
    lastName: safeString(customer.lastName, 80),
    email: safeString(customer.email, 140),
    phone: safeString(customer.phone, 40),
    address: safeString(customer.address, 180),
    city: safeString(customer.city, 80),
    zip: safeString(customer.zip, 24),
  };

  if (
    !normalized.firstName ||
    !normalized.lastName ||
    !normalized.email ||
    !normalized.phone ||
    !normalized.address ||
    !normalized.city
  ) {
    throw new Error("Customer details are incomplete.");
  }

  return normalized;
};

const normalizeItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order items are required.");
  }

  return items.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid order item at index ${index}.`);
    }

    const title = safeString(item.title, 160);
    if (!title) {
      throw new Error(`Item title is missing at index ${index}.`);
    }

    const qty = Math.max(1, safeInteger(item.qty, 1));
    const price = safeInteger(item.price, 0);

    return {
      key: safeString(item.key, 140) || `${title}-${index}`,
      title,
      qty,
      price,
      selectedSize: safeString(item.selectedSize, 32) || null,
    };
  });
};

const normalizeShipping = (shipping) => {
  if (!shipping || typeof shipping !== "object") {
    throw new Error("Shipping option is required.");
  }

  return {
    id: safeString(shipping.id, 32) || "custom",
    label: safeString(shipping.label, 80) || "Delivery",
    fee: safeInteger(shipping.fee, 0),
  };
};

const buildOrderFromDraft = (draft) => {
  if (!draft || typeof draft !== "object") {
    throw new Error("Order payload is missing.");
  }

  const customer = normalizeCustomer(draft.customer);
  const items = normalizeItems(draft.items);
  const shipping = normalizeShipping(draft.shipping);
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = subtotal + shipping.fee;

  return {
    id: buildOrderId(),
    status: "sent",
    createdAt: new Date().toISOString(),
    customer,
    items,
    subtotal,
    shipping,
    total,
  };
};

const extractBearerToken = (request) => {
  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return "";
  }
  return authorization.slice("Bearer ".length).trim();
};

const constantTimeEqual = (left, right) => {
  const a = String(left || "");
  const b = String(right || "");
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

const parseJsonBody = async (request) => {
  try {
    return await request.json();
  } catch (error) {
    throw new Error("Invalid JSON body.");
  }
};

export class OrdersStore {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  get tokenTtlMs() {
    const value = Number(this.env.TOKEN_TTL_MS);
    if (!Number.isFinite(value) || value <= 0) {
      return DEFAULT_TOKEN_TTL_MS;
    }
    return value;
  }

  get adminPassword() {
    return this.env.ADMIN_PASSWORD || this.env.VITE_ADMIN_PASSWORD || "";
  }

  async loadOrders() {
    const orders = await this.state.storage.get(ORDERS_KEY);
    return Array.isArray(orders) ? orders : [];
  }

  async saveOrders(orders) {
    await this.state.storage.put(ORDERS_KEY, orders);
  }

  async loadSessions() {
    const sessions = await this.state.storage.get(SESSIONS_KEY);
    if (!sessions || typeof sessions !== "object" || Array.isArray(sessions)) {
      return {};
    }
    return sessions;
  }

  async saveSessions(sessions) {
    await this.state.storage.put(SESSIONS_KEY, sessions);
  }

  async cleanupSessions() {
    const sessions = await this.loadSessions();
    const now = Date.now();
    let changed = false;

    for (const token of Object.keys(sessions)) {
      if (!Number.isFinite(sessions[token]) || sessions[token] <= now) {
        delete sessions[token];
        changed = true;
      }
    }

    if (changed) {
      await this.saveSessions(sessions);
    }

    return sessions;
  }

  async isAuthorized(request) {
    const token = extractBearerToken(request);
    if (!token) {
      return false;
    }

    const sessions = await this.cleanupSessions();
    const expiresAt = sessions[token];
    if (!Number.isFinite(expiresAt)) {
      return false;
    }
    return expiresAt > Date.now();
  }

  async fetch(request) {
    const method = request.method || "GET";
    const url = new URL(request.url);
    const pathname = toApiPathname(url.pathname);

    if (method === "OPTIONS") {
      return noContent();
    }

    try {
      if (method === "GET" && pathname === "/api/health") {
        return json(200, { ok: true });
      }

      if (method === "POST" && pathname === "/api/admin/login") {
        if (!this.adminPassword) {
          return json(500, { error: "Admin password is not configured." });
        }

        const payload = await parseJsonBody(request);
        if (!constantTimeEqual(payload.password, this.adminPassword)) {
          return json(401, { error: "Incorrect password." });
        }

        const token = crypto.randomUUID();
        const expiresAt = Date.now() + this.tokenTtlMs;
        const sessions = await this.cleanupSessions();
        sessions[token] = expiresAt;
        await this.saveSessions(sessions);
        return json(200, { token, expiresAt });
      }

      if (method === "POST" && pathname === "/api/orders") {
        const payload = await parseJsonBody(request);
        const order = buildOrderFromDraft(payload);
        const orders = await this.loadOrders();
        orders.unshift(order);
        await this.saveOrders(orders);
        return json(201, { order });
      }

      if (
        method === "POST" &&
        pathname.match(/^\/api\/orders\/[^/]+\/report-payment$/)
      ) {
        const orderId = parseOrderIdFromPath(pathname, "report-payment");
        if (!orderId) {
          return json(400, { error: "Order id is missing." });
        }

        const orders = await this.loadOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
          return json(404, { error: "Order not found." });
        }

        if (order.status === "sent") {
          order.status = "paid_reported";
          await this.saveOrders(orders);
        }

        return json(200, { order });
      }

      if (method === "GET" && pathname === "/api/orders") {
        if (!(await this.isAuthorized(request))) {
          return json(401, { error: "Unauthorized." });
        }
        const orders = await this.loadOrders();
        return json(200, { orders });
      }

      if (method === "PATCH" && pathname.match(/^\/api\/orders\/[^/]+\/status$/)) {
        if (!(await this.isAuthorized(request))) {
          return json(401, { error: "Unauthorized." });
        }

        const orderId = parseOrderIdFromPath(pathname, "status");
        if (!orderId) {
          return json(400, { error: "Order id is missing." });
        }

        const payload = await parseJsonBody(request);
        const status = safeString(payload.status, 32);
        if (!STATUS_VALUES.has(status)) {
          return json(400, { error: "Invalid status value." });
        }

        const orders = await this.loadOrders();
        const index = orders.findIndex((entry) => entry.id === orderId);
        if (index < 0) {
          return json(404, { error: "Order not found." });
        }

        orders[index] = { ...orders[index], status };
        await this.saveOrders(orders);
        return json(200, { orders });
      }

      if (method === "DELETE" && pathname.match(/^\/api\/orders\/[^/]+$/)) {
        if (!(await this.isAuthorized(request))) {
          return json(401, { error: "Unauthorized." });
        }

        const orderId = parseOrderIdFromPath(pathname);
        if (!orderId) {
          return json(400, { error: "Order id is missing." });
        }

        const orders = await this.loadOrders();
        const nextOrders = orders.filter((entry) => entry.id !== orderId);
        if (nextOrders.length === orders.length) {
          return json(404, { error: "Order not found." });
        }

        await this.saveOrders(nextOrders);
        return json(200, { orders: nextOrders });
      }

      return json(404, { error: "Route not found." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected server error.";
      return json(400, { error: message });
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = toApiPathname(url.pathname);

    if (pathname === "/") {
      return json(404, { error: "Route not found." });
    }

    const id = env.ORDERS_STORE.idFromName("global");
    const stub = env.ORDERS_STORE.get(id);
    return stub.fetch(request);
  },
};
