const RAW_API_BASE = import.meta.env.VITE_API_BASE || "/api";
const DEFAULT_ERROR = "Orders service unavailable.";
const isGitHubPages =
  typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
const isCloudflarePages =
  typeof window !== "undefined" && window.location.hostname.endsWith("pages.dev");

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");
const stripEndpointSuffix = (value) =>
  String(value || "").replace(/\/(orders(?:\/.*)?|admin\/login)$/i, "");

const buildApiBaseCandidates = (rawBase) => {
  const cleaned = trimTrailingSlash(rawBase || "/api") || "/api";
  const stripped = trimTrailingSlash(stripEndpointSuffix(cleaned)) || cleaned;
  const candidates = new Set([cleaned, stripped]);

  if (!/\/api$/i.test(cleaned)) {
    candidates.add(`${cleaned}/api`);
  }

  if (!/\/api$/i.test(stripped)) {
    candidates.add(`${stripped}/api`);
  }

  // Local fallback for vite proxy when env is misconfigured.
  if (!/^https?:\/\//i.test(cleaned)) {
    candidates.add("/api");
  }

  const resolved = Array.from(candidates);

  // Prefer the same-origin Pages Function proxy in production. Some mobile
  // networks and privacy filters block direct workers.dev requests.
  if (isCloudflarePages) {
    return ["/api", ...resolved.filter((candidate) => candidate !== "/api")];
  }

  return resolved;
};

const API_BASE_CANDIDATES = buildApiBaseCandidates(RAW_API_BASE);

const ensureApiConfigured = () => {
  if (isGitHubPages && !import.meta.env.VITE_API_BASE) {
    throw new Error("API is not configured. Set VITE_API_BASE in GitHub.");
  }
};

const parseResponse = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const request = async (path, options = {}, token = "") => {
  ensureApiConfigured();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let lastError = null;

  for (const base of API_BASE_CANDIDATES) {
    let response;
    try {
      response = await fetch(`${base}${normalizedPath}`, {
        ...options,
        headers,
      });
    } catch (error) {
      lastError = error;
      continue;
    }

    const payload = await parseResponse(response);
    if (response.ok) {
      return payload || {};
    }

    const message =
      payload && typeof payload.error === "string" && payload.error
        ? payload.error
        : DEFAULT_ERROR;

    // Try next candidate if backend says route mismatch.
    if (response.status === 404 && message === "Route not found.") {
      lastError = new Error(message);
      continue;
    }

    throw new Error(message);
  }

  throw new Error(
    lastError instanceof Error && lastError.message
      ? lastError.message
      : DEFAULT_ERROR
  );
};

export const createOrder = async (orderDraft) => {
  const payload = await request("/orders", {
    method: "POST",
    body: JSON.stringify(orderDraft),
  });
  return payload.order || null;
};

export const reportOrderPaid = async (orderId, paymentToken = "") => {
  const payload = await request(
    `/orders/${encodeURIComponent(orderId)}/report-payment`,
    {
      method: "POST",
      body: JSON.stringify({ paymentToken }),
    }
  );
  return payload.order || null;
};

export const createGeniusPayPayment = async (
  orderId,
  paymentToken = "",
  paymentMethod = ""
) => {
  const payload = await request(
    `/orders/${encodeURIComponent(orderId)}/geniuspay-payment`,
    {
      method: "POST",
      body: JSON.stringify({ paymentToken, paymentMethod }),
    }
  );
  return {
    order: payload.order || null,
    payment: payload.payment || null,
  };
};

export const adminLogin = async (password) => {
  const payload = await request("/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  return {
    token: payload.token || "",
    expiresAt: payload.expiresAt || 0,
  };
};

export const loadOrders = async (token) => {
  const payload = await request("/orders", { method: "GET" }, token);
  return Array.isArray(payload.orders) ? payload.orders : [];
};

export const updateOrderStatus = async (orderId, status, token) => {
  const payload = await request(
    `/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    token
  );
  return Array.isArray(payload.orders) ? payload.orders : [];
};

export const syncGeniusPayPayment = async (orderId, token) => {
  const payload = await request(
    `/orders/${encodeURIComponent(orderId)}/geniuspay-sync`,
    {
      method: "POST",
    },
    token
  );
  return Array.isArray(payload.orders) ? payload.orders : [];
};

export const deleteOrder = async (orderId, token) => {
  const payload = await request(
    `/orders/${encodeURIComponent(orderId)}`,
    {
      method: "DELETE",
    },
    token
  );
  return Array.isArray(payload.orders) ? payload.orders : [];
};

