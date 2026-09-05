const STATUS_VALUES = new Set([
  "sent",
  "paid_reported",
  "paid",
  "production",
  "delivered",
]);
const DEFAULT_TOKEN_TTL_MS = 1000 * 60 * 60 * 8;
const ORDERS_KEY = "orders.v1";
const AUDIT_KEY = "orders.audit.v1";
const LAB_RATE_PREFIX = "lab.rate.";
const LAB_RATE_LIMIT_MS = 60 * 1000;
const NEWSLETTER_SEGMENT_KEY = "newsletter.segment.v1";
const NEWSLETTER_SENT_PREFIX = "newsletter.sent.";
const NEWSLETTER_WELCOME_PREFIX = "newsletter.welcome.";
const NEWSLETTER_SEGMENT_NAME = "NewGbonhi Newsletter";
const ORDER_EMAIL_PREFIX = "order.email.";
const ORDER_TEAM_EMAIL_PREFIX = "order.team.email.";
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

const baseHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-headers":
    "Content-Type, Authorization, X-Webhook-Signature, X-Webhook-Timestamp, X-Webhook-Event, X-Webhook-Delivery, X-Webhook-Environment",
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

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

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

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const bytesToBase64 = (bytes) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBytes = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const toBase64Url = (value) =>
  bytesToBase64(textEncoder.encode(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64UrlJson = (value) => {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  try {
    return JSON.parse(textDecoder.decode(base64ToBytes(padded)));
  } catch (error) {
    return null;
  }
};

const importHmacKey = async (secret) =>
  crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

const signJwt = async (payload, secret) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const key = await importHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(signingInput)
  );
  const signature = bytesToBase64(new Uint8Array(signatureBuffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${signingInput}.${signature}`;
};

const verifyJwt = async (token, secret) => {
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

  const normalizedSignature = String(providedSignature || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(String(providedSignature || "").length / 4) * 4, "=");

  const key = await importHmacKey(secret);
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64ToBytes(normalizedSignature),
    textEncoder.encode(`${encodedHeader}.${encodedPayload}`)
  );
  if (!isValid) {
    return null;
  }

  const expiresAt = Number(payload.exp);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
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
  const stamp = String(now.getFullYear());
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
    paymentToken: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    customer,
    items,
    subtotal,
    shipping,
    fulfillment,
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

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeLabApplication = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Application details are required.");
  }

  const application = {
    name: safeString(payload.name, 120),
    email: safeString(payload.email, 160).toLowerCase(),
    discipline: safeString(payload.discipline, 80),
    city: safeString(payload.city, 80),
    link: safeString(payload.link, 300),
    pitch: safeString(payload.pitch, 1200),
    company: safeString(payload.company, 120),
    pactAccepted: payload.pactAccepted === true,
    pactVersion: safeString(payload.pactVersion, 20),
    pactSignedName: safeString(payload.pactSignedName, 120),
    pactAcceptedAt: safeString(payload.pactAcceptedAt, 40),
  };

  if (application.company) return { ...application, isSpam: true };

  if (
    !application.name ||
    !application.email ||
    !application.discipline ||
    !application.city ||
    !application.link ||
    !application.pitch ||
    !application.pactAccepted ||
    application.pactVersion !== "2026.08" ||
    !application.pactSignedName ||
    !application.pactAcceptedAt
  ) {
    throw new Error("Application details are incomplete.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.email)) {
    throw new Error("Email address is invalid.");
  }

  let linkUrl;
  try {
    linkUrl = new URL(application.link);
  } catch {
    throw new Error("Portfolio link is invalid.");
  }
  if (!new Set(["http:", "https:"]).has(linkUrl.protocol)) {
    throw new Error("Portfolio link is invalid.");
  }
  application.link = linkUrl.toString();
  return { ...application, isSpam: false };
};

// Emergency admin credential reset. Only the SHA-256 fingerprint is stored in
// source; the plaintext password is never shipped to the client bundle.
const ADMIN_PASSWORD_SHA256 =
  "23b10ab3813d43f62b47d08f66be3a5aede1b293b8246e44087a1f1ca0c987e1";

const sha256Hex = async (value) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(String(value || "").trim())
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

const bytesToHex = (bytes) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const hmacSha256Hex = async (value, secret) => {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(value)
  );
  return bytesToHex(new Uint8Array(signature));
};

const readTextBody = async (request, maxBytes = 1024 * 1024) => {
  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error("Request body too large.");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return textDecoder.decode(body);
};

const parseJsonBody = async (request) => {
  const body = await readTextBody(request);
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error("Invalid JSON body.");
  }
};

const parseOptionalJsonBody = async (request) => {
  const body = await readTextBody(request);
  if (!body.trim()) {
    return {};
  }
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error("Invalid JSON body.");
  }
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

  get jwtSecret() {
    return this.env.ADMIN_JWT_SECRET || this.adminPassword || "";
  }

  get resendApiKey() {
    return this.env.RESEND_API_KEY || "";
  }

  get resendNewsletterApiKey() {
    return this.env.RESEND_NEWSLETTER_API_KEY || "";
  }

  get labToEmail() {
    return this.env.LAB_TO_EMAIL || "newgbonhifamily@gmail.com";
  }

  get orderToEmail() {
    return this.env.ORDER_TO_EMAIL || this.labToEmail;
  }

  get orderDashboardUrl() {
    return this.env.ORDER_DASHBOARD_URL || "https://newgbonhi.com/orders";
  }

  get brandLogoUrl() {
    return this.env.BRAND_LOGO_URL || "https://newgbonhi.com/email-logo.png";
  }

  emailBrandMark(label = "NEWGBONHI", color = "#f4f1e9") {
    const safeLogoUrl = escapeHtml(this.brandLogoUrl);
    return `<table role="presentation" cellspacing="0" cellpadding="0"><tr><td width="34" style="width:34px;padding:0 10px 0 0"><img src="${safeLogoUrl}" width="34" height="34" alt="NewGbonhi" style="display:block;width:34px;height:34px;border:0;border-radius:50%;object-fit:cover;background:#f4f1e9"></td><td style="font-size:15px;font-weight:900;letter-spacing:-.03em;color:${color}">${escapeHtml(label)}</td></tr></table>`;
  }

  get labFromEmail() {
    return this.env.LAB_FROM_EMAIL || "NewGbonhi Lab <lab@newgbonhi.com>";
  }

  get newsletterFromEmail() {
    return this.env.NEWSLETTER_FROM_EMAIL || "NewGbonhi <news@newgbonhi.com>";
  }

  get orderFromEmail() {
    return this.env.ORDER_FROM_EMAIL || "NewGbonhi Orders <orders@newgbonhi.com>";
  }

  get siteUrl() {
    return trimTrailingSlash(this.env.SITE_URL || "https://newgbonhi.com");
  }

  get geniusPayBaseUrl() {
    return trimTrailingSlash(
      this.env.GENIUSPAY_BASE_URL || GENIUSPAY_DEFAULT_BASE_URL
    );
  }

  get geniusPayApiKey() {
    return this.env.GENIUSPAY_API_KEY || "";
  }

  get geniusPayApiSecret() {
    return this.env.GENIUSPAY_API_SECRET || "";
  }

  get geniusPayWebhookSecret() {
    return this.env.GENIUSPAY_WEBHOOK_SECRET || "";
  }

  get geniusPaySuccessUrl() {
    return (
      this.env.GENIUSPAY_SUCCESS_URL ||
      `${this.siteUrl}/checkout?payment=success`
    );
  }

  get geniusPayErrorUrl() {
    return (
      this.env.GENIUSPAY_ERROR_URL ||
      `${this.siteUrl}/checkout?payment=failed`
    );
  }

  get waveBaseUrl() {
    return trimTrailingSlash(
      this.env.WAVE_BASE_URL || this.env.WAVE_API_BASE_URL || WAVE_DEFAULT_BASE_URL
    );
  }

  get waveApiKey() {
    return this.env.WAVE_API_KEY || "";
  }

  get waveSigningSecret() {
    return this.env.WAVE_SIGNING_SECRET || "";
  }

  get waveSuccessUrl() {
    return this.env.WAVE_SUCCESS_URL || this.geniusPaySuccessUrl;
  }

  get waveErrorUrl() {
    return this.env.WAVE_ERROR_URL || this.geniusPayErrorUrl;
  }

  get waveFallbackLink() {
    return this.env.WAVE_FALLBACK_LINK || WAVE_DEFAULT_PAYMENT_LINK;
  }

  async resendRequest(path, options = {}, apiKey = this.resendApiKey) {
    if (!apiKey) throw new Error("Email service is not configured.");
    const response = await fetch(`https://api.resend.com${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload?.message || "Resend request failed.");
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  buildGeniusPayReturnUrl(baseUrl, orderId) {
    let target;
    try {
      target = new URL(baseUrl, `${this.siteUrl}/`);
    } catch (error) {
      target = new URL("/checkout", `${this.siteUrl}/`);
    }
    target.searchParams.set("provider", "geniuspay");
    target.searchParams.set("order", orderId);
    return target.toString();
  }

  buildMobileMoneyReturnUrl(baseUrl, provider, orderId) {
    let target;
    try {
      target = new URL(baseUrl, `${this.siteUrl}/`);
    } catch (error) {
      target = new URL("/checkout", `${this.siteUrl}/`);
    }
    target.searchParams.set("provider", provider);
    target.searchParams.set("order", orderId);
    return target.toString();
  }

  async buildWaveSignatureHeader(body = "") {
    if (!this.waveSigningSecret) {
      return "";
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await hmacSha256Hex(
      `${timestamp}${body}`,
      this.waveSigningSecret
    );
    return `t=${timestamp},v1=${signature}`;
  }

  async buildWaveHeaders(body = "", includeContentType = false) {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${this.waveApiKey}`,
    };
    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }
    const signature = await this.buildWaveSignatureHeader(body);
    if (signature) {
      headers["Wave-Signature"] = signature;
    }
    return headers;
  }

  buildWaveFallbackPaymentUrl(order) {
    const rawUrl = safeString(this.waveFallbackLink, 500);
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
  }

  buildWaveCheckoutRequest(order) {
    const amount = safeInteger(order.subtotal, 0);
    if (amount < 1) {
      throw createHttpError(400, "Wave requires a positive payment amount.");
    }
    return {
      amount: String(amount),
      currency: "XOF",
      client_reference: safeString(order.id, 80),
      success_url: this.buildMobileMoneyReturnUrl(
        this.waveSuccessUrl,
        "wave",
        order.id
      ),
      error_url: this.buildMobileMoneyReturnUrl(
        this.waveErrorUrl,
        "wave",
        order.id
      ),
    };
  }

  assertGeniusPayConfigured() {
    if (!this.geniusPayApiKey || !this.geniusPayApiSecret) {
      throw createHttpError(503, "GeniusPay is not configured yet.");
    }
  }

  assertPaymentToken(order, paymentToken) {
    if (!order?.paymentToken) {
      return;
    }
    if (!constantTimeEqual(order.paymentToken, safeString(paymentToken, 120))) {
      throw createHttpError(403, "Unauthorized payment session.");
    }
  }

  buildGeniusPayPaymentRequest(order, paymentMethod = "") {
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
      success_url: this.buildGeniusPayReturnUrl(
        this.geniusPaySuccessUrl,
        order.id
      ),
      error_url: this.buildGeniusPayReturnUrl(this.geniusPayErrorUrl, order.id),
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
  }

  async createGeniusPayPayment(order, paymentMethod = "") {
    this.assertGeniusPayConfigured();
    const method = normalizeGeniusPayPaymentMethod(paymentMethod);
    const body = this.buildGeniusPayPaymentRequest(order, method);
    const response = await fetch(`${this.geniusPayBaseUrl}/payments`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-Key": this.geniusPayApiKey,
        "X-API-Secret": this.geniusPayApiSecret,
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
      reference: safeString(
        data.reference || data.transaction_id || data.id,
        120
      ),
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
  }

  async fetchGeniusPayPayment(reference) {
    this.assertGeniusPayConfigured();
    const safeReference = safeString(reference, 120);
    if (!safeReference) {
      throw createHttpError(400, "GeniusPay payment reference is missing.");
    }

    const response = await fetch(
      `${this.geniusPayBaseUrl}/payments/${encodeURIComponent(safeReference)}`,
      {
        headers: {
          Accept: "application/json",
          "X-API-Key": this.geniusPayApiKey,
          "X-API-Secret": this.geniusPayApiSecret,
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
  }

  applyWaveCheckoutToOrder(order, paymentData) {
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
      currency:
        safeString(paymentData.currency || current.currency, 12) || "XOF",
      checkoutUrl: launchUrl,
      paymentUrl: launchUrl,
      paymentMethod: "wave",
      mode: "api",
      clientReference:
        safeString(paymentData.client_reference || current.clientReference, 255) ||
        order.id,
      transactionId:
        safeString(paymentData.transaction_id || current.transactionId, 120) ||
        null,
      environment:
        safeString(current.environment, 40) ||
        (this.waveApiKey.includes("_test_") ? "test" : "live"),
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
  }

  createWaveFallbackPayment(order) {
    const now = new Date().toISOString();
    const paymentUrl = this.buildWaveFallbackPaymentUrl(order);
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
  }

  async createWaveCheckoutPayment(order) {
    if (!this.waveApiKey) {
      return this.createWaveFallbackPayment(order);
    }
    const body = JSON.stringify(this.buildWaveCheckoutRequest(order));
    const response = await fetch(`${this.waveBaseUrl}/v1/checkout/sessions`, {
      method: "POST",
      headers: await this.buildWaveHeaders(body, true),
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
      environment: this.waveApiKey.includes("_test_") ? "test" : "live",
      expiresAt: safeString(payload.when_expires, 60) || null,
      completedAt: safeString(payload.when_completed, 60) || null,
      createdAt: safeString(payload.when_created, 60) || now,
      updatedAt: now,
    };
  }

  async fetchWaveCheckoutPayment(reference) {
    if (!this.waveApiKey) {
      throw createHttpError(503, "Wave API is not configured yet.");
    }
    const safeReference = safeString(reference, 120);
    if (!safeReference) {
      throw createHttpError(400, "Wave payment reference is missing.");
    }
    const response = await fetch(
      `${this.waveBaseUrl}/v1/checkout/sessions/${encodeURIComponent(
        safeReference
      )}`,
      {
        headers: await this.buildWaveHeaders(),
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
  }

  async createMobileMoneyPayment(order, paymentMethod = "") {
    const method = normalizeMobileMoneyPaymentMethod(paymentMethod);
    if (method === "wave") {
      return this.createWaveCheckoutPayment(order);
    }
    if (method === "orange_money") {
      throw createHttpError(503, "Orange Money API is not configured yet.");
    }
    if (method === "mtn_money") {
      throw createHttpError(503, "MTN Money API is not configured yet.");
    }
    throw createHttpError(400, "Invalid Mobile Money payment method.");
  }

  async verifyGeniusPayWebhookSignature(request, rawBody) {
    if (!this.geniusPayWebhookSecret) {
      throw createHttpError(503, "GeniusPay webhook secret is not configured.");
    }

    const providedSignature = normalizeGeniusPaySignature(
      request.headers.get("X-Webhook-Signature")
    );
    const timestampHeader = safeString(
      request.headers.get("X-Webhook-Timestamp"),
      60
    );
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

    const expectedSignature = await hmacSha256Hex(
      `${timestampHeader}.${rawBody}`,
      this.geniusPayWebhookSecret
    );
    if (!constantTimeEqual(expectedSignature, providedSignature)) {
      throw createHttpError(401, "Invalid GeniusPay webhook signature.");
    }
  }

  isGeniusPayPaid(event, status) {
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
  }

  findGeniusPayOrder(orders, paymentData) {
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
        (reference && entry.payment?.provider === "geniuspay" && entry.payment.reference === reference)
    );
    return { order, orderId, reference };
  }

  applyGeniusPayWebhookToOrder(order, paymentData, event) {
    const current =
      order.payment && typeof order.payment === "object" ? order.payment : {};
    const status =
      safeString(paymentData.status || current.status, 40) || "pending";
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
      currency:
        safeString(paymentData.currency || current.currency, 12) || "XOF",
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
      environment:
        safeString(paymentData.environment || current.environment, 40) || null,
      expiresAt:
        safeString(paymentData.expires_at || paymentData.expiresAt || current.expiresAt, 60) ||
        null,
      updatedAt: now,
    };

    if (this.isGeniusPayPaid(event, status)) {
      payment.completedAt =
        safeString(paymentData.completed_at || paymentData.completedAt, 60) ||
        current.completedAt ||
        now;
    }

    order.payment = payment;
    return payment;
  }

  async getNewsletterSegmentId() {
    const cached = await this.state.storage.get(NEWSLETTER_SEGMENT_KEY);
    if (cached) return cached;

    const segments = await this.resendRequest(
      "/segments",
      {},
      this.resendNewsletterApiKey
    );
    let segment = segments.data?.find((item) => item.name === NEWSLETTER_SEGMENT_NAME);
    if (!segment) {
      segment = await this.resendRequest(
        "/segments",
        {
          method: "POST",
          body: JSON.stringify({ name: NEWSLETTER_SEGMENT_NAME }),
        },
        this.resendNewsletterApiKey
      );
    }
    await this.state.storage.put(NEWSLETTER_SEGMENT_KEY, segment.id);
    return segment.id;
  }

  async subscribeToNewsletter(email) {
    const segmentId = await this.getNewsletterSegmentId();
    try {
      await this.resendRequest(
        "/contacts",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            unsubscribed: false,
            segments: [{ id: segmentId }],
          }),
        },
        this.resendNewsletterApiKey
      );
    } catch (error) {
      if (error.status !== 409) throw error;
      await this.resendRequest(
        `/contacts/${encodeURIComponent(email)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ unsubscribed: false }),
        },
        this.resendNewsletterApiKey
      );
      await this.resendRequest(
        `/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,
        { method: "POST", body: "{}" },
        this.resendNewsletterApiKey
      ).catch((segmentError) => {
        if (segmentError.status !== 409) throw segmentError;
      });
    }
  }

  async sendNewsletterWelcome(email) {
    const welcomeKey = `${NEWSLETTER_WELCOME_PREFIX}${await sha256Hex(email)}`;
    if (await this.state.storage.get(welcomeKey)) return false;

    // Use the native Pages hostname in email CTAs so links still work when a
    // recipient's Wi-Fi resolver has a stale entry for the custom domain.
    const shopUrl = "https://newgbonhi.pages.dev/";
    const collectionsUrl = "https://newgbonhi.pages.dev/collections";
    const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      @media only screen and (max-width:620px){
        .shell{width:100%!important}.pad{padding-left:20px!important;padding-right:20px!important}
        .display{font-size:46px!important}.index-cell{display:block!important;width:auto!important;border-right:0!important;border-bottom:1px solid #363636!important}
        .cta{display:block!important;margin:0 0 10px!important;text-align:center!important}
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#0b0b0b;color:#f4f1e9;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b0b;background-image:linear-gradient(#242424 1px,transparent 1px),linear-gradient(90deg,#242424 1px,transparent 1px);background-size:42px 42px">
      <tr>
        <td align="center" style="padding:28px 12px 48px">
          <table class="shell" role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:620px;max-width:620px;border:1px solid #4a4a4a;background:#101010">
            <tr>
              <td class="pad" style="padding:18px 28px;border-bottom:1px solid #4a4a4a">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>${this.emailBrandMark("NEWGBONHI")}</td>
                    <td align="right" style="font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.18em;color:#ff3b30">ABIDJAN / 2026</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:56px 28px 22px;background:#f4f1e9;color:#0b0b0b">
                <p style="margin:0 0 18px;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:.22em;color:#e10600">NEWSLETTER / ENTRY 001</p>
                <h1 class="display" style="margin:0;font-size:64px;line-height:.84;letter-spacing:-.065em;color:#0b0b0b">TU ES<br>DANS LE<br>GBONHI.</h1>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:24px 28px 34px;background:#e10600;color:#ffffff">
                <p style="max-width:500px;margin:0 0 12px;font-size:22px;line-height:1.35;font-weight:900">Bienvenue dans la NewGbonhiFamily.</p>
                <p style="max-width:500px;margin:0;font-size:18px;line-height:1.5;font-weight:700">Ton acc&egrave;s est confirm&eacute;. D&eacute;sormais, tu re&ccedil;ois les drops, les collaborations et les mouvements du Lab avant le bruit.</p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #4a4a4a;border-bottom:1px solid #4a4a4a">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="index-cell" width="33.33%" valign="top" style="padding:22px 18px;border-right:1px solid #363636">
                      <p style="margin:0 0 28px;font-family:'Courier New',monospace;font-size:10px;color:#ff3b30">01</p>
                      <p style="margin:0;font-size:12px;font-weight:900;letter-spacing:.12em;color:#f4f1e9">DROPS<br>EN PREMIER</p>
                    </td>
                    <td class="index-cell" width="33.33%" valign="top" style="padding:22px 18px;border-right:1px solid #363636">
                      <p style="margin:0 0 28px;font-family:'Courier New',monospace;font-size:10px;color:#ff3b30">02</p>
                      <p style="margin:0;font-size:12px;font-weight:900;letter-spacing:.12em;color:#f4f1e9">LAB<br>&amp; R&Eacute;SIDENTS</p>
                    </td>
                    <td class="index-cell" width="33.33%" valign="top" style="padding:22px 18px">
                      <p style="margin:0 0 28px;font-family:'Courier New',monospace;font-size:10px;color:#ff3b30">03</p>
                      <p style="margin:0;font-size:12px;font-weight:900;letter-spacing:.12em;color:#f4f1e9">ABIDJAN<br>EN DIRECT</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:36px 28px 44px">
                <p style="margin:0 0 24px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.2em;color:#9d9d9d">DROP / 04 — &Agrave; LA UNE</p>
                <a class="cta" href="${shopUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-right:8px;padding:17px 22px;background:#f4f1e9;color:#0b0b0b;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.15em">VOIR LE DROP 04</a>
                <a class="cta" href="${collectionsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:16px 21px;border:1px solid #777;color:#f4f1e9;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.15em">LES ARCHIVES</a>
                <p style="margin:22px 0 0;font-family:'Courier New',monospace;font-size:10px;line-height:1.6;color:#858585">SI LE BOUTON NE S&rsquo;OUVRE PAS :<br><a href="${shopUrl}" target="_blank" rel="noopener noreferrer" style="color:#f4f1e9;text-decoration:underline">${shopUrl}</a></p>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:20px 28px;border-top:1px solid #4a4a4a;font-family:'Courier New',monospace;font-size:9px;line-height:1.8;letter-spacing:.12em;color:#858585">
                NEWGBONHI IS A LIVING ARCHIVE OF OBJECTS, PEOPLE AND IDEAS FROM ABIDJAN.<br>
                Tu peux te d&eacute;sabonner &agrave; tout moment depuis chaque prochaine newsletter.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    const text = [
      "TU ES DANS LE GBONHI.",
      "",
      "Bienvenue dans la NewGbonhiFamily.",
      "",
      "Ton accès est confirmé. Désormais, tu reçois les drops, les collaborations et les mouvements du Lab avant le bruit.",
      "",
      `Voir le Drop 04 : ${shopUrl}`,
      `Explorer les archives : ${collectionsUrl}`,
      "",
      "Tu peux te désabonner à tout moment depuis chaque prochaine newsletter.",
    ].join("\n");

    await this.resendRequest(
      "/emails",
      {
        method: "POST",
        body: JSON.stringify({
          from: this.newsletterFromEmail,
          to: [email],
          subject: "TU ES DANS LE GBONHI.",
          html,
          text,
        }),
      },
      this.resendNewsletterApiKey
    );
    await this.state.storage.put(welcomeKey, new Date().toISOString());
    return true;
  }

  async runNewsletterAutomation() {
    const feedUrl = this.env.NEWSLETTER_FEED_URL || "https://newgbonhi.com/newsletter-feed.json";
    const response = await fetch(feedUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Newsletter feed is unavailable.");
    const feed = await response.json();
    const items = Array.isArray(feed?.items) ? feed.items : [];
    const segmentId = await this.getNewsletterSegmentId();
    let sent = 0;

    for (const rawItem of items) {
      const item = {
        id: safeString(rawItem.id, 100),
        subject: safeString(rawItem.subject, 160),
        title: safeString(rawItem.title, 180),
        excerpt: safeString(rawItem.excerpt, 800),
        url: safeString(rawItem.url, 300),
        publishedAt: safeString(rawItem.publishedAt, 40),
        active: rawItem.active === true,
      };
      if (!item.active || !item.id || !item.subject || !item.title || !item.url) continue;
      if (item.publishedAt && Date.parse(item.publishedAt) > Date.now()) continue;
      const sentKey = `${NEWSLETTER_SENT_PREFIX}${item.id}`;
      if (await this.state.storage.get(sentKey)) continue;

      const safe = Object.fromEntries(
        Object.entries(item).map(([key, value]) => [key, escapeHtml(value)])
      );
      const html = `<div style="background:#0b0b0b;color:#f5f2ea;padding:40px;font-family:Arial,sans-serif">${this.emailBrandMark("NEWGBONHI / UPDATE")}<p style="margin-top:28px;color:#ef160d;letter-spacing:.18em">NEWSLETTER</p><h1 style="font-size:42px;line-height:1">${safe.title}</h1><p style="font-size:18px;line-height:1.6">${safe.excerpt}</p><p><a href="${safe.url}" style="display:inline-block;background:#f5f2ea;color:#0b0b0b;padding:16px 24px;text-decoration:none;font-weight:700">DÉCOUVRIR</a></p><p style="margin-top:40px;font-size:12px;color:#aaa">Tu reçois cet email car tu as rejoint la newsletter NewGbonhi. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#f5f2ea">Se désabonner</a></p></div>`;
      await this.resendRequest(
        "/broadcasts",
        {
          method: "POST",
          body: JSON.stringify({
            segment_id: segmentId,
            from: this.newsletterFromEmail,
            subject: item.subject,
            html,
          text: `${item.title}\n\n${item.excerpt}\n\n${item.url}\n\nDésabonnement : {{{RESEND_UNSUBSCRIBE_URL}}}`,
            send: true,
            name: `NewGbonhi - ${item.id}`,
          }),
        },
        this.resendNewsletterApiKey
      );
      await this.state.storage.put(sentKey, new Date().toISOString());
      sent += 1;
    }
    return sent;
  }

  async enforceLabRateLimit(request) {
    const forwardedFor = request.headers.get("CF-Connecting-IP") || "unknown";
    const fingerprint = await sha256Hex(forwardedFor);
    const key = `${LAB_RATE_PREFIX}${fingerprint}`;
    const lastSubmission = Number(await this.state.storage.get(key)) || 0;
    const now = Date.now();
    if (now - lastSubmission < LAB_RATE_LIMIT_MS) return false;
    await this.state.storage.put(key, now);
    return true;
  }

  async sendLabApplication(application) {
    if (!this.resendApiKey) {
      throw new Error("Lab email service is not configured.");
    }

    const safe = Object.fromEntries(
      Object.entries(application).map(([key, value]) => [key, escapeHtml(value)])
    );
    const text = [
      `Nom / projet: ${application.name}`,
      `Email: ${application.email}`,
      `Discipline: ${application.discipline}`,
      `Ville: ${application.city}`,
      `Lien: ${application.link}`,
      `Dossier: ${application.id}`,
      `Pacte accepté: ${application.pactVersion}`,
      `Signature numérique: ${application.pactSignedName}`,
      `Accepté le: ${application.pactAcceptedAt}`,
      "",
      application.pitch,
    ].join("\n");
    const html = `
      <h1>Nouvelle candidature NewGbonhi Lab</h1>
      <p><strong>Nom / projet :</strong> ${safe.name}</p>
      <p><strong>Email :</strong> ${safe.email}</p>
      <p><strong>Discipline :</strong> ${safe.discipline}</p>
      <p><strong>Ville :</strong> ${safe.city}</p>
      <p><strong>Portfolio :</strong> <a href="${safe.link}">${safe.link}</a></p>
      <p><strong>Dossier :</strong> ${safe.id}</p>
      <h2>Pacte d'entrée</h2>
      <p><strong>Version acceptée :</strong> ${safe.pactVersion}</p>
      <p><strong>Signature numérique :</strong> ${safe.pactSignedName}</p>
      <p><strong>Date d'acceptation :</strong> ${safe.pactAcceptedAt}</p>
      <h2>Presentation</h2>
      <p>${safe.pitch.replace(/\n/g, "<br>")}</p>
    `;
    const premiumHtml = `<!doctype html>
<html lang="fr">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      @media only screen and (max-width:620px){
        .shell{width:100%!important}.pad{padding-left:20px!important;padding-right:20px!important}
        .display{font-size:42px!important}.meta{display:block!important;width:auto!important;border-right:0!important;border-bottom:1px solid #363636!important}
        .action{display:block!important;width:auto!important;text-align:left!important}.cta{display:block!important;text-align:center!important;margin-top:18px!important}
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#0b0b0b;color:#f4f1e9;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b0b;background-image:linear-gradient(#242424 1px,transparent 1px),linear-gradient(90deg,#242424 1px,transparent 1px);background-size:42px 42px">
      <tr><td align="center" style="padding:28px 12px 48px">
        <table class="shell" role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:620px;max-width:620px;border:1px solid #4a4a4a;background:#101010">
          <tr><td class="pad" style="padding:18px 28px;border-bottom:1px solid #4a4a4a">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
              <td>${this.emailBrandMark("NEWGBONHI / LAB")}</td>
              <td align="right" style="font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.15em;color:#ff3b30">INBOX / NEW APPLICATION</td>
            </tr></table>
          </td></tr>
          <tr><td class="pad" style="padding:52px 28px 28px;background:#f4f1e9;color:#0b0b0b">
            <p style="margin:0 0 18px;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:.2em;color:#e10600">NOUVEAU DOSSIER / ${safe.id}</p>
            <h1 class="display" style="margin:0;font-size:57px;line-height:.88;letter-spacing:-.06em;color:#0b0b0b">UN PROJET<br>ENTRE DANS<br>LE LAB.</h1>
          </td></tr>
          <tr><td class="pad" style="padding:23px 28px;background:#e10600;color:#fff">
            <p style="margin:0 0 7px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.18em">CANDIDATURE &Agrave; &Eacute;TUDIER</p>
            <p style="margin:0;font-size:22px;line-height:1.3;font-weight:900">${safe.name}</p>
          </td></tr>
          <tr><td style="border-bottom:1px solid #4a4a4a">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
              <td class="meta" width="33.33%" valign="top" style="padding:21px 18px;border-right:1px solid #363636"><p style="margin:0 0 22px;font-family:'Courier New',monospace;font-size:10px;color:#ff3b30">01 / PROJET</p><p style="margin:0;font-size:12px;font-weight:900;line-height:1.45;letter-spacing:.08em">${safe.name}</p></td>
              <td class="meta" width="33.33%" valign="top" style="padding:21px 18px;border-right:1px solid #363636"><p style="margin:0 0 22px;font-family:'Courier New',monospace;font-size:10px;color:#ff3b30">02 / DISCIPLINE</p><p style="margin:0;font-size:12px;font-weight:900;line-height:1.45;letter-spacing:.08em">${safe.discipline}</p></td>
              <td class="meta" width="33.33%" valign="top" style="padding:21px 18px"><p style="margin:0 0 22px;font-family:'Courier New',monospace;font-size:10px;color:#ff3b30">03 / VILLE</p><p style="margin:0;font-size:12px;font-weight:900;line-height:1.45;letter-spacing:.08em">${safe.city}</p></td>
            </tr></table>
          </td></tr>
          <tr><td class="pad" style="padding:34px 28px;border-bottom:1px solid #4a4a4a">
            <p style="margin:0 0 12px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.2em;color:#ff3b30">PITCH / INTENTION</p>
            <p style="margin:0;font-size:17px;line-height:1.65;color:#f4f1e9">${safe.pitch.replace(/\n/g, "<br>")}</p>
          </td></tr>
          <tr><td class="pad" style="padding:28px;background:#f4f1e9;color:#0b0b0b;border-bottom:1px solid #4a4a4a">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
              <td class="action" valign="top"><p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.18em;color:#e10600">CONTACT / PORTFOLIO</p><p style="margin:0 0 6px;font-size:14px;font-weight:900"><a href="mailto:${safe.email}" style="color:#0b0b0b;text-decoration:none">${safe.email}</a></p><p style="margin:0;font-size:12px"><a href="${safe.link}" style="color:#0b0b0b">Voir le portfolio</a></p></td>
              <td class="action" align="right" valign="middle"><a class="cta" href="mailto:${safe.email}?subject=NewGbonhi%20Lab%20%2F%20${safe.id}" style="display:inline-block;padding:16px 20px;background:#0b0b0b;color:#fff;text-decoration:none;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:.1em">R&Eacute;PONDRE AU CR&Eacute;ATEUR</a></td>
            </tr></table>
          </td></tr>
          <tr><td class="pad" style="padding:28px;border-bottom:1px solid #4a4a4a">
            <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.18em;color:#ff3b30">PACTE D'ENTR&Eacute;E</p>
            <p style="margin:0 0 5px;font-size:14px;font-weight:900">SIGN&Eacute; / ${safe.pactVersion}</p>
            <p style="margin:0;font-size:12px;line-height:1.6;color:#aaa">Signature : ${safe.pactSignedName}<br>Accept&eacute; le : ${safe.pactAcceptedAt}</p>
          </td></tr>
          <tr><td class="pad" style="padding:24px 28px"><p style="margin:0;font-family:'Courier New',monospace;font-size:10px;line-height:1.7;letter-spacing:.14em;color:#777">DOSSIER ${safe.id} / NEWGBONHI LAB / ABIDJAN</p></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "NewGbonhi-Lab/1.0",
      },
      body: JSON.stringify({
        from: this.labFromEmail,
        to: [this.labToEmail],
        reply_to: application.email,
        subject: `[LAB / ${application.id}] Nouvelle candidature — ${application.name}`,
        text,
        html: premiumHtml,
      }),
    });
    if (!response.ok) {
      console.error("Resend rejected Lab application", response.status);
      throw new Error("Unable to send the Lab application.");
    }
  }

  async sendLabConfirmation(application) {
    if (!this.resendApiKey) {
      throw new Error("Lab email service is not configured.");
    }

    const safe = Object.fromEntries(
      Object.entries(application).map(([key, value]) => [key, escapeHtml(value)])
    );
    const labUrl = "https://newgbonhi.com/lab";
    const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      @media only screen and (max-width:620px){
        .shell{width:100%!important}.pad{padding-left:20px!important;padding-right:20px!important}
        .display{font-size:43px!important}.index-cell{display:block!important;width:auto!important;border-right:0!important;border-bottom:1px solid #363636!important}
        .cta{display:block!important;text-align:center!important}
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#0b0b0b;color:#f4f1e9;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b0b;background-image:linear-gradient(#242424 1px,transparent 1px),linear-gradient(90deg,#242424 1px,transparent 1px);background-size:42px 42px">
      <tr>
        <td align="center" style="padding:28px 12px 48px">
          <table class="shell" role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:620px;max-width:620px;border:1px solid #4a4a4a;background:#101010">
            <tr>
              <td class="pad" style="padding:18px 28px;border-bottom:1px solid #4a4a4a">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>${this.emailBrandMark("NEWGBONHI / LAB")}</td>
                    <td align="right" style="font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.18em;color:#ff3b30">ABIDJAN / OPEN CALL</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:54px 28px 28px;background:#f4f1e9;color:#0b0b0b">
                <p style="margin:0 0 18px;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:.22em;color:#e10600">DOSSIER / ${safe.id}</p>
                <h1 class="display" style="margin:0;font-size:61px;line-height:.86;letter-spacing:-.06em;color:#0b0b0b">TON DOSSIER<br>EST EN<br>REVUE.</h1>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:24px 28px 32px;background:#e10600;color:#ffffff">
                <p style="margin:0 0 8px;font-size:21px;line-height:1.35;font-weight:900">Merci ${safe.name}.</p>
                <p style="margin:0;font-size:17px;line-height:1.55;font-weight:700">Ta proposition et ton Pacte d'entr&eacute;e sign&eacute; ont bien &eacute;t&eacute; transmis &agrave; l'&eacute;quipe NewGbonhi. Ton dossier est maintenant enregistr&eacute; pour une revue &eacute;ditoriale.</p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #4a4a4a;border-bottom:1px solid #4a4a4a">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="index-cell" width="33.33%" valign="top" style="padding:22px 18px;border-right:1px solid #363636">
                      <p style="margin:0 0 26px;font-family:'Courier New',monospace;font-size:10px;color:#ff3b30">01 / DOSSIER</p>
                      <p style="margin:0;font-size:12px;font-weight:900;line-height:1.45;letter-spacing:.1em;color:#f4f1e9">${safe.id}</p>
                    </td>
                    <td class="index-cell" width="33.33%" valign="top" style="padding:22px 18px;border-right:1px solid #363636">
                      <p style="margin:0 0 26px;font-family:'Courier New',monospace;font-size:10px;color:#ff3b30">02 / DISCIPLINE</p>
                      <p style="margin:0;font-size:12px;font-weight:900;line-height:1.45;letter-spacing:.1em;color:#f4f1e9">${safe.discipline}</p>
                    </td>
                    <td class="index-cell" width="33.33%" valign="top" style="padding:22px 18px">
                      <p style="margin:0 0 26px;font-family:'Courier New',monospace;font-size:10px;color:#ff3b30">03 / PACTE</p>
                      <p style="margin:0;font-size:12px;font-weight:900;line-height:1.45;letter-spacing:.1em;color:#f4f1e9">SIGN&Eacute; / V.${safe.pactVersion}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:34px 28px;border-bottom:1px solid #4a4a4a;background:#101010">
                <p style="margin:0 0 22px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.18em;color:#ff3b30">PARCOURS / CANDIDATURE</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="34" valign="top" style="padding:0 0 22px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;color:#ff3b30">01</td>
                    <td valign="top" style="padding:0 0 22px;border-bottom:1px solid #363636"><strong style="display:block;font-size:12px;letter-spacing:.12em;color:#f4f1e9">DOSSIER RE&Ccedil;U</strong><span style="display:block;margin-top:7px;font-size:12px;line-height:1.5;color:#888">Projet et pacte enregistr&eacute;s.</span></td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:22px 0;font-family:'Courier New',monospace;font-size:10px;font-weight:700;color:#ff3b30">02</td>
                    <td valign="top" style="padding:22px 0;border-bottom:1px solid #363636"><strong style="display:block;font-size:12px;letter-spacing:.12em;color:#f4f1e9">REVUE &Eacute;DITORIALE</strong><span style="display:block;margin-top:7px;font-size:12px;line-height:1.5;color:#888">Nous regardons l'univers, l'intention et la faisabilit&eacute; du projet.</span></td>
                  </tr>
                  <tr>
                    <td width="34" valign="top" style="padding:22px 0 0;font-family:'Courier New',monospace;font-size:10px;font-weight:700;color:#777">03</td>
                    <td valign="top" style="padding:22px 0 0"><strong style="display:block;font-size:12px;letter-spacing:.12em;color:#777">RETOUR PAR EMAIL</strong><span style="display:block;margin-top:7px;font-size:12px;line-height:1.5;color:#777">Chaque dossier re&ccedil;oit une r&eacute;ponse apr&egrave;s sa revue.</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:34px 28px 42px">
                <p style="margin:0 0 22px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;line-height:1.7;letter-spacing:.14em;color:#999">CONSERVE TON NUM&Eacute;RO DE DOSSIER : ${safe.id}. TU PEUX R&Eacute;PONDRE DIRECTEMENT &Agrave; CET EMAIL SI UNE INFORMATION IMPORTANTE DOIT &Ecirc;TRE AJOUT&Eacute;E.</p>
                <a class="cta" href="${labUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:17px 22px;background:#f4f1e9;color:#0b0b0b;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.15em">SUIVRE LE LAB</a>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:20px 28px;border-top:1px solid #4a4a4a;font-family:'Courier New',monospace;font-size:9px;line-height:1.8;letter-spacing:.12em;color:#858585">
                NEWGBONHI IS A LIVING ARCHIVE OF OBJECTS, PEOPLE AND IDEAS FROM ABIDJAN.<br>
                RE&Ccedil;U DE CANDIDATURE / ${safe.id} / PACTE V.${safe.pactVersion}<br>
                Ce message confirme la bonne r&eacute;ception de ta candidature et de son acceptation du pacte.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    const text = [
      "TON DOSSIER EST EN REVUE.",
      "",
      `Merci ${application.name}. Ta proposition et ton pacte signé ont bien été transmis à l’équipe NewGbonhi.`,
      "",
      `Dossier : ${application.id}`,
      `Projet : ${application.name}`,
      `Discipline : ${application.discipline}`,
      `Ville : ${application.city}`,
      `Pacte : signé / version ${application.pactVersion}`,
      "",
      "01 — Dossier reçu",
      "02 — Revue éditoriale",
      "03 — Retour par email",
      "",
      `Suivre le Lab : ${labUrl}`,
    ].join("\n");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "NewGbonhi-Lab/1.0",
      },
      body: JSON.stringify({
        from: this.labFromEmail,
        to: [application.email],
        reply_to: this.labToEmail,
        subject: `[LAB / ${application.id}] Ton dossier est en revue`,
        text,
        html,
      }),
    });
    if (!response.ok) {
      console.error("Resend rejected Lab confirmation", response.status);
      throw new Error("Unable to send the Lab confirmation.");
    }
  }

  async sendOrderStatusEmail(order, status = order.status) {
    if (!this.resendApiKey || !order?.customer?.email) return false;

    const emailKey = `${ORDER_EMAIL_PREFIX}${order.id}.${status}`;
    if (await this.state.storage.get(emailKey)) return false;

    const states = {
      sent: {
        kicker: "COMMANDE / RECUE",
        title: "TA PIECE EST RESERVEE.",
        subject: `${order.id} — Commande reçue`,
        copy: "Ta précommande est bien enregistrée. Vérifie le récapitulatif ci-dessous, puis suis les instructions de paiement pour lancer la suite.",
      },
      paid_reported: {
        kicker: "PAIEMENT / SIGNALE",
        title: "TON PAIEMENT EST EN REVUE.",
        subject: `${order.id} — Paiement signalé`,
        copy: "Nous avons reçu ton signalement de paiement. L’équipe vérifie maintenant la transaction avant de valider la production.",
      },
      paid: {
        kicker: "PAIEMENT / CONFIRME",
        title: "PAIEMENT VALIDE.",
        subject: `${order.id} — Paiement confirmé`,
        copy: "Ton paiement est confirmé. La commande est maintenant prête à entrer dans le cycle de production NewGbonhi.",
      },
      production: {
        kicker: "COMMANDE / PRODUCTION",
        title: "TA PIECE PREND FORME.",
        subject: `${order.id} — Production lancée`,
        copy: "La production de ta commande est lancée. Nous préparons chaque pièce avant le contrôle final et la livraison.",
      },
      delivered: {
        kicker: "COMMANDE / LIVREE",
        title: "LE GBONHI EST CHEZ TOI.",
        subject: `${order.id} — Commande livrée`,
        copy: "Ta commande est marquée comme livrée. Merci de faire vivre NewGbonhi avec nous, dans la rue et au-delà.",
      },
    };
    const state = states[status];
    if (!state) return false;

    const money = (value) => `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
    const safeOrderId = escapeHtml(order.id);
    const safeFirstName = escapeHtml(order.customer.firstName);
    const safeShipping = escapeHtml(order.shipping?.label || "Livraison");
    const itemRows = order.items
      .map((item) => {
        const details = [item.selectedSize, item.selectedColor].filter(Boolean).join(" / ");
        return `<tr>
          <td style="padding:14px 0;border-bottom:1px solid #363636;font-size:13px;font-weight:800;line-height:1.35;color:#f4f1e9">${escapeHtml(item.title)}${details ? `<br><span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:.1em;color:#8f8f8f">${escapeHtml(details)}</span>` : ""}</td>
          <td align="center" style="padding:14px 8px;border-bottom:1px solid #363636;font-family:'Courier New',monospace;font-size:11px;color:#aaa">X${item.qty}</td>
          <td align="right" style="padding:14px 0;border-bottom:1px solid #363636;font-size:12px;font-weight:800;color:#f4f1e9">${money(item.price * item.qty)}</td>
        </tr>`;
      })
      .join("");
    const shopUrl = "https://newgbonhi.pages.dev/";
    const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>@media only screen and (max-width:620px){.shell{width:100%!important}.pad{padding-left:20px!important;padding-right:20px!important}.display{font-size:43px!important}.meta-cell{display:block!important;width:auto!important;border-right:0!important;border-bottom:1px solid #363636!important}.cta{display:block!important;text-align:center!important}}</style>
  </head>
  <body style="margin:0;padding:0;background:#0b0b0b;color:#f4f1e9;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0b0b0b;background-image:linear-gradient(#242424 1px,transparent 1px),linear-gradient(90deg,#242424 1px,transparent 1px);background-size:42px 42px">
      <tr><td align="center" style="padding:28px 12px 48px">
        <table class="shell" role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:620px;max-width:620px;border:1px solid #4a4a4a;background:#101010">
          <tr><td class="pad" style="padding:18px 28px;border-bottom:1px solid #4a4a4a"><table role="presentation" width="100%"><tr><td>${this.emailBrandMark("NEWGBONHI / ORDERS")}</td><td align="right" style="font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.16em;color:#ff3b30">${safeOrderId}</td></tr></table></td></tr>
          <tr><td class="pad" style="padding:52px 28px 28px;background:#f4f1e9;color:#0b0b0b"><p style="margin:0 0 18px;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:.2em;color:#e10600">${state.kicker}</p><h1 class="display" style="margin:0;font-size:59px;line-height:.86;letter-spacing:-.06em;color:#0b0b0b">${state.title}</h1></td></tr>
          <tr><td class="pad" style="padding:24px 28px 30px;background:#e10600;color:#fff"><p style="margin:0;font-size:18px;line-height:1.5;font-weight:700">${safeFirstName}, ${state.copy}</p></td></tr>
          <tr><td style="border-top:1px solid #4a4a4a;border-bottom:1px solid #4a4a4a"><table role="presentation" width="100%"><tr>
            <td class="meta-cell" width="33.33%" valign="top" style="padding:20px 18px;border-right:1px solid #363636"><p style="margin:0 0 20px;font-family:'Courier New',monospace;font-size:9px;color:#ff3b30">01 / REFERENCE</p><p style="margin:0;font-size:12px;font-weight:900;color:#f4f1e9">${safeOrderId}</p></td>
            <td class="meta-cell" width="33.33%" valign="top" style="padding:20px 18px;border-right:1px solid #363636"><p style="margin:0 0 20px;font-family:'Courier New',monospace;font-size:9px;color:#ff3b30">02 / LIVRAISON</p><p style="margin:0;font-size:12px;font-weight:900;color:#f4f1e9">${safeShipping}</p></td>
            <td class="meta-cell" width="33.33%" valign="top" style="padding:20px 18px"><p style="margin:0 0 20px;font-family:'Courier New',monospace;font-size:9px;color:#ff3b30">03 / TOTAL</p><p style="margin:0;font-size:12px;font-weight:900;color:#f4f1e9">${money(order.total)}</p></td>
          </tr></table></td></tr>
          <tr><td class="pad" style="padding:28px"><p style="margin:0 0 12px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.16em;color:#999">DETAILS / COMMANDE</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${itemRows}</table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px"><tr><td style="padding:5px 0;font-family:'Courier New',monospace;font-size:10px;color:#999">SOUS-TOTAL</td><td align="right" style="font-size:12px;font-weight:800;color:#f4f1e9">${money(order.subtotal)}</td></tr><tr><td style="padding:5px 0;font-family:'Courier New',monospace;font-size:10px;color:#999">LIVRAISON</td><td align="right" style="font-size:12px;font-weight:800;color:#f4f1e9">${money(order.shipping?.fee)}</td></tr><tr><td style="padding:13px 0 0;font-family:'Courier New',monospace;font-size:11px;font-weight:700;color:#ff3b30">TOTAL</td><td align="right" style="padding-top:13px;font-size:17px;font-weight:900;color:#f4f1e9">${money(order.total)}</td></tr></table>
          </td></tr>
          <tr><td class="pad" style="padding:6px 28px 40px"><a class="cta" href="${shopUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:17px 22px;background:#f4f1e9;color:#0b0b0b;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.15em">RETOURNER A NEWGBONHI</a></td></tr>
          <tr><td class="pad" style="padding:20px 28px;border-top:1px solid #4a4a4a;font-family:'Courier New',monospace;font-size:9px;line-height:1.8;letter-spacing:.12em;color:#858585">NEWGBONHI IS A LIVING ARCHIVE OF OBJECTS, PEOPLE AND IDEAS FROM ABIDJAN.<br>Pour toute question, réponds directement à cet email.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
    const text = [
      state.title,
      "",
      `${order.customer.firstName}, ${state.copy}`,
      "",
      `Reference : ${order.id}`,
      ...order.items.map((item) => `${item.qty} x ${item.title} — ${money(item.price * item.qty)}`),
      `Livraison : ${order.shipping?.label || "Livraison"} — ${money(order.shipping?.fee)}`,
      `Total : ${money(order.total)}`,
      "",
      shopUrl,
    ].join("\n");

    await this.resendRequest(
      "/emails",
      {
        method: "POST",
        headers: { "Idempotency-Key": emailKey },
        body: JSON.stringify({
          from: this.orderFromEmail,
          to: [order.customer.email],
          reply_to: this.labToEmail,
          subject: state.subject,
          html,
          text,
        }),
      },
      this.resendApiKey
    );
    await this.state.storage.put(emailKey, new Date().toISOString());
    return true;
  }

  async sendOrderTeamEmail(order, event = "created") {
    if (!this.resendApiKey || !this.orderToEmail || !order?.id) return false;

    const emailKey = `${ORDER_TEAM_EMAIL_PREFIX}${order.id}.${event}`;
    if (await this.state.storage.get(emailKey)) return false;

    const eventMeta = {
      created: {
        label: "Nouvelle commande",
        title: "NOUVELLE COMMANDE.",
        kicker: "ORDER / NEW",
        subject: `[ORDER / ${order.id}] Nouvelle commande`,
      },
      payment_reported: {
        label: "Paiement signale",
        title: "PAIEMENT SIGNALE.",
        kicker: "ORDER / PAYMENT REPORT",
        subject: `[ORDER / ${order.id}] Paiement signale`,
      },
      payment_confirmed: {
        label: "Paiement confirme",
        title: "PAIEMENT CONFIRME.",
        kicker: "ORDER / PAYMENT CONFIRMED",
        subject: `[ORDER / ${order.id}] Paiement confirme`,
      },
    }[event] || {
      label: event || "Commande",
      title: "MISE A JOUR COMMANDE.",
      kicker: "ORDER / UPDATE",
      subject: `[ORDER / ${order.id}] Mise a jour`,
    };
    const safeOrderId = escapeHtml(order.id);
    const safeDashboardUrl = escapeHtml(this.orderDashboardUrl);
    const safeEventLabel = escapeHtml(eventMeta.label);
    const title = eventMeta.title;
    const kicker = eventMeta.kicker;
    const subject = eventMeta.subject;
    const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>@media only screen and (max-width:620px){.shell{width:100%!important}.pad{padding-left:20px!important;padding-right:20px!important}.display{font-size:42px!important}.cta{display:block!important;text-align:center!important}}</style>
  </head>
  <body style="margin:0;padding:0;background:#f4f1e9;color:#0b0b0b;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1e9">
      <tr><td align="center" style="padding:28px 12px 48px">
        <table class="shell" role="presentation" width="620" cellspacing="0" cellpadding="0" style="width:620px;max-width:620px;border:1px solid #0b0b0b;background:#fff">
          <tr><td class="pad" style="padding:18px 28px;border-bottom:1px solid #0b0b0b"><table role="presentation" width="100%"><tr><td>${this.emailBrandMark("NEWGBONHI / ORDERS", "#0b0b0b")}</td><td align="right" style="font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.16em;color:#e10600">${safeOrderId}</td></tr></table></td></tr>
          <tr><td class="pad" style="padding:48px 28px 28px;background:#0b0b0b;color:#fff"><p style="margin:0 0 18px;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:.2em;color:#ff3b30">${kicker}</p><h1 class="display" style="margin:0;font-size:58px;line-height:.86;letter-spacing:-.05em;color:#fff">${title}</h1></td></tr>
          <tr><td class="pad" style="padding:28px;border-bottom:1px solid #0b0b0b;background:#f4f1e9"><p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:.16em;color:#e10600">REFERENCE / ACTION</p><p style="margin:0;font-size:15px;line-height:1.7;font-weight:800;color:#0b0b0b">Commande ${safeOrderId}<br>Evenement : ${safeEventLabel}</p></td></tr>
          <tr><td class="pad" style="padding:30px 28px 38px"><p style="margin:0 0 22px;font-size:14px;line-height:1.7;color:#333">Connecte-toi au dashboard admin pour voir les details client, les articles, les montants et valider la suite.</p><a class="cta" href="${safeDashboardUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:16px 22px;background:#0b0b0b;color:#fff;text-decoration:none;font-size:12px;font-weight:900;letter-spacing:.15em">OUVRIR LE DASHBOARD</a></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
    const text = [
      title,
      "",
      `Reference: ${order.id}`,
      `Evenement: ${eventMeta.label}`,
      "",
      "Les details client sont disponibles dans le dashboard admin.",
      this.orderDashboardUrl,
    ].join("\n");

    await this.resendRequest(
      "/emails",
      {
        method: "POST",
        headers: { "Idempotency-Key": emailKey },
        body: JSON.stringify({
          from: this.orderFromEmail,
          to: [this.orderToEmail],
          reply_to: order.customer?.email || this.labToEmail,
          subject,
          html,
          text,
        }),
      },
      this.resendApiKey
    );
    await this.state.storage.put(emailKey, new Date().toISOString());
    return true;
  }

  async loadOrders() {
    const orders = await this.state.storage.get(ORDERS_KEY);
    return Array.isArray(orders) ? orders : [];
  }

  async saveOrders(orders) {
    await this.state.storage.put(ORDERS_KEY, orders);
  }

  async loadAuditEntries() {
    const entries = await this.state.storage.get(AUDIT_KEY);
    return Array.isArray(entries) ? entries : [];
  }

  async appendAuditEntry(entry) {
    const entries = await this.loadAuditEntries();
    entries.push({
      timestamp: new Date().toISOString(),
      ...entry,
    });
    const trimmed = entries.slice(-500);
    await this.state.storage.put(AUDIT_KEY, trimmed);
  }

  async isAuthorized(request) {
    const token = extractBearerToken(request);
    if (!token) {
      return false;
    }
    const payload = await verifyJwt(token, this.jwtSecret);
    return Boolean(payload);
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
        if (!this.jwtSecret) {
          return json(500, { error: "Admin JWT secret is not configured." });
        }

        const payload = await parseJsonBody(request);
        const passwordFingerprint = await sha256Hex(payload.password);
        if (!constantTimeEqual(passwordFingerprint, ADMIN_PASSWORD_SHA256)) {
          return json(401, { error: "Incorrect password." });
        }

        const expiresAt = Date.now() + this.tokenTtlMs;
        const token = await signJwt(
          {
            sub: "newgbonhi-admin",
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(expiresAt / 1000),
          },
          this.jwtSecret
        );
        return json(200, { token, expiresAt });
      }

      if (method === "POST" && pathname === "/api/orders") {
        const payload = await parseJsonBody(request);
        const order = buildOrderFromDraft(payload);
        const orders = await this.loadOrders();
        orders.unshift(order);
        await this.saveOrders(orders);
        let emailSent = true;
        let teamEmailSent = true;
        try {
          await this.sendOrderStatusEmail(order, "sent");
        } catch (error) {
          emailSent = false;
          console.error("Unable to send order confirmation", error);
        }
        try {
          await this.sendOrderTeamEmail(order, "created");
        } catch (error) {
          teamEmailSent = false;
          console.error("Unable to send team order notification", error);
        }
        return json(201, { order, emailSent, teamEmailSent });
      }

      if (method === "POST" && pathname === "/api/lab-applications") {
        const payload = await parseJsonBody(request);
        const application = normalizeLabApplication(payload);
        if (application.isSpam) return json(202, { ok: true });
        application.id = `LAB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
        if (!(await this.enforceLabRateLimit(request))) {
          return json(429, { error: "Please wait before sending another application." });
        }
        await this.sendLabApplication(application);
        let confirmationSent = true;
        try {
          await this.sendLabConfirmation(application);
        } catch (error) {
          confirmationSent = false;
          console.error("Unable to send Lab applicant confirmation", error);
        }
        return json(202, { ok: true, confirmationSent, applicationId: application.id });
      }

      if (method === "POST" && pathname === "/api/newsletter/subscribe") {
        const payload = await parseJsonBody(request);
        const email = safeString(payload.email, 160).toLowerCase();
        const website = safeString(payload.website, 120);
        if (website) return json(202, { ok: true });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return json(400, { error: "Email address is invalid." });
        }
        await this.subscribeToNewsletter(email);
        const welcomeSent = await this.sendNewsletterWelcome(email);
        return json(201, { ok: true, welcomeSent });
      }

      if (method === "POST" && pathname === "/api/internal/newsletter/run") {
        const suppliedToken = request.headers.get("X-Internal-Token") || "";
        if (!this.jwtSecret || !constantTimeEqual(suppliedToken, this.jwtSecret)) {
          return json(401, { error: "Unauthorized." });
        }
        const sent = await this.runNewsletterAutomation();
        return json(200, { ok: true, sent });
      }

      if (
        method === "POST" &&
        pathname.match(/^\/api\/orders\/[^/]+\/mobile-money-payment$/)
      ) {
        const orderId = parseOrderIdFromPath(pathname, "mobile-money-payment");
        if (!orderId) {
          return json(400, { error: "Order id is missing." });
        }

        const payload = await parseOptionalJsonBody(request);
        const paymentMethod = normalizeMobileMoneyPaymentMethod(
          payload.paymentMethod || payload.payment_method || payload.provider
        );
        if (!paymentMethod) {
          return json(400, { error: "Invalid Mobile Money payment method." });
        }

        const orders = await this.loadOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
          return json(404, { error: "Order not found." });
        }

        this.assertPaymentToken(order, payload.paymentToken);

        if (isReusableMobileMoneyPayment(order.payment, paymentMethod)) {
          return json(200, {
            order,
            payment: publicMobileMoneyPayment(order.payment),
          });
        }

        const payment = await this.createMobileMoneyPayment(order, paymentMethod);
        order.payment = payment;
        await this.saveOrders(orders);
        await this.appendAuditEntry({
          orderId,
          previousStatus: order.status,
          nextStatus: order.status,
          actor: "customer",
          source: `${paymentMethod}-payment-created`,
          paymentReference: payment.reference,
        });
        return json(201, {
          order,
          payment: publicMobileMoneyPayment(order.payment),
        });
      }

      if (
        method === "POST" &&
        pathname.match(/^\/api\/orders\/[^/]+\/geniuspay-payment$/)
      ) {
        const orderId = parseOrderIdFromPath(pathname, "geniuspay-payment");
        if (!orderId) {
          return json(400, { error: "Order id is missing." });
        }

        const payload = await parseOptionalJsonBody(request);
        const paymentMethod = normalizeGeniusPayPaymentMethod(
          payload.paymentMethod || payload.payment_method
        );
        if ((payload.paymentMethod || payload.payment_method) && !paymentMethod) {
          return json(400, { error: "Invalid GeniusPay payment method." });
        }
        const orders = await this.loadOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
          return json(404, { error: "Order not found." });
        }

        this.assertPaymentToken(order, payload.paymentToken);

        if (isReusableGeniusPayPayment(order.payment, paymentMethod)) {
          return json(200, {
            order,
            payment: publicGeniusPayPayment(order.payment),
          });
        }

        const payment = await this.createGeniusPayPayment(order, paymentMethod);
        order.payment = payment;
        await this.saveOrders(orders);
        await this.appendAuditEntry({
          orderId,
          previousStatus: order.status,
          nextStatus: order.status,
          actor: "customer",
          source: "geniuspay-payment-created",
          paymentReference: payment.reference,
        });
        return json(201, {
          order,
          payment: publicGeniusPayPayment(order.payment),
        });
      }

      if (method === "POST" && pathname === "/api/payments/geniuspay/webhook") {
        const rawBody = await readTextBody(request);
        await this.verifyGeniusPayWebhookSignature(request, rawBody);

        let payload;
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch (error) {
          return json(400, { error: "Invalid JSON body." });
        }

        const event = safeString(
          request.headers.get("X-Webhook-Event") || payload.event || payload.type,
          80
        );
        const paymentData =
          payload?.data && typeof payload.data === "object"
            ? payload.data
            : payload && typeof payload === "object"
              ? payload
              : {};
        if (event === "webhook.test") {
          return json(200, { ok: true, event });
        }

        const orders = await this.loadOrders();
        const { order, orderId, reference } = this.findGeniusPayOrder(
          orders,
          paymentData
        );
        if (!order) {
          return json(404, { error: "Order not found." });
        }

        const previousStatus = order.status;
        const payment = this.applyGeniusPayWebhookToOrder(order, paymentData, event);
        if (this.isGeniusPayPaid(event, payment.status)) {
          order.status = "paid";
        }

        await this.saveOrders(orders);
        await this.appendAuditEntry({
          orderId: order.id || orderId,
          previousStatus,
          nextStatus: order.status,
          actor: "geniuspay",
          source: event || "geniuspay-webhook",
          paymentReference: payment.reference || reference,
        });

        if (previousStatus !== order.status && order.status === "paid") {
          try {
            await this.sendOrderStatusEmail(order, order.status);
          } catch (error) {
            console.error("Unable to send GeniusPay payment confirmation", error);
          }
          try {
            await this.sendOrderTeamEmail(order, "payment_confirmed");
          } catch (error) {
            console.error("Unable to send team GeniusPay notification", error);
          }
        }

        return json(200, {
          ok: true,
          orderId: order.id,
          status: order.status,
          paymentStatus: payment.status,
        });
      }

      if (
        method === "POST" &&
        pathname.match(/^\/api\/orders\/[^/]+\/geniuspay-sync$/)
      ) {
        if (!(await this.isAuthorized(request))) {
          return json(401, { error: "Unauthorized." });
        }

        const orderId = parseOrderIdFromPath(pathname, "geniuspay-sync");
        if (!orderId) {
          return json(400, { error: "Order id is missing." });
        }

        const orders = await this.loadOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
          return json(404, { error: "Order not found." });
        }

        if (order.payment?.provider !== "geniuspay" || !order.payment?.reference) {
          return json(400, { error: "GeniusPay payment reference is missing." });
        }

        const paymentData = await this.fetchGeniusPayPayment(
          order.payment.reference
        );
        const previousStatus = order.status;
        const payment = this.applyGeniusPayWebhookToOrder(
          order,
          paymentData,
          "payment.sync"
        );
        if (
          this.isGeniusPayPaid("payment.sync", payment.status) &&
          !["production", "delivered"].includes(order.status)
        ) {
          order.status = "paid";
        }

        await this.saveOrders(orders);
        await this.appendAuditEntry({
          orderId: order.id,
          previousStatus,
          nextStatus: order.status,
          actor: "admin",
          source: "geniuspay-sync",
          paymentReference: payment.reference,
        });

        if (previousStatus !== order.status && order.status === "paid") {
          try {
            await this.sendOrderStatusEmail(order, order.status);
          } catch (error) {
            console.error("Unable to send GeniusPay sync confirmation", error);
          }
          try {
            await this.sendOrderTeamEmail(order, "payment_confirmed");
          } catch (error) {
            console.error("Unable to send team GeniusPay sync notification", error);
          }
        }

        return json(200, { orders });
      }

      if (
        method === "POST" &&
        pathname.match(/^\/api\/orders\/[^/]+\/mobile-money-sync$/)
      ) {
        if (!(await this.isAuthorized(request))) {
          return json(401, { error: "Unauthorized." });
        }

        const orderId = parseOrderIdFromPath(pathname, "mobile-money-sync");
        if (!orderId) {
          return json(400, { error: "Order id is missing." });
        }

        const orders = await this.loadOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
          return json(404, { error: "Order not found." });
        }

        const provider = normalizeMobileMoneyPaymentMethod(
          order.payment?.provider || order.payment?.paymentMethod
        );
        if (provider !== "wave" || !order.payment?.reference) {
          return json(400, { error: "Wave payment reference is missing." });
        }
        if (order.payment.mode !== "api") {
          return json(400, { error: "This Wave payment uses the manual link." });
        }

        const paymentData = await this.fetchWaveCheckoutPayment(
          order.payment.reference
        );
        const previousStatus = order.status;
        const payment = this.applyWaveCheckoutToOrder(order, paymentData);
        if (
          isMobileMoneyPaid(payment.status) &&
          !["production", "delivered"].includes(order.status)
        ) {
          order.status = "paid";
        }

        await this.saveOrders(orders);
        await this.appendAuditEntry({
          orderId: order.id,
          previousStatus,
          nextStatus: order.status,
          actor: "admin",
          source: "wave-sync",
          paymentReference: payment.reference,
        });

        if (previousStatus !== order.status && order.status === "paid") {
          try {
            await this.sendOrderStatusEmail(order, order.status);
          } catch (error) {
            console.error("Unable to send Wave sync confirmation", error);
          }
          try {
            await this.sendOrderTeamEmail(order, "payment_confirmed");
          } catch (error) {
            console.error("Unable to send team Wave sync notification", error);
          }
        }

        return json(200, { orders });
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

        const previousStatus = order.status;
        if (previousStatus === "sent") {
          order.status = "paid_reported";
          await this.saveOrders(orders);
          await this.appendAuditEntry({
            orderId,
            previousStatus,
            nextStatus: order.status,
            actor: "customer",
            source: "report-payment",
          });
          try {
            await this.sendOrderStatusEmail(order, order.status);
          } catch (error) {
            console.error("Unable to send payment report email", error);
          }
          try {
            await this.sendOrderTeamEmail(order, "payment_reported");
          } catch (error) {
            console.error("Unable to send team payment report notification", error);
          }
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

        const previousStatus = orders[index].status;
        orders[index] = { ...orders[index], status };
        await this.saveOrders(orders);
        if (previousStatus !== status) {
          await this.appendAuditEntry({
            orderId,
            previousStatus,
            nextStatus: status,
            actor: "admin",
            source: "admin-status-update",
          });
          try {
            await this.sendOrderStatusEmail(orders[index], status);
          } catch (error) {
            console.error("Unable to send order status email", error);
          }
        }
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
      const status =
        Number.isInteger(error?.status) && error.status >= 400 && error.status < 600
          ? error.status
          : 400;
      return json(status, { error: message });
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
  async scheduled(controller, env, ctx) {
    const id = env.ORDERS_STORE.idFromName("global");
    const stub = env.ORDERS_STORE.get(id);
    ctx.waitUntil(
      stub.fetch(
        new Request("https://internal/api/internal/newsletter/run", {
          method: "POST",
          headers: { "X-Internal-Token": env.ADMIN_JWT_SECRET || env.ADMIN_PASSWORD || "" },
        })
      )
    );
  },
};
