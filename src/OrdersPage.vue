<template>
  <div class="orders-page">
    <header class="shop-header">
      <div class="brand">
        <img class="brand-logo" :src="logoUrl" alt="NewGbonhi logo" />
        <div class="brand-meta">
          <p class="brand-name">NewGbonhi</p>
          <p class="brand-tagline">Drop 02 // In preparation</p>
        </div>
      </div>
      <nav class="shop-nav" aria-label="Primary">
        <RouterLink :class="{ 'is-active': $route.name === 'shop' }" to="/">
          Shop
        </RouterLink>
        <RouterLink
          :class="{ 'is-active': $route.name === 'lookbook' }"
          to="/lookbook"
        >
          Lookbook
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'about' }" to="/about">
          About
        </RouterLink>
        <RouterLink :class="{ 'is-active': $route.name === 'orders' }" to="/orders">
          Orders
        </RouterLink>
      </nav>
      <button class="shop-cta" type="button" @click="toggleCart">
        Cart ({{ cartCount }})
      </button>
    </header>

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <main class="orders-main">
      <div class="orders-head">
        <p>Orders</p>
        <div class="orders-title">
          <h1>Order history</h1>
          <button v-if="isAuthorized" class="ghost-button" type="button" @click="logout">
            Logout
          </button>
        </div>
      </div>

      <div v-if="!isAuthorized" class="orders-login">
        <p>Admin access required</p>
        <p class="orders-hint">Password verification is handled by the API.</p>
        <form @submit.prevent="unlock">
          <input
            v-model.trim="adminPasswordInput"
            type="password"
            placeholder="Admin password"
            :disabled="isLoading"
          />
          <button class="pay-button" type="submit" :disabled="!canUnlock">
            {{ isLoading ? "Loading..." : "Unlock" }}
          </button>
        </form>
        <p v-if="authError" class="orders-error">{{ authError }}</p>
      </div>

      <div v-else-if="isLoading" class="orders-empty">
        Loading orders...
      </div>

      <div v-else-if="orders.length === 0" class="orders-empty">
        No orders yet.
      </div>

      <section v-else class="orders-grid">
        <article v-for="order in orders" :key="order.id" class="order-card">
          <header>
            <div>
              <h2>{{ order.id }}</h2>
              <p>{{ formatDate(order.createdAt) }}</p>
            </div>
            <span class="order-status" :class="order.status">
              {{ formatStatus(order.status) }}
            </span>
          </header>

          <div class="order-body">
            <p class="order-name">
              {{ order.customer.firstName }} {{ order.customer.lastName }}
            </p>
            <p class="order-contact">
              {{ order.customer.phone }} - {{ order.customer.email }}
            </p>
            <p class="order-address">
              {{ order.customer.address }}, {{ order.customer.city }}
            </p>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.key" class="order-item">
              <span>
                {{ item.title }}
                <em v-if="item.selectedSize">({{ item.selectedSize }})</em>
              </span>
              <span>x{{ item.qty }}</span>
              <strong>{{ formatPrice(item.qty * item.price) }}</strong>
            </div>
          </div>

          <div class="order-summary">
            <div>
              <span>Subtotal</span>
              <strong>{{ formatPrice(order.subtotal) }}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{{ formatPrice(order.shipping?.fee || 0) }}</strong>
            </div>
            <div class="order-total">
              <span>Total</span>
              <strong>{{ formatPrice(order.total) }}</strong>
            </div>
          </div>

          <footer class="order-actions">
            <button type="button" class="ghost-button" @click="copyOrder(order)">
              Copy summary
            </button>
            <button
              type="button"
              class="pay-button"
              :disabled="isSaving"
              @click="markPaid(order)"
            >
              Mark as paid
            </button>
            <button
              type="button"
              class="delete-button"
              :disabled="isSaving"
              @click="removeOrder(order)"
            >
              Delete
            </button>
          </footer>
        </article>
      </section>
    </main>

    <footer class="shop-footer" id="contact">
      <p>Copyright 2026 NewGbonhi. All rights reserved.</p>
      <div class="footer-links">
        <a
          href="https://www.instagram.com/new.gbonhi?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        <a
          href="https://www.tiktok.com/@new_gbonhi0?is_from_webapp=1&sender_device=pc"
          target="_blank"
          rel="noopener noreferrer"
        >
          TikTok
        </a>
        <a href="mailto:hello@newgbonhi.com">Email</a>
      </div>
    </footer>
  </div>
</template>

<script>
import CartPanel from "./components/CartPanel.vue";
import { cartStore } from "./data/cart.js";
import {
  adminLogin,
  deleteOrder,
  loadOrders,
  updateOrderStatus,
} from "./data/orders.js";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;
const AUTH_KEY = "newgbonhi.orders.token";

export default {
  name: "OrdersPage",
  components: {
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      cartOpen: false,
      orders: [],
      adminPasswordInput: "",
      authError: "",
      isAuthorized: false,
      adminToken: "",
      isLoading: false,
      isSaving: false,
    };
  },
  async created() {
    const savedToken = window.sessionStorage.getItem(AUTH_KEY) || "";
    if (!savedToken) {
      return;
    }
    this.adminToken = savedToken;
    this.isAuthorized = true;
    this.isLoading = true;
    try {
      this.orders = await loadOrders(this.adminToken);
    } catch (error) {
      this.authError =
        error instanceof Error ? error.message : "Unable to load orders.";
      this.logout(false);
    } finally {
      this.isLoading = false;
    }
  },
  computed: {
    cartCount() {
      return cartStore.cartCount.value;
    },
    canUnlock() {
      return Boolean(this.adminPasswordInput) && !this.isLoading;
    },
  },
  methods: {
    toggleCart() {
      this.cartOpen = !this.cartOpen;
    },
    formatPrice(value) {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return "";
      }
      const formatted = new Intl.NumberFormat("fr-CI", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(value);
      return `${formatted} FCFA`;
    },
    formatDate(value) {
      if (!value) {
        return "";
      }
      const date = new Date(value);
      return new Intl.DateTimeFormat("fr-CI", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    },
    formatStatus(status) {
      const map = {
        sent: "Sent",
        paid_reported: "Paid (reported)",
        paid: "Paid",
        delivered: "Delivered",
      };
      return map[status] || status || "Sent";
    },
    buildOrderSummary(order) {
      const lines = [
        "NewGbonhi Order",
        `Order ID: ${order.id}`,
        `Name: ${order.customer.firstName} ${order.customer.lastName}`,
        `Phone: ${order.customer.phone}`,
        `Email: ${order.customer.email}`,
        `Address: ${order.customer.address}, ${order.customer.city}`,
        `Delivery: ${order.shipping?.label || "-"} (${this.formatPrice(
          order.shipping?.fee || 0
        )})`,
        "Items:",
      ];

      order.items.forEach((item) => {
        const sizeText = item.selectedSize ? ` (${item.selectedSize})` : "";
        lines.push(
          `- ${item.title}${sizeText} x${item.qty} = ${this.formatPrice(
            item.qty * item.price
          )}`
        );
      });

      lines.push(`Total: ${this.formatPrice(order.total)}`);
      lines.push("Thank you.");
      return lines.join("\n");
    },
    async copyOrder(order) {
      try {
        await navigator.clipboard.writeText(this.buildOrderSummary(order));
      } catch (error) {
        // noop
      }
    },
    async markPaid(order) {
      if (this.isSaving || !this.adminToken) {
        return;
      }
      this.authError = "";
      this.isSaving = true;
      try {
        this.orders = await updateOrderStatus(order.id, "paid", this.adminToken);
      } catch (error) {
        this.authError =
          error instanceof Error ? error.message : "Unable to update order.";
      } finally {
        this.isSaving = false;
      }
    },
    async removeOrder(order) {
      if (this.isSaving || !this.adminToken) {
        return;
      }
      const confirmed = window.confirm(
        `Delete order ${order.id}? This cannot be undone.`
      );
      if (!confirmed) {
        return;
      }
      this.authError = "";
      this.isSaving = true;
      try {
        this.orders = await deleteOrder(order.id, this.adminToken);
      } catch (error) {
        this.authError =
          error instanceof Error ? error.message : "Unable to delete order.";
      } finally {
        this.isSaving = false;
      }
    },
    async unlock() {
      this.authError = "";
      if (!this.adminPasswordInput) {
        this.authError = "Password is required.";
        return;
      }
      this.isLoading = true;
      try {
        const session = await adminLogin(this.adminPasswordInput);
        if (!session.token) {
          throw new Error("Unable to open admin session.");
        }
        this.adminToken = session.token;
        this.isAuthorized = true;
        window.sessionStorage.setItem(AUTH_KEY, session.token);
        this.adminPasswordInput = "";
        this.orders = await loadOrders(this.adminToken);
      } catch (error) {
        this.authError =
          error instanceof Error ? error.message : "Unable to authenticate.";
      } finally {
        this.isLoading = false;
      }
    },
    logout(clearError = true) {
      this.isAuthorized = false;
      this.adminToken = "";
      window.sessionStorage.removeItem(AUTH_KEY);
      this.adminPasswordInput = "";
      this.orders = [];
      if (clearError) {
        this.authError = "";
      }
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&display=swap");

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: "Space Grotesk", Arial, sans-serif;
  background: #f5f5f5;
  color: #0b0b0b;
}

.orders-page {
  --text: #0b0b0b;
  --muted: #606060;
  --accent: #e10600;
  --line: #0b0b0b;

  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  position: relative;
  z-index: 0;
}

.orders-page::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.04),
      rgba(0, 0, 0, 0.04) 1px,
      transparent 1px,
      transparent 48px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.04),
      rgba(0, 0, 0, 0.04) 1px,
      transparent 1px,
      transparent 48px
    );
  pointer-events: none;
  z-index: -1;
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  animation: rise 0.6s ease both;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.brand-name {
  margin: 0;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
  font-size: 20px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-tagline {
  margin: 2px 0 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--muted);
}

.shop-nav {
  display: flex;
  gap: 18px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}

.shop-nav::-webkit-scrollbar {
  display: none;
}

.shop-nav a {
  color: inherit;
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
}

.shop-nav a.is-active {
  border-color: var(--accent);
}

.shop-cta {
  border: 1px solid var(--line);
  background: #fff;
  padding: 10px 16px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.shop-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.orders-main {
  margin-top: 32px;
}

.orders-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.orders-head h1 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.orders-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.orders-login {
  margin-top: 18px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 18px;
  background: #fff;
  display: grid;
  gap: 12px;
}

.orders-login p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
}

.orders-login form {
  display: grid;
  gap: 10px;
}

.orders-login input {
  border: 1px solid rgba(0, 0, 0, 0.3);
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
}

.orders-hint {
  color: var(--muted);
  letter-spacing: 0.12em;
  font-size: 10px;
}

.orders-error {
  margin: 0;
  color: #a00000;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
}

.orders-empty {
  margin-top: 18px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 24px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
  color: var(--muted);
  background: #fff;
}

.orders-grid {
  margin-top: 20px;
  display: grid;
  gap: 20px;
}

.order-card {
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 18px;
  background: #fff;
  padding: 18px;
  display: grid;
  gap: 16px;
  animation: rise 0.6s ease both;
}

.order-card header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.order-card h2 {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 14px;
}

.order-card header p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}

.order-status {
  padding: 6px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.order-status.sent {
  background: #fef2f2;
}

.order-status.paid_reported {
  background: #fff4d6;
}

.order-status.paid {
  background: #e7f8ed;
}

.order-status.delivered {
  background: #e7f0ff;
}

.order-body {
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: var(--muted);
}

.order-name {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
  color: #0b0b0b;
}

.order-contact,
.order-address {
  margin: 0;
}

.order-items {
  display: grid;
  gap: 6px;
}

.order-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.order-item strong {
  font-weight: 600;
}

.order-summary {
  border-top: 1px solid rgba(0, 0, 0, 0.15);
  padding-top: 12px;
  display: grid;
  gap: 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.order-summary div {
  display: flex;
  justify-content: space-between;
}

.order-total {
  font-weight: 700;
}

.order-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pay-button {
  border: 1px solid var(--line);
  background: #0b0b0b;
  color: #fff;
  padding: 10px 14px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
  cursor: pointer;
}

.ghost-button {
  border: 1px solid var(--line);
  background: #fff;
  color: #0b0b0b;
  padding: 10px 14px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
  cursor: pointer;
}

.delete-button {
  border: 1px solid #a00000;
  background: #fff5f5;
  color: #a00000;
  padding: 10px 14px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
  cursor: pointer;
}

.shop-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  animation: rise 0.9s ease both;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links a {
  color: inherit;
  text-decoration: none;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 700px) {
  .orders-page {
    padding: 24px 16px 40px;
  }

  .shop-header {
    align-items: flex-start;
  }

  .shop-cta {
    width: 100%;
  }

  .order-card header {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-item {
    grid-template-columns: 1fr;
  }

  .order-contact,
  .order-address,
  .order-item span,
  .order-item strong {
    overflow-wrap: anywhere;
  }

  .order-summary div {
    gap: 8px;
    flex-wrap: wrap;
  }

  .order-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .order-actions .pay-button,
  .order-actions .ghost-button,
  .order-actions .delete-button {
    width: 100%;
  }
}
</style>
