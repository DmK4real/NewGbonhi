const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const DEFAULT_ERROR = "Orders service unavailable.";
const isGitHubPages =
  typeof window !== "undefined" && window.location.hostname.endsWith("github.io");

const ensureApiConfigured = () => {
  if (isGitHubPages && !import.meta.env.VITE_API_BASE) {
    throw new Error("API non configuree. Definis VITE_API_BASE dans GitHub.");
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

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string" && payload.error
        ? payload.error
        : DEFAULT_ERROR;
    throw new Error(message);
  }

  return payload || {};
};

export const createOrder = async (orderDraft) => {
  const payload = await request("/orders", {
    method: "POST",
    body: JSON.stringify(orderDraft),
  });
  return payload.order || null;
};

export const reportOrderPaid = async (orderId) => {
  const payload = await request(
    `/orders/${encodeURIComponent(orderId)}/report-payment`,
    { method: "POST" }
  );
  return payload.order || null;
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
