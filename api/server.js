import fs from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const ENV_FILE = path.join(ROOT_DIR, ".env");
const ORDERS_FILE = path.join(__dirname, "orders.json");
const AUDIT_LOG_FILE = path.join(__dirname, "orders.audit.log");
const STATUS_VALUES = new Set([
  "sent",
  "paid_reported",
  "paid",
  "production",
  "delivered",
]);
const GENIUSPAY_DEFAULT_BASE_URL = "https://geniuspay.ci/api/v1/merchant";
const GENIUSPAY_WEBHOOK_MAX_AGE_SECONDS = 60 * 5;
const GENIUSPAY_PAYMENT_METHODS = new Set([
  "wave",
  "orange_money",
  "mtn_money",
  "card",
]);
const MOBILE_MONEY_PAYMENT_METHODS = new Set([
  "wave",
  "orange_money",
  "mtn_money",
]);
const WAVE_DEFAULT_BASE_URL = "https://api.wave.com";
const WAVE_DEFAULT_PAYMENT_LINK = "https://pay.wave.com/m/M_ci_cNiKvg4QvKE3/c/ci/";
const DEFAULT_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Webhook-Signature, X-Webhook-Timestamp, X-Webhook-Event, X-Webhook-Delivery, X-Webhook-Environment",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

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
const SITE_URL = trimTrailingSlash(process.env.SITE_URL || "http://localhost:5173");
const GENIUSPAY_BASE_URL = trimTrailingSlash(
  process.env.GENIUSPAY_BASE_URL || GENIUSPAY_DEFAULT_BASE_URL
);
const GENIUSPAY_API_KEY = process.env.GENIUSPAY_API_KEY || "";
const GENIUSPAY_API_SECRET = process.env.GENIUSPAY_API_SECRET || "";
const GENIUSPAY_WEBHOOK_SECRET = process.env.GENIUSPAY_WEBHOOK_SECRET || "";
const GENIUSPAY_SUCCESS_URL =
  process.env.GENIUSPAY_SUCCESS_URL || `${SITE_URL}/checkout?payment=success`;
const GENIUSPAY_ERROR_URL =
  process.env.GENIUSPAY_ERROR_URL || `${SITE_URL}/checkout?payment=failed`;
const WAVE_BASE_URL = trimTrailingSlash(
  process.env.WAVE_BASE_URL ||
    process.env.WAVE_API_BASE_URL ||
    WAVE_DEFAULT_BASE_URL
);
const WAVE_API_KEY = process.env.WAVE_API_KEY || "";
const WAVE_SIGNING_SECRET = process.env.WAVE_SIGNING_SECRET || "";
const WAVE_SUCCESS_URL = process.env.WAVE_SUCCESS_URL || GENIUSPAY_SUCCESS_URL;
const WAVE_ERROR_URL = process.env.WAVE_ERROR_URL || GENIUSPAY_ERROR_URL;
const WAVE_FALLBACK_LINK =
  process.env.WAVE_FALLBACK_LINK || WAVE_DEFAULT_PAYMENT_LINK;
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

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const DEFAULT_FULFILLMENT = {
  mode: "preorder",
  paymentRequired: true,
  productionWindow: "Production starts after payment confirmation",
  deliveryWindow: "48/72h after payment confirmation",
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

const readTextBody = (req, maxBytes = 1024 * 1024) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks, size).toString("utf8"));
    });
    req.on("error", (error) => reject(error));
  });

const readJsonBody = async (req) => {
  const body = await readTextBody(req);
  if (!body.trim()) {
    return {};
  }
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error("Invalid JSON body.");
  }
};

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
      selectedColor: safeString(item.selectedColor, 32) || null,
      selectedColorId: safeString(item.selectedColorId, 32) || null,
      selectedDesignId: safeString(item.selectedDesignId, 64) || null,
      selectedDesignName: safeString(item.selectedDesignName, 120) || null,
      selectedDesignCategory: safeString(item.selectedDesignCategory, 32) || null,
      isCustomStudio: Boolean(item.isCustomStudio),
      preorder: item.preorder !== false,
      productionWindow:
        safeString(item.productionWindow, 120) ||
        DEFAULT_FULFILLMENT.productionWindow,
      deliveryWindow:
        safeString(item.deliveryWindow, 120) || DEFAULT_FULFILLMENT.deliveryWindow,
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

const normalizeFulfillment = (fulfillment) => {
  const source =
    fulfillment && typeof fulfillment === "object" ? fulfillment : DEFAULT_FULFILLMENT;

  return {
    mode: safeString(source.mode, 32) || DEFAULT_FULFILLMENT.mode,
    paymentRequired: source.paymentRequired !== false,
    productionWindow:
      safeString(source.productionWindow, 120) ||
      DEFAULT_FULFILLMENT.productionWindow,
    deliveryWindow:
      safeString(source.deliveryWindow, 120) || DEFAULT_FULFILLMENT.deliveryWindow,
  };
};

const buildOrderFromDraft = (draft) => {
  if (!draft || typeof draft !== "object") {
    throw new Error("Order payload is missing.");
  }

  const customer = normalizeCustomer(draft.customer);
  const items = normalizeItems(draft.items);
  const shipping = normalizeShipping(draft.shipping);
  const fulfillment = normalizeFulfillment(draft.fulfillment);
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = subtotal + shipping.fee;

  return {
    id: buildOrderId(),
    type: safeString(draft.type, 32) || "preorder",
    status: "sent",
    paymentToken: randomUUID(),
    createdAt: new Date().toISOString(),
    customer,
    items,
    subtotal,
    shipping,
    fulfillment,
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

const constantTimeStringEqual = (left, right) => {
  const expected = Buffer.from(String(left || ""));
  const provided = Buffer.from(String(right || ""));
  if (expected.length !== provided.length) {
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

const normalizePaymentPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  if (digits.startsWith("00")) {
    return `+${digits.slice(2)}`;
  }
  if (digits.startsWith("225")) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+225${digits}`;
  }
  return `+${digits}`;
};

const normalizeGeniusPaySignature = (value) =>
  safeString(value, 200).replace(/^sha256=/i, "").toLowerCase();

const normalizeGeniusPayPaymentMethod = (value) => {
  const raw = safeString(value, 60).toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = {
    wave: "wave",
    orange: "orange_money",
    orange_money: "orange_money",
    mtn: "mtn_money",
    mtn_money: "mtn_money",
    mtn_momo: "mtn_money",
    card: "card",
    carte: "card",
    paystack: "card",
  };
  const method = aliases[raw] || "";
  return GENIUSPAY_PAYMENT_METHODS.has(method) ? method : "";
};

const isReusableGeniusPayPayment = (payment, paymentMethod = "") => {
  if (!payment || payment.provider !== "geniuspay" || !payment.checkoutUrl) {
    return false;
  }
  const status = safeString(payment.status, 40).toLowerCase();
  const reusableStatus =
    !status || ["pending", "processing", "initiated"].includes(status);
  if (!reusableStatus) {
    return false;
  }

  const expectedMethod = normalizeGeniusPayPaymentMethod(paymentMethod);
  if (!expectedMethod) {
    return true;
  }
  return normalizeGeniusPayPaymentMethod(payment.paymentMethod) === expectedMethod;
};

const publicGeniusPayPayment = (payment) => {
  if (!payment || typeof payment !== "object") {
    return null;
  }

  return {
    provider: "geniuspay",
    reference: safeString(payment.reference, 120),
    status: safeString(payment.status, 40) || "pending",
    amount: safeInteger(payment.amount, 0),
    currency: safeString(payment.currency, 12) || "XOF",
    checkoutUrl: safeString(payment.checkoutUrl || payment.paymentUrl, 500),
    paymentUrl: safeString(payment.paymentUrl || payment.checkoutUrl, 500),
    paymentMethod: safeString(payment.paymentMethod, 60) || null,
    expiresAt: safeString(payment.expiresAt, 60) || null,
    completedAt: safeString(payment.completedAt, 60) || null,
    updatedAt: safeString(payment.updatedAt, 60) || null,
  };
};

const normalizeMobileMoneyPaymentMethod = (value) => {
  const raw = safeString(value, 60).toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = {
    wave: "wave",
    orange: "orange_money",
    orange_money: "orange_money",
    om: "orange_money",
    mtn: "mtn_money",
    mtn_money: "mtn_money",
    mtn_momo: "mtn_money",
  };
  const method = aliases[raw] || "";
  return MOBILE_MONEY_PAYMENT_METHODS.has(method) ? method : "";
};

const isReusableMobileMoneyPayment = (payment, paymentMethod = "") => {
  if (!payment || !safeString(payment.checkoutUrl || payment.paymentUrl, 500)) {
    return false;
  }
  const currentMethod = normalizeMobileMoneyPaymentMethod(
    payment.paymentMethod || payment.provider
  );
  const expectedMethod = normalizeMobileMoneyPaymentMethod(paymentMethod);
  if (!expectedMethod || currentMethod !== expectedMethod) {
    return false;
  }
  const status = safeString(payment.status, 40).toLowerCase();
  return !status || ["open", "pending", "processing", "initiated"].includes(status);
};

const publicMobileMoneyPayment = (payment) => {
  if (!payment || typeof payment !== "object") {
    return null;
  }

  const method = normalizeMobileMoneyPaymentMethod(
    payment.paymentMethod || payment.provider
  );
  return {
    provider: method || safeString(payment.provider, 60),
    reference: safeString(payment.reference, 120),
    status: safeString(payment.status, 40) || "pending",
    amount: safeInteger(payment.amount, 0),
    currency: safeString(payment.currency, 12) || "XOF",
    checkoutUrl: safeString(payment.checkoutUrl || payment.paymentUrl, 500),
    paymentUrl: safeString(payment.paymentUrl || payment.checkoutUrl, 500),
    paymentMethod: method || safeString(payment.paymentMethod, 60) || null,
    mode: safeString(payment.mode, 40) || null,
    expiresAt: safeString(payment.expiresAt, 60) || null,
    completedAt: safeString(payment.completedAt, 60) || null,
    updatedAt: safeString(payment.updatedAt, 60) || null,
  };
};

const readProviderErrorMessage = (payload, fallback) =>
  safeString(
    payload?.message ||
      payload?.error?.message ||
      payload?.error_description ||
      (typeof payload?.error === "string" ? payload.error : "") ||
      payload?.code,
    180
  ) || fallback;

const buildGeniusPayReturnUrl = (baseUrl, orderId) => {
  let target;
  try {
    target = new URL(baseUrl, `${SITE_URL}/`);
  } catch (error) {
    target = new URL("/checkout", `${SITE_URL}/`);
  }
  target.searchParams.set("provider", "geniuspay");
  target.searchParams.set("order", orderId);
  return target.toString();
};

const buildMobileMoneyReturnUrl = (baseUrl, provider, orderId) => {
  let target;
  try {
    target = new URL(baseUrl, `${SITE_URL}/`);
  } catch (error) {
    target = new URL("/checkout", `${SITE_URL}/`);
  }
  target.searchParams.set("provider", provider);
  target.searchParams.set("order", orderId);
  return target.toString();
};

const assertGeniusPayConfigured = () => {
  if (!GENIUSPAY_API_KEY || !GENIUSPAY_API_SECRET) {
    throw createHttpError(503, "GeniusPay is not configured yet.");
  }
};

const assertPaymentToken = (order, paymentToken) => {
  if (!order?.paymentToken) {
    return;
  }
  if (!constantTimeStringEqual(order.paymentToken, safeString(paymentToken, 120))) {
    throw createHttpError(403, "Unauthorized payment session.");
  }
};

const buildWaveSignatureHeader = (body = "") => {
  if (!WAVE_SIGNING_SECRET) {
    return "";
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", WAVE_SIGNING_SECRET)
    .update(`${timestamp}${body}`)
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
};

const buildWaveHeaders = (body = "", includeContentType = false) => {
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${WAVE_API_KEY}`,
  };
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  const signature = buildWaveSignatureHeader(body);
  if (signature) {
    headers["Wave-Signature"] = signature;
  }
  return headers;
};

const buildWaveFallbackPaymentUrl = (order) => {
  const rawUrl = safeString(WAVE_FALLBACK_LINK, 500);
  if (!rawUrl) {
    return "";
  }
  try {
    const url = new URL(rawUrl);
    const amount = safeInteger(order.subtotal, 0);
    if (amount > 0) {
      url.searchParams.set("amount", String(amount));
    }
    return url.toString();
  } catch (error) {
    return rawUrl;
  }
};

const normalizeWaveStatus = (data = {}) => {
  const paymentStatus = safeString(
    data.payment_status || data.paymentStatus,
    40
  ).toLowerCase();
  if (paymentStatus) {
    return paymentStatus;
  }
  const checkoutStatus = safeString(
    data.checkout_status || data.checkoutStatus,
    40
  ).toLowerCase();
  if (checkoutStatus === "complete") {
    return "succeeded";
  }
  return checkoutStatus || "pending";
};

const isMobileMoneyPaid = (status) =>
  ["completed", "complete", "paid", "success", "succeeded", "successful"].includes(
    safeString(status, 40).toLowerCase()
  );

const buildWaveCheckoutRequest = (order) => {
  const amount = safeInteger(order.subtotal, 0);
  if (amount < 1) {
    throw createHttpError(400, "Wave requires a positive payment amount.");
  }
  return {
    amount: String(amount),
    currency: "XOF",
    client_reference: safeString(order.id, 80),
    success_url: buildMobileMoneyReturnUrl(WAVE_SUCCESS_URL, "wave", order.id),
    error_url: buildMobileMoneyReturnUrl(WAVE_ERROR_URL, "wave", order.id),
  };
};

const applyWaveCheckoutToOrder = (order, paymentData) => {
  const current =
    order.payment && typeof order.payment === "object" ? order.payment : {};
  const status = normalizeWaveStatus(paymentData);
  const now = new Date().toISOString();
  const launchUrl = safeString(
    paymentData.wave_launch_url ||
      paymentData.waveLaunchUrl ||
      current.paymentUrl ||
      current.checkoutUrl,
    500
  );
  const payment = {
    ...current,
    provider: "wave",
    reference:
      safeString(paymentData.id || paymentData.checkout_id, 120) ||
      safeString(current.reference, 120),
    status,
    amount: safeInteger(paymentData.amount ?? current.amount, order.subtotal),
    currency: safeString(paymentData.currency || current.currency, 12) || "XOF",
    checkoutUrl: launchUrl,
    paymentUrl: launchUrl,
    paymentMethod: "wave",
    mode: "api",
    clientReference:
      safeString(paymentData.client_reference || current.clientReference, 255) ||
      order.id,
    transactionId:
      safeString(paymentData.transaction_id || current.transactionId, 120) || null,
    environment:
      safeString(current.environment, 40) ||
      (WAVE_API_KEY.includes("_test_") ? "test" : "live"),
    expiresAt:
      safeString(paymentData.when_expires || paymentData.expiresAt, 60) ||
      current.expiresAt ||
      null,
    updatedAt: now,
  };
  if (isMobileMoneyPaid(status)) {
    payment.completedAt =
      safeString(paymentData.when_completed || paymentData.completedAt, 60) ||
      current.completedAt ||
      now;
  }
  order.payment = payment;
  return payment;
};

const createWaveFallbackPayment = (order) => {
  const now = new Date().toISOString();
  const paymentUrl = buildWaveFallbackPaymentUrl(order);
  return {
    provider: "wave",
    reference: order.id,
    status: "pending",
    amount: safeInteger(order.subtotal, 0),
    currency: "XOF",
    checkoutUrl: paymentUrl,
    paymentUrl,
    paymentMethod: "wave",
    mode: "merchant_link",
    environment: "fallback",
    createdAt: now,
    updatedAt: now,
  };
};

const createWaveCheckoutPayment = async (order) => {
  if (!WAVE_API_KEY) {
    return createWaveFallbackPayment(order);
  }
  const body = JSON.stringify(buildWaveCheckoutRequest(order));
  const response = await fetch(`${WAVE_BASE_URL}/v1/checkout/sessions`, {
    method: "POST",
    headers: buildWaveHeaders(body, true),
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw createHttpError(
      response.status || 502,
      readProviderErrorMessage(payload, "Wave payment creation failed.")
    );
  }

  const launchUrl = safeString(
    payload.wave_launch_url || payload.waveLaunchUrl,
    500
  );
  if (!launchUrl) {
    throw createHttpError(502, "Wave did not return a launch URL.");
  }
  const now = new Date().toISOString();
  return {
    provider: "wave",
    reference: safeString(payload.id || payload.checkout_id, 120),
    status: normalizeWaveStatus(payload),
    amount: safeInteger(payload.amount, order.subtotal),
    currency: safeString(payload.currency, 12) || "XOF",
    checkoutUrl: launchUrl,
    paymentUrl: launchUrl,
    paymentMethod: "wave",
    mode: "api",
    clientReference: safeString(payload.client_reference, 255) || order.id,
    transactionId: safeString(payload.transaction_id, 120) || null,
    environment: WAVE_API_KEY.includes("_test_") ? "test" : "live",
    expiresAt: safeString(payload.when_expires, 60) || null,
    completedAt: safeString(payload.when_completed, 60) || null,
    createdAt: safeString(payload.when_created, 60) || now,
    updatedAt: now,
  };
};

const fetchWaveCheckoutPayment = async (reference) => {
  if (!WAVE_API_KEY) {
    throw createHttpError(503, "Wave API is not configured yet.");
  }
  const safeReference = safeString(reference, 120);
  if (!safeReference) {
    throw createHttpError(400, "Wave payment reference is missing.");
  }
  const response = await fetch(
    `${WAVE_BASE_URL}/v1/checkout/sessions/${encodeURIComponent(safeReference)}`,
    {
      headers: buildWaveHeaders(),
    }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw createHttpError(
      response.status || 502,
      readProviderErrorMessage(payload, "Wave payment lookup failed.")
    );
  }
  return payload;
};

const createMobileMoneyPayment = async (order, paymentMethod = "") => {
  const method = normalizeMobileMoneyPaymentMethod(paymentMethod);
  if (method === "wave") {
    return createWaveCheckoutPayment(order);
  }
  if (method === "orange_money") {
    throw createHttpError(503, "Orange Money API is not configured yet.");
  }
  if (method === "mtn_money") {
    throw createHttpError(503, "MTN Money API is not configured yet.");
  }
  throw createHttpError(400, "Invalid Mobile Money payment method.");
};

const buildGeniusPayPaymentRequest = (order, paymentMethod = "") => {
  const amount = safeInteger(order.subtotal, 0);
  if (amount < 200) {
    throw createHttpError(
      400,
      "GeniusPay requires a minimum amount of 200 FCFA."
    );
  }

  const customerName = safeString(
    `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`,
    140
  );
  const method = normalizeGeniusPayPaymentMethod(paymentMethod);

  const body = {
    amount,
    currency: "XOF",
    description: safeString(`Commande ${order.id} NewGbonhi`, 180),
    customer: {
      name: customerName || "Client NewGbonhi",
      email: safeString(order.customer?.email, 140),
      phone: normalizePaymentPhone(order.customer?.phone),
      country: "CI",
    },
    success_url: buildGeniusPayReturnUrl(GENIUSPAY_SUCCESS_URL, order.id),
    error_url: buildGeniusPayReturnUrl(GENIUSPAY_ERROR_URL, order.id),
    metadata: {
      order_id: order.id,
      source: "newgbonhi_checkout",
      ...(method ? { payment_method: method } : {}),
    },
  };
  if (method) {
    body.payment_method = method;
  }
  return body;
};

const createGeniusPayPayment = async (order, paymentMethod = "") => {
  assertGeniusPayConfigured();
  const method = normalizeGeniusPayPaymentMethod(paymentMethod);
  const body = buildGeniusPayPaymentRequest(order, method);
  const response = await fetch(`${GENIUSPAY_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": GENIUSPAY_API_KEY,
      "X-API-Secret": GENIUSPAY_API_SECRET,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  const data =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;

  if (!response.ok || payload?.success === false) {
    throw createHttpError(
      response.status || 502,
      safeString(payload?.message || payload?.error, 180) ||
        "GeniusPay payment creation failed."
    );
  }

  const checkoutUrl = safeString(
    data.checkout_url || data.checkoutUrl || data.payment_url || data.paymentUrl,
    500
  );
  if (!checkoutUrl) {
    throw createHttpError(502, "GeniusPay did not return a checkout URL.");
  }

  const now = new Date().toISOString();
  return {
    provider: "geniuspay",
    reference: safeString(data.reference || data.transaction_id || data.id, 120),
    status: safeString(data.status, 40) || "pending",
    amount: safeInteger(data.amount, body.amount),
    currency: safeString(data.currency, 12) || "XOF",
    checkoutUrl,
    paymentUrl: safeString(data.payment_url || data.paymentUrl, 500) || checkoutUrl,
    paymentMethod:
      safeString(
        data.payment_method ||
          data.paymentMethod ||
          data.method ||
          data.gateway ||
          data.payment_provider ||
          method,
        60
      ) ||
      null,
    environment: safeString(data.environment, 40) || null,
    expiresAt: safeString(data.expires_at || data.expiresAt, 60) || null,
    createdAt: now,
    updatedAt: now,
  };
};

const fetchGeniusPayPayment = async (reference) => {
  assertGeniusPayConfigured();
  const safeReference = safeString(reference, 120);
  if (!safeReference) {
    throw createHttpError(400, "GeniusPay payment reference is missing.");
  }

  const response = await fetch(
    `${GENIUSPAY_BASE_URL}/payments/${encodeURIComponent(safeReference)}`,
    {
      headers: {
        Accept: "application/json",
        "X-API-Key": GENIUSPAY_API_KEY,
        "X-API-Secret": GENIUSPAY_API_SECRET,
      },
    }
  );
  const payload = await response.json().catch(() => ({}));
  const data =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;

  if (!response.ok || payload?.success === false) {
    throw createHttpError(
      response.status || 502,
      safeString(payload?.message || payload?.error, 180) ||
        "GeniusPay payment lookup failed."
    );
  }

  return data;
};

const verifyGeniusPayWebhookSignature = (req, rawBody) => {
  if (!GENIUSPAY_WEBHOOK_SECRET) {
    throw createHttpError(503, "GeniusPay webhook secret is not configured.");
  }

  const providedSignature = normalizeGeniusPaySignature(
    req.headers["x-webhook-signature"]
  );
  const timestampHeader = safeString(req.headers["x-webhook-timestamp"], 60);
  const timestamp = Number(timestampHeader);
  const timestampSeconds =
    Number.isFinite(timestamp) && timestamp > 9999999999
      ? Math.floor(timestamp / 1000)
      : timestamp;

  if (!providedSignature || !Number.isFinite(timestampSeconds)) {
    throw createHttpError(401, "Invalid GeniusPay webhook signature.");
  }

  const age = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (age > GENIUSPAY_WEBHOOK_MAX_AGE_SECONDS) {
    throw createHttpError(401, "Expired GeniusPay webhook signature.");
  }

  const expectedSignature = createHmac("sha256", GENIUSPAY_WEBHOOK_SECRET)
    .update(`${timestampHeader}.${rawBody}`)
    .digest("hex");
  if (!constantTimeStringEqual(expectedSignature, providedSignature)) {
    throw createHttpError(401, "Invalid GeniusPay webhook signature.");
  }
};

const isGeniusPayPaid = (event, status) => {
  const normalizedEvent = safeString(event, 80).toLowerCase();
  const normalizedStatus = safeString(status, 40).toLowerCase();
  return (
    ["payment.success", "payment.completed", "payment.paid"].includes(
      normalizedEvent
    ) ||
    ["completed", "paid", "success", "succeeded", "successful"].includes(
      normalizedStatus
    )
  );
};

const findGeniusPayOrder = (orders, paymentData) => {
  const metadata =
    paymentData?.metadata && typeof paymentData.metadata === "object"
      ? paymentData.metadata
      : {};
  const orderId = safeString(
    metadata.order_id ||
      metadata.orderId ||
      paymentData?.order_id ||
      paymentData?.orderId,
    80
  );
  const reference = safeString(
    paymentData?.reference || paymentData?.transaction_id || paymentData?.id,
    120
  );
  const order = orders.find(
    (entry) =>
      (orderId && entry.id === orderId) ||
      (reference &&
        entry.payment?.provider === "geniuspay" &&
        entry.payment.reference === reference)
  );
  return { order, orderId, reference };
};

const applyGeniusPayWebhookToOrder = (order, paymentData, event) => {
  const current =
    order.payment && typeof order.payment === "object" ? order.payment : {};
  const status = safeString(paymentData.status || current.status, 40) || "pending";
  const now = new Date().toISOString();
  const payment = {
    ...current,
    provider: "geniuspay",
    reference:
      safeString(
        paymentData.reference || paymentData.transaction_id || paymentData.id,
        120
      ) || safeString(current.reference, 120),
    status,
    amount: safeInteger(paymentData.amount ?? current.amount, order.subtotal),
    currency: safeString(paymentData.currency || current.currency, 12) || "XOF",
    checkoutUrl: safeString(current.checkoutUrl || current.paymentUrl, 500),
    paymentUrl: safeString(current.paymentUrl || current.checkoutUrl, 500),
    paymentMethod:
      safeString(
        paymentData.payment_method ||
          paymentData.paymentMethod ||
          paymentData.method ||
          paymentData.gateway ||
          paymentData.payment_provider ||
          current.paymentMethod,
        60
      ) || null,
    environment: safeString(paymentData.environment || current.environment, 40) || null,
    expiresAt:
      safeString(
        paymentData.expires_at || paymentData.expiresAt || current.expiresAt,
        60
      ) || null,
    updatedAt: now,
  };

  if (isGeniusPayPaid(event, status)) {
    payment.completedAt =
      safeString(paymentData.completed_at || paymentData.completedAt, 60) ||
      current.completedAt ||
      now;
  }

  order.payment = payment;
  return payment;
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

  if (!GENIUSPAY_API_KEY || !GENIUSPAY_API_SECRET) {
    console.warn(
      "[config] GeniusPay API keys are not configured. Online payments will fall back to manual Mobile Money."
    );
  } else if (!GENIUSPAY_WEBHOOK_SECRET) {
    console.warn(
      "[config] GENIUSPAY_WEBHOOK_SECRET is not configured. GeniusPay payment confirmations will be rejected."
    );
  }

  if (!WAVE_API_KEY) {
    console.warn(
      "[config] WAVE_API_KEY is not configured. Wave API payments will use the merchant link fallback."
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

    if (
      method === "POST" &&
      pathname.match(/^\/api\/orders\/[^/]+\/mobile-money-payment$/)
    ) {
      const orderId = parseOrderIdFromPath(pathname, "mobile-money-payment");
      if (!orderId) {
        respondJson(res, 400, { error: "Order id is missing." });
        return;
      }

      const payload = await readJsonBody(req);
      const paymentMethod = normalizeMobileMoneyPaymentMethod(
        payload.paymentMethod || payload.payment_method || payload.provider
      );
      if (!paymentMethod) {
        respondJson(res, 400, { error: "Invalid Mobile Money payment method." });
        return;
      }

      const result = await withWriteLock(async () => {
        const orders = await readOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
          return null;
        }

        assertPaymentToken(order, payload.paymentToken);

        if (isReusableMobileMoneyPayment(order.payment, paymentMethod)) {
          return {
            order,
            payment: publicMobileMoneyPayment(order.payment),
            status: 200,
          };
        }

        const payment = await createMobileMoneyPayment(order, paymentMethod);
        order.payment = payment;
        await writeOrders(orders);
        await appendAuditLog({
          orderId,
          previousStatus: order.status,
          nextStatus: order.status,
          actor: "customer",
          source: `${paymentMethod}-payment-created`,
          paymentReference: payment.reference,
        });
        return {
          order,
          payment: publicMobileMoneyPayment(order.payment),
          status: 201,
        };
      });

      if (!result) {
        respondJson(res, 404, { error: "Order not found." });
        return;
      }

      respondJson(res, result.status, {
        order: result.order,
        payment: result.payment,
      });
      return;
    }

    if (
      method === "POST" &&
      pathname.match(/^\/api\/orders\/[^/]+\/geniuspay-payment$/)
    ) {
      const orderId = parseOrderIdFromPath(pathname, "geniuspay-payment");
      if (!orderId) {
        respondJson(res, 400, { error: "Order id is missing." });
        return;
      }

      const payload = await readJsonBody(req);
      const paymentMethod = normalizeGeniusPayPaymentMethod(
        payload.paymentMethod || payload.payment_method
      );
      if ((payload.paymentMethod || payload.payment_method) && !paymentMethod) {
        respondJson(res, 400, { error: "Invalid GeniusPay payment method." });
        return;
      }
      const result = await withWriteLock(async () => {
        const orders = await readOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
          return null;
        }

        assertPaymentToken(order, payload.paymentToken);

        if (isReusableGeniusPayPayment(order.payment, paymentMethod)) {
          return { order, payment: publicGeniusPayPayment(order.payment), status: 200 };
        }

        const payment = await createGeniusPayPayment(order, paymentMethod);
        order.payment = payment;
        await writeOrders(orders);
        await appendAuditLog({
          orderId,
          previousStatus: order.status,
          nextStatus: order.status,
          actor: "customer",
          source: "geniuspay-payment-created",
          paymentReference: payment.reference,
        });
        return { order, payment: publicGeniusPayPayment(order.payment), status: 201 };
      });

      if (!result) {
        respondJson(res, 404, { error: "Order not found." });
        return;
      }

      respondJson(res, result.status, {
        order: result.order,
        payment: result.payment,
      });
      return;
    }

    if (method === "POST" && pathname === "/api/payments/geniuspay/webhook") {
      const rawBody = await readTextBody(req);
      verifyGeniusPayWebhookSignature(req, rawBody);

      let payload;
      try {
        payload = rawBody ? JSON.parse(rawBody) : {};
      } catch (error) {
        respondJson(res, 400, { error: "Invalid JSON body." });
        return;
      }

      const event = safeString(
        req.headers["x-webhook-event"] || payload.event || payload.type,
        80
      );
      const paymentData =
        payload?.data && typeof payload.data === "object"
          ? payload.data
          : payload && typeof payload === "object"
            ? payload
            : {};
      if (event === "webhook.test") {
        respondJson(res, 200, { ok: true, event });
        return;
      }

      const result = await withWriteLock(async () => {
        const orders = await readOrders();
        const { order, orderId, reference } = findGeniusPayOrder(
          orders,
          paymentData
        );
        if (!order) {
          return null;
        }

        const previousStatus = order.status;
        const payment = applyGeniusPayWebhookToOrder(order, paymentData, event);
        if (isGeniusPayPaid(event, payment.status)) {
          order.status = "paid";
        }

        await writeOrders(orders);
        await appendAuditLog({
          orderId: order.id || orderId,
          previousStatus,
          nextStatus: order.status,
          actor: "geniuspay",
          source: event || "geniuspay-webhook",
          paymentReference: payment.reference || reference,
        });

        return {
          orderId: order.id,
          status: order.status,
          paymentStatus: payment.status,
        };
      });

      if (!result) {
        respondJson(res, 404, { error: "Order not found." });
        return;
      }

      respondJson(res, 200, { ok: true, ...result });
      return;
    }

    if (method === "POST" && pathname.match(/^\/api\/orders\/[^/]+\/geniuspay-sync$/)) {
      if (!isAuthorized(req)) {
        respondJson(res, 401, { error: "Unauthorized." });
        return;
      }

      const orderId = parseOrderIdFromPath(pathname, "geniuspay-sync");
      if (!orderId) {
        respondJson(res, 400, { error: "Order id is missing." });
        return;
      }

      const updatedOrders = await withWriteLock(async () => {
        const orders = await readOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
          return null;
        }

        if (order.payment?.provider !== "geniuspay" || !order.payment?.reference) {
          throw createHttpError(400, "GeniusPay payment reference is missing.");
        }

        const paymentData = await fetchGeniusPayPayment(order.payment.reference);
        const previousStatus = order.status;
        const payment = applyGeniusPayWebhookToOrder(
          order,
          paymentData,
          "payment.sync"
        );
        if (
          isGeniusPayPaid("payment.sync", payment.status) &&
          !["production", "delivered"].includes(order.status)
        ) {
          order.status = "paid";
        }

        await writeOrders(orders);
        await appendAuditLog({
          orderId: order.id,
          previousStatus,
          nextStatus: order.status,
          actor: "admin",
          source: "geniuspay-sync",
          paymentReference: payment.reference,
        });
        return orders;
      });

      if (!updatedOrders) {
        respondJson(res, 404, { error: "Order not found." });
        return;
      }

      respondJson(res, 200, { orders: updatedOrders });
      return;
    }

    if (
      method === "POST" &&
      pathname.match(/^\/api\/orders\/[^/]+\/mobile-money-sync$/)
    ) {
      if (!isAuthorized(req)) {
        respondJson(res, 401, { error: "Unauthorized." });
        return;
      }

      const orderId = parseOrderIdFromPath(pathname, "mobile-money-sync");
      if (!orderId) {
        respondJson(res, 400, { error: "Order id is missing." });
        return;
      }

      const updatedOrders = await withWriteLock(async () => {
        const orders = await readOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
          return null;
        }

        const provider = normalizeMobileMoneyPaymentMethod(
          order.payment?.provider || order.payment?.paymentMethod
        );
        if (provider !== "wave" || !order.payment?.reference) {
          throw createHttpError(400, "Wave payment reference is missing.");
        }
        if (order.payment.mode !== "api") {
          throw createHttpError(400, "This Wave payment uses the manual link.");
        }

        const paymentData = await fetchWaveCheckoutPayment(order.payment.reference);
        const previousStatus = order.status;
        const payment = applyWaveCheckoutToOrder(order, paymentData);
        if (
          isMobileMoneyPaid(payment.status) &&
          !["production", "delivered"].includes(order.status)
        ) {
          order.status = "paid";
        }

        await writeOrders(orders);
        await appendAuditLog({
          orderId: order.id,
          previousStatus,
          nextStatus: order.status,
          actor: "admin",
          source: "wave-sync",
          paymentReference: payment.reference,
        });
        return orders;
      });

      if (!updatedOrders) {
        respondJson(res, 404, { error: "Order not found." });
        return;
      }

      respondJson(res, 200, { orders: updatedOrders });
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
    const statusCode =
      Number.isInteger(error?.status) && error.status >= 400 && error.status < 600
        ? error.status
        : 400;
    respondJson(res, statusCode, { error: message });
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
