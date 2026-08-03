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
  };

  if (application.company) return { ...application, isSpam: true };

  if (
    !application.name ||
    !application.email ||
    !application.discipline ||
    !application.city ||
    !application.link ||
    !application.pitch
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

  get labFromEmail() {
    return this.env.LAB_FROM_EMAIL || "NewGbonhi Lab <lab@newgbonhi.com>";
  }

  get newsletterFromEmail() {
    return this.env.NEWSLETTER_FROM_EMAIL || "NewGbonhi <news@newgbonhi.com>";
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
                    <td style="font-size:15px;font-weight:900;letter-spacing:-.03em;color:#f4f1e9">NEWGBONHI</td>
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
                <p style="margin:22px 0 0;font-family:'Courier New',monospace;font-size:10px;line-height:1.6;color:#858585">SI LE BOUTON NE S'OUVRE PAS :<br><a href="${shopUrl}" target="_blank" rel="noopener noreferrer" style="color:#f4f1e9;text-decoration:underline">${shopUrl}</a></p>
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
      "Ton acces est confirme. Desormais, tu recois les drops, les collaborations et les mouvements du Lab avant le bruit.",
      "",
      `Voir le Drop 04 : ${shopUrl}`,
      `Explorer les archives : ${collectionsUrl}`,
      "",
      "Tu peux te desabonner a tout moment depuis chaque prochaine newsletter.",
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
      const html = `<div style="background:#0b0b0b;color:#f5f2ea;padding:40px;font-family:Arial,sans-serif"><p style="color:#ef160d;letter-spacing:.18em">NEWGBONHI / UPDATE</p><h1 style="font-size:42px;line-height:1">${safe.title}</h1><p style="font-size:18px;line-height:1.6">${safe.excerpt}</p><p><a href="${safe.url}" style="display:inline-block;background:#f5f2ea;color:#0b0b0b;padding:16px 24px;text-decoration:none;font-weight:700">DECOUVRIR</a></p><p style="margin-top:40px;font-size:12px;color:#aaa">Tu recois cet email car tu as rejoint la newsletter NewGbonhi. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#f5f2ea">Se desabonner</a></p></div>`;
      await this.resendRequest(
        "/broadcasts",
        {
          method: "POST",
          body: JSON.stringify({
            segment_id: segmentId,
            from: this.newsletterFromEmail,
            subject: item.subject,
            html,
            text: `${item.title}\n\n${item.excerpt}\n\n${item.url}\n\nDesabonnement: {{{RESEND_UNSUBSCRIBE_URL}}}`,
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
      <h2>Presentation</h2>
      <p>${safe.pitch.replace(/\n/g, "<br>")}</p>
    `;
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
        subject: `Candidature Lab - ${application.name}`,
        text,
        html,
      }),
    });
    if (!response.ok) {
      console.error("Resend rejected Lab application", response.status);
      throw new Error("Unable to send the Lab application.");
    }
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
        return json(201, { order });
      }

      if (method === "POST" && pathname === "/api/lab-applications") {
        const payload = await parseJsonBody(request);
        const application = normalizeLabApplication(payload);
        if (application.isSpam) return json(202, { ok: true });
        if (!(await this.enforceLabRateLimit(request))) {
          return json(429, { error: "Please wait before sending another application." });
        }
        await this.sendLabApplication(application);
        return json(202, { ok: true });
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
