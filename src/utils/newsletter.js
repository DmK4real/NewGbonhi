export async function subscribeToNewsletter(email, website = "") {
  const apiBase = String(import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${apiBase}/api/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), website }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Newsletter subscription failed.");
    const result = await response.json();
    if (result.ok !== true) throw new Error("Newsletter subscription was not confirmed.");
    return result;
  } finally {
    clearTimeout(timeout);
  }
}
