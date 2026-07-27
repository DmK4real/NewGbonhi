<template>
  <div class="orders-page">
    <SiteHeader @toggle-cart="toggleCart" />

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <main class="orders-main">
      <div class="orders-head">
        <div class="orders-index"><span>ADMIN / ORDERS</span><span>NEWGBONHI / 2026</span></div>
        <p>{{ $t("navOrders") }}</p>
        <div class="orders-title">
          <h1>{{ $t("orderHistory") }}</h1>
          <button v-if="isAuthorized" class="ghost-button" type="button" @click="logout">
            {{ $t("logout") }}
          </button>
        </div>
      </div>

      <section v-if="isAuthorized" class="orders-stats" aria-label="Order overview">
        <article><span>ALL</span><strong>{{ orders.length }}</strong></article>
        <article><span>TO VALIDATE</span><strong>{{ pendingOrders }}</strong></article>
        <article><span>PRODUCTION</span><strong>{{ productionOrders }}</strong></article>
        <article><span>DELIVERED</span><strong>{{ deliveredOrders }}</strong></article>
      </section>

      <div v-if="!isAuthorized" class="orders-login">
        <p>{{ $t("adminRequired") }}</p>
        <p class="orders-hint">{{ $t("adminHint") }}</p>
        <form @submit.prevent="unlock">
          <input
            v-model.trim="adminPasswordInput"
            type="password"
            :placeholder="$t('adminPassword')"
            :disabled="isLoading"
          />
          <button class="pay-button" type="submit" :disabled="!canUnlock">
            {{ isLoading ? $t("loading") : $t("unlock") }}
          </button>
        </form>
        <p v-if="authError" class="orders-error">{{ authError }}</p>
      </div>

      <div v-else-if="isLoading" class="orders-empty">
        {{ $t("loadingOrders") }}
      </div>

      <div v-else-if="orders.length === 0" class="orders-empty">
        {{ $t("noOrders") }}
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

          <div v-if="order.fulfillment" class="order-fulfillment">
            <span>{{ $t("preorderBadge") }}</span>
            <strong>
              {{ order.fulfillment.productionWindow || $t("productionAfterPayment") }}
            </strong>
            <p>
              {{ $t("deliveryWindow") }}:
              {{ order.fulfillment.deliveryWindow || $t("deliveryWindow48h72h") }}
            </p>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.key" class="order-item">
              <span>
                {{ item.title }}
                <em v-if="item.selectedSize">({{ item.selectedSize }})</em>
                <em v-if="item.selectedColor"> - {{ item.selectedColor }}</em>
                <em v-if="item.selectedDesignName"> - {{ item.selectedDesignName }}</em>
                <em v-if="item.preorder"> - {{ $t("preorderBadge") }}</em>
              </span>
              <span>x{{ item.qty }}</span>
              <strong>{{ formatPrice(item.qty * item.price) }}</strong>
            </div>
          </div>

          <div class="order-summary">
            <div>
              <span>{{ $t("subtotal") }}</span>
              <strong>{{ formatPrice(order.subtotal) }}</strong>
            </div>
            <div>
              <span>{{ $t("delivery") }}</span>
              <strong>{{ formatPrice(order.shipping?.fee || 0) }}</strong>
            </div>
            <div class="order-total">
              <span>{{ $t("total") }}</span>
              <strong>{{ formatPrice(order.total) }}</strong>
            </div>
          </div>

          <footer class="order-actions">
            <button type="button" class="ghost-button" @click="copyOrder(order)">
              {{ $t("copySummary") }}
            </button>
            <button
              v-if="order.status !== 'production' && order.status !== 'delivered'"
              type="button"
              class="pay-button"
              :disabled="isSaving"
              @click="advanceOrder(order)"
            >
              {{ primaryActionLabel(order) }}
            </button>
            <button
              v-if="order.status === 'production'"
              type="button"
              class="pay-button"
              :disabled="isSaving"
              @click="markDelivered(order)"
            >
              {{ $t("markDelivered") }}
            </button>
            <button
              type="button"
              class="delete-button"
              :disabled="isSaving"
              @click="removeOrder(order)"
            >
              {{ $t("delete") }}
            </button>
          </footer>
        </article>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script>
import SiteHeader from "./components/SiteHeader.vue";
import CartPanel from "./components/CartPanel.vue";
import { cartStore } from "./data/cart.ts";
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
    SiteHeader,
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
    pendingOrders() {
      return this.orders.filter((order) => ["sent", "paid_reported", "paid"].includes(order.status)).length;
    },
    productionOrders() {
      return this.orders.filter((order) => order.status === "production").length;
    },
    deliveredOrders() {
      return this.orders.filter((order) => order.status === "delivered").length;
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
        sent: this.$t("sent"),
        paid_reported: this.$t("paidReported"),
        paid: this.$t("paidStatus"),
        production: this.$t("production"),
        delivered: this.$t("delivered"),
      };
      return map[status] || status || this.$t("sent");
    },
    primaryActionLabel(order) {
      return order?.status === "paid"
        ? this.$t("launchProduction")
        : this.$t("markPaid");
    },
    buildOrderSummary(order) {
      const lines = [
        "NewGbonhi Preorder",
        `Order ID: ${order.id}`,
        `Status: ${this.formatStatus(order.status)}`,
        `Name: ${order.customer.firstName} ${order.customer.lastName}`,
        `Phone: ${order.customer.phone}`,
        `Email: ${order.customer.email}`,
        `Address: ${order.customer.address}, ${order.customer.city}`,
        `Delivery: ${order.shipping?.label || "-"} (${this.formatPrice(
          order.shipping?.fee || 0
        )})`,
      ];

      if (order.fulfillment) {
        lines.push(
          `Production: ${
            order.fulfillment.productionWindow || this.$t("productionAfterPayment")
          }`
        );
        lines.push(
          `Delivery window: ${
            order.fulfillment.deliveryWindow || this.$t("deliveryWindow48h72h")
          }`
        );
      }

      lines.push("Items:");

      order.items.forEach((item) => {
        const details = [
          item.selectedSize || "",
          item.selectedColor ? `Color: ${item.selectedColor}` : "",
          item.selectedDesignName ? `Design: ${item.selectedDesignName}` : "",
        ].filter(Boolean);
        const detailText = details.length ? ` (${details.join(" | ")})` : "";
        lines.push(
          `- ${item.title}${detailText} x${item.qty} = ${this.formatPrice(
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
    async advanceOrder(order) {
      if (this.isSaving || !this.adminToken) {
        return;
      }
      this.authError = "";
      this.isSaving = true;
      try {
        const nextStatus = order.status === "paid" ? "production" : "paid";
        this.orders = await updateOrderStatus(order.id, nextStatus, this.adminToken);
      } catch (error) {
        this.authError =
          error instanceof Error ? error.message : "Unable to update order.";
      } finally {
        this.isSaving = false;
      }
    },
    async markDelivered(order) {
      if (this.isSaving || !this.adminToken) {
        return;
      }
      this.authError = "";
      this.isSaving = true;
      try {
        this.orders = await updateOrderStatus(order.id, "delivered", this.adminToken);
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

.order-status.production {
  background: #eef2ff;
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

.order-fulfillment {
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 12px;
  padding: 10px;
  background: #fafafa;
  display: grid;
  gap: 4px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.order-fulfillment span {
  color: var(--accent);
  font-weight: 700;
}

.order-fulfillment strong,
.order-fulfillment p {
  margin: 0;
}

.order-fulfillment p {
  color: var(--muted);
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

/* Operational dashboard */
.orders-index { margin-bottom: 24px; padding: 10px 0; border-top: 1px solid var(--line); border-bottom: 1px solid rgba(0,0,0,.2); display: flex; justify-content: space-between; gap: 16px; font: 700 9px/1.2 monospace; letter-spacing: .14em; }
.orders-head h1 { font-family: "Archivo Black","Space Grotesk",sans-serif; font-size: clamp(36px,6vw,72px); line-height: .94; }
.orders-stats { margin-top: 28px; display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); border-top: 1px solid var(--line); border-left: 1px solid var(--line); }
.orders-stats article { min-height: 110px; padding: 18px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between; }
.orders-stats span { font: 700 9px/1 monospace; letter-spacing: .14em; }
.orders-stats strong { font-family: "Archivo Black","Space Grotesk",sans-serif; font-size: 34px; }
.orders-login,
.orders-empty,
.order-card,
.order-fulfillment { border-radius: var(--ng-radius); }
.orders-login { width: min(520px,100%); margin: 40px auto 0; padding: clamp(24px,5vw,48px); }
.orders-login input { min-height: 48px; }
.order-card { padding: clamp(18px,3vw,30px); border-color: var(--line); }
.order-status { border-radius: var(--ng-radius); font-family: monospace; }
.order-item { padding: 10px 0; border-top: 1px solid rgba(0,0,0,.12); }
.pay-button,
.ghost-button,
.delete-button { min-height: 44px; }
.pay-button:hover:not(:disabled) { border-color: var(--accent); background: var(--accent); }

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
  .orders-index { flex-direction: column; }
  .orders-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }

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
