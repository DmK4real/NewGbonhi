import fs from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const ENV_FILE = path.join(ROOT_DIR, ".env");
const ORDERS_FILE = path.join(__dirname, "orders.json");
const AUDIT_LOG_FILE = path.join(__dirname, "orders.audit.log");
const STATUS_VALUES = new Set(["sent", "paid_reported", "paid", "delivered"]);
const DEFAULT_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

loadEnvFile(ENV_FILE);

const configuredPort = Number(process.env.API_PORT);
const API_PORT =
  Number.isFinite(configuredPort) && configuredPort > 0 ? configuredPort : 8787;

const configuredTtl = Number(process.env.ADMIN_TOKEN_TTL_MS);
const TOKEN_TTL_MS =
  Number.isFinite(configuredTtl) && configuredTtl > 0
    ? configuredTtl
    : 1000 * 60 * 60 * 8;

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || "";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "";
const JWT_SECRET = ADMIN_JWT_SECRET || ADMIN_PASSWORD;
let writeLock = Promise.resolve();

logConfigWarnings();

const respondJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, DEFAULT_HEADERS);
  res.end(JSON.stringify(payload));
};

const respondNoContent = (res) => {
  res.writeHead(204, DEFAULT_HEADERS);
  res.end();
};

const safeString = (value, maxLength = 120) =>
  String(value || "").trim().slice(0, maxLength);

const safeInteger = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.round(parsed));
};

const toBase64Url = (value) => Buffer.from(value).toString("base64url");

const fromBase64UrlJson = (value) => {
  try {
    return JSON.parse(Buffer.from(String(value || ""), "base64url").toString("utf8"));
  } catch (error) {
    return null;
  }
};

const signJwt = (payload, secret) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");
  return `${signingInput}.${signature}`;
};

const verifyJwt = (token, secret) => {
  if (!secret || !token) {
    return null;
  }

  const parts = String(token).split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, providedSignature] = parts;
  const header = fromBase64UrlJson(encodedHeader);
  if (!header || header.alg !== "HS256" || header.typ !== "JWT") {
    return null;
  }

  const payload = fromBase64UrlJson(encodedPayload);
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");

  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(String(providedSignature || ""));
  if (expectedBuffer.length !== providedBuffer.length) {
    return null;
  }
  if (!timingSafeEqual(expectedBuffer, providedBuffer)) {
    return null;
  }

  const expiresAt = Number(payload.exp);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
};

const toApiPathname = (pathname) => {
  const cleaned = String(pathname || "").replace(/\/+$/, "") || "/";
  if (cleaned === "/" || cleaned.startsWith("/api")) {
    return cleaned;
  }
  return `/api${cleaned}`;
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", (error) => reject(error));
  });

const parseStoredOrders = (raw) => {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const ensureOrdersFile = async () => {
  if (!fs.existsSync(ORDERS_FILE)) {
    await fsp.writeFile(ORDERS_FILE, "[]\n", "utf8");
  }
};

const readOrders = async () => {
  await ensureOrdersFile();
  const raw = await fsp.readFile(ORDERS_FILE, "utf8");
  return parseStoredOrders(raw);
};

const writeOrders = async (orders) => {
  await fsp.writeFile(ORDERS_FILE, `${JSON.stringify(orders, null, 2)}\n`, "utf8");
};

const withWriteLock = async (work) => {
  const run = writeLock.then(work, work);
  writeLock = run.catch(() => {});
  return run;
};

const buildOrderId = () => {
  const now = new Date();
  const stamp = String(now.getFullYear());
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NG-${stamp}-${rand}`;
};

const appendAuditLog = async (entry) => {
  const payload = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  try {
    await fsp.appendFile(AUDIT_LOG_FILE, `${JSON.stringify(payload)}\n`, "utf8");
  } catch (error) {
    console.warn("[audit] unable to write audit log entry");
  }
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

  const normalized = items.map((item, index) => {
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

  return normalized;
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

const extractBearerToken = (req) => {
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    return "";
  }
  return authorization.slice("Bearer ".length).trim();
};

const isAuthorized = (req) => {
  const token = extractBearerToken(req);
  return Boolean(verifyJwt(token, JWT_SECRET));
};

const passwordsMatch = (providedPassword) => {
  const expected = Buffer.from(String(ADMIN_PASSWORD));
  const provided = Buffer.from(String(providedPassword || ""));
  if (expected.length === 0 || expected.length !== provided.length) {
    return false;
  }
  return timingSafeEqual(expected, provided);
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

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const lines = source.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    if (process.env[key] !== undefined) {
      continue;
    }

    let value = match[2] || "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function logConfigWarnings() {
  if (!ADMIN_PASSWORD) {
    console.warn(
      "[config] ADMIN_PASSWORD is not configured. Admin login will be unavailable."
    );
  } else if (!process.env.ADMIN_PASSWORD && process.env.VITE_ADMIN_PASSWORD) {
    console.warn(
      "[config] Using deprecated VITE_ADMIN_PASSWORD fallback for the API. Set ADMIN_PASSWORD instead."
    );
  }

  if (!ADMIN_JWT_SECRET) {
    console.warn(
      "[config] ADMIN_JWT_SECRET is not configured. Falling back to ADMIN_PASSWORD for JWT signing. Set ADMIN_JWT_SECRET for stronger key separation."
    );
  }
}

const server = createServer(async (req, res) => {
  const method = req.method || "GET";
  const url = new URL(req.url || "/", "http://localhost");
  const pathname = toApiPathname(url.pathname);

  if (method === "OPTIONS") {
    respondNoContent(res);
    return;
  }

  try {
    if (method === "GET" && pathname === "/api/health") {
      respondJson(res, 200, { ok: true });
      return;
    }

    if (method === "POST" && pathname === "/api/admin/login") {
      if (!ADMIN_PASSWORD) {
        respondJson(res, 500, { error: "Admin password is not configured." });
        return;
      }
      if (!JWT_SECRET) {
        respondJson(res, 500, { error: "Admin JWT secret is not configured." });
        return;
      }

      const payload = await readJsonBody(req);
      if (!passwordsMatch(payload.password)) {
        respondJson(res, 401, { error: "Incorrect password." });
        return;
      }

      const expiresAt = Date.now() + TOKEN_TTL_MS;
      const token = signJwt(
        {
          sub: "newgbonhi-admin",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(expiresAt / 1000),
        },
        JWT_SECRET
      );
      respondJson(res, 200, { token, expiresAt });
      return;
    }

    if (method === "POST" && pathname === "/api/orders") {
      const payload = await readJsonBody(req);
      const order = buildOrderFromDraft(payload);

      await withWriteLock(async () => {
        const orders = await readOrders();
        orders.unshift(order);
        await writeOrders(orders);
      });

      respondJson(res, 201, { order });
      return;
    }

    if (method === "POST" && pathname.match(/^\/api\/orders\/[^/]+\/report-payment$/)) {
      const orderId = parseOrderIdFromPath(pathname, "report-payment");
      if (!orderId) {
        respondJson(res, 400, { error: "Order id is missing." });
        return;
      }

      const result = await withWriteLock(async () => {
        const orders = await readOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
          return null;
        }
        const previousStatus = order.status;
        if (previousStatus === "sent") {
          order.status = "paid_reported";
          await writeOrders(orders);
          await appendAuditLog({
            orderId,
            previousStatus,
            nextStatus: order.status,
            actor: "customer",
            source: "report-payment",
          });
        }
        return order;
      });

      if (!result) {
        respondJson(res, 404, { error: "Order not found." });
        return;
      }

      respondJson(res, 200, { order: result });
      return;
    }

    if (method === "GET" && pathname === "/api/orders") {
      if (!isAuthorized(req)) {
        respondJson(res, 401, { error: "Unauthorized." });
        return;
      }
      const orders = await readOrders();
      respondJson(res, 200, { orders });
      return;
    }

    if (method === "PATCH" && pathname.match(/^\/api\/orders\/[^/]+\/status$/)) {
      if (!isAuthorized(req)) {
        respondJson(res, 401, { error: "Unauthorized." });
        return;
      }

      const orderId = parseOrderIdFromPath(pathname, "status");
      if (!orderId) {
        respondJson(res, 400, { error: "Order id is missing." });
        return;
      }

      const payload = await readJsonBody(req);
      const status = safeString(payload.status, 32);
      if (!STATUS_VALUES.has(status)) {
        respondJson(res, 400, { error: "Invalid status value." });
        return;
      }

      const updatedOrders = await withWriteLock(async () => {
        const orders = await readOrders();
        const index = orders.findIndex((entry) => entry.id === orderId);
        if (index < 0) {
          return null;
        }
        const previousStatus = orders[index].status;
        orders[index] = { ...orders[index], status };
        await writeOrders(orders);
        if (previousStatus !== status) {
          await appendAuditLog({
            orderId,
            previousStatus,
            nextStatus: status,
            actor: "admin",
            source: "admin-status-update",
          });
        }
        return orders;
      });

      if (!updatedOrders) {
        respondJson(res, 404, { error: "Order not found." });
        return;
      }

      respondJson(res, 200, { orders: updatedOrders });
      return;
    }

    if (method === "DELETE" && pathname.match(/^\/api\/orders\/[^/]+$/)) {
      if (!isAuthorized(req)) {
        respondJson(res, 401, { error: "Unauthorized." });
        return;
      }

      const orderId = parseOrderIdFromPath(pathname);
      if (!orderId) {
        respondJson(res, 400, { error: "Order id is missing." });
        return;
      }

      const updatedOrders = await withWriteLock(async () => {
        const orders = await readOrders();
        const next = orders.filter((entry) => entry.id !== orderId);
        if (next.length === orders.length) {
          return null;
        }
        await writeOrders(next);
        return next;
      });

      if (!updatedOrders) {
        respondJson(res, 404, { error: "Order not found." });
        return;
      }

      respondJson(res, 200, { orders: updatedOrders });
      return;
    }

    respondJson(res, 404, { error: "Route not found." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    respondJson(res, 400, { error: message });
  }
});

ensureOrdersFile()
  .then(() => {
    server.listen(API_PORT, () => {
      console.log(`[api] listening on http://localhost:${API_PORT}`);
    });
  })
  .catch((error) => {
    const message =
      error instanceof Error ? error.message : "Unable to initialize API server.";
    console.error(`[api] ${message}`);
    process.exit(1);
  });
