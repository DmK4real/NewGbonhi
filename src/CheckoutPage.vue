<template>
  <div class="checkout-page">
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
        <a href="#contact">Contact</a>
      </nav>
      <button class="shop-cta" type="button" @click="toggleCart">
        Cart ({{ cartCount }})
      </button>
    </header>

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <main class="checkout-main">
      <section class="checkout-form">
        <div class="section-head">
          <p>Checkout</p>
          <h1>Finalize your order</h1>
        </div>

        <div v-if="orderSent" class="confirmation">
          <p class="confirmation-kicker">Order sent</p>
          <h2>Thank you. Your order is pending payment.</h2>
          <p class="confirmation-id">Order ID: {{ lastOrderId }}</p>
          <div class="confirmation-actions">
            <button class="ghost-button" type="button" @click="openWhatsApp">
              Open WhatsApp
            </button>
            <button
              class="pay-button"
              type="button"
              @click="markAsPaid"
              :disabled="isReportingPayment"
            >
              {{ isReportingPayment ? "Verification..." : "I've paid" }}
            </button>
          </div>
        </div>

        <form v-if="!orderSent" @submit.prevent="sendOrder">
          <div class="form-grid">
            <label>
              First name
              <input v-model.trim="customer.firstName" required />
            </label>
            <label>
              Last name
              <input v-model.trim="customer.lastName" required />
            </label>
            <label>
              Email
              <input v-model.trim="customer.email" type="email" required />
            </label>
            <label>
              Phone
              <input v-model.trim="customer.phone" required />
            </label>
            <label class="full">
              Address
              <input v-model.trim="customer.address" required />
            </label>
            <label>
              City
              <input v-model.trim="customer.city" required />
            </label>
            <label>
              Zip code
              <input v-model.trim="customer.zip" required />
            </label>
          </div>

          <div class="notice">
            <p>Steps</p>
            <p>1. Confirm your order with your exact address.</p>
            <p>2. Pay for the item via mobile money.</p>
            <p>3. We dispatch the Yango trip from our address to yours.</p>
            <p>4. You pay upon courier arrival (delivery fee).</p>
          </div>

          <div class="delivery-box">
            <h3>Yango Delivery</h3>
            <p class="delivery-copy">
              The courier picks up the t-shirts from our address and delivers
              them to you.
            </p>
            <p class="delivery-copy">
              Delivery fees vary based on distance.
            </p>
          </div>

          <div class="payment-box">
            <h3>Payment</h3>
            <p class="payment-note">
              When the courier arrives, you only pay the delivery fee and
              receive your parcel.
            </p>
          </div>

          <div class="checkout-actions">
            <button
              class="pay-button"
              type="submit"
              :disabled="!canSend || isSubmitting"
            >
              {{
                isSubmitting
                  ? "Sending..."
                  : "Send order (" + formatPrice(cartTotal) + " excluding delivery)"
              }}
            </button>
            <button
              class="ghost-button"
              type="button"
              @click="copyOrder"
              :disabled="!cartItems.length || isSubmitting"
            >
              Copy summary
            </button>
          </div>

          <p v-if="whatsappNumberDisplay" class="hint">
            WhatsApp: {{ whatsappNumberDisplay }}
          </p>
          <p v-if="contactEmail" class="hint">
            Email: {{ contactEmail }}
          </p>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">{{ success }}</p>
        </form>
      </section>

      <aside class="checkout-summary">
        <div class="section-head">
          <p>Order</p>
          <h2>Summary</h2>
        </div>

        <div v-if="cartItems.length === 0" class="summary-empty">
          Your cart is empty.
        </div>
        <div v-else class="summary-items">
          <article v-for="item in cartItems" :key="item.key" class="summary-item">
            <img
              v-if="item.imagePrimary"
              :src="item.imagePrimary"
              :alt="item.title"
              loading="lazy"
              decoding="async"
            />
            <div>
              <h3>{{ item.title }}</h3>
              <p v-if="item.selectedSize">Size: {{ item.selectedSize }}</p>
              <p>Qty: {{ item.qty }}</p>
            </div>
            <strong>{{ formatPrice(item.qty * item.price) }}</strong>
          </article>
          <div class="summary-row">
            <span>Subtotal</span>
            <strong>{{ formatPrice(cartTotal) }}</strong>
          </div>
          <div class="summary-row">
            <span>Delivery</span>
            <strong>Based on distance (Yango)</strong>
          </div>
          <div class="summary-total">
            <span>Items total</span>
            <strong>{{ formatPrice(cartTotal) }}</strong>
          </div>
          <div class="summary-row">
            <span>Final total</span>
            <strong>Items + Yango delivery</strong>
          </div>
        </div>
      </aside>
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
import { createOrder, reportOrderPaid } from "./data/orders.js";
import {
  SHIPPING_OPTIONS,
  buildOrderId,
  buildOrderMessage,
  formatPhoneDisplay,
  formatPrice,
  normalizeNumber,
  VITE_WHATSAPP_NUMBER,
  VITE_CONTACT_EMAIL,
  VITE_MOMO_WAVE,
  VITE_MOMO_ORANGE,
  VITE_MOMO_MTN,
  VITE_MOMO_MOOV,
  VITE_MOMO_ADDITIONAL,
  VITE_PAYMENT_NOTE,
} from "./utils/checkout.js";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;

// These are now imported from checkout.js
// const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "";
// const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "";

export default {
  name: "CheckoutPage",
  components: {
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      cartOpen: false,
      error: "",
      success: "",
      orderSent: false,
      isSubmitting: false,
      isReportingPayment: false,
      lastOrderId: "",
      lastOrderMessage: "",
      shippingOptions: SHIPPING_OPTIONS,
      customer: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "Abidjan",
        zip: "00225",
      },
    };
  },
  computed: {
    cartItems() {
      return cartStore.state.items;
    },
    cartCount() {
      return cartStore.cartCount.value;
    },
    cartTotal() {
      return cartStore.cartTotal.value;
    },
    selectedShipping() {
      return this.shippingOptions[0] || null;
    },
    shippingFee() {
      return this.selectedShipping?.fee || 0;
    },
    totalWithShipping() {
      return this.cartTotal + this.shippingFee;
    },
    contactEmail() {
      return VITE_CONTACT_EMAIL;
    },
    whatsappNumberDisplay() {
      return this.formatPhoneDisplay(VITE_WHATSAPP_NUMBER);
    },
    whatsappUrl() {
      const normalized = normalizeNumber(VITE_WHATSAPP_NUMBER);
      if (!normalized) {
        return "";
      }
      const message = encodeURIComponent(this.lastOrderMessage || this.buildOrderMessage());
      return `https://wa.me/${normalized}?text=${message}`;
    },
    isFormValid() {
      const customer = this.customer;
      return (
        customer.firstName &&
        customer.lastName &&
        customer.email &&
        customer.phone &&
        customer.address &&
        customer.city
      );
    },
    canSend() {
      return (
        this.cartItems.length > 0 &&
        this.cartTotal > 0 &&
        this.isFormValid &&
        !this.isSubmitting &&
        Boolean(this.whatsappUrl)
      );
    },
  },
  methods: {
    formatPrice(value) {
      return formatPrice(value);
    },
    toggleCart() {
      this.cartOpen = !this.cartOpen;
    },
    normalizeNumber(value) {
      return normalizeNumber(value);
    },
    formatPhoneDisplay(value) {
      return formatPhoneDisplay(value);
    },
    buildOrderMessage() {
      return buildOrderMessage({
        orderId: this.lastOrderId,
        customer: this.customer,
        cartItems: this.cartItems,
        selectedShipping: this.selectedShipping,
        shippingFee: this.shippingFee,
        totalWithShipping: this.totalWithShipping,
      });
    },
    buildOrderId() {
      // This now comes from utils/checkout.js
      return buildOrderId();
    },
    openWhatsApp() {
      if (!this.whatsappUrl) {
        this.error = "WhatsApp number missing.";
        return;
      }
      window.open(this.whatsappUrl, "_blank", "noopener");
    },
    async sendOrder() {
      this.error = "";
      this.success = "";

      if (!this.cartItems.length) {
        this.error = "Your cart is empty.";
        return;
      }

      if (!this.isFormValid) {
        this.error = "Please complete the customer details.";
        return;
      }

      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        const createdOrder = await createOrder({
        customer: { ...this.customer },
        items: this.cartItems.map((item) => ({
          key: item.key,
          title: item.title,
          qty: item.qty,
          price: item.price,
          selectedSize: item.selectedSize || null,
        })),
        subtotal: this.cartTotal,
        shipping: {
          id: this.selectedShipping.id,
          label: this.selectedShipping.label,
          fee: this.shippingFee,
        },
      });

        if (!createdOrder || !createdOrder.id) {
          throw new Error("Unable to create order.");
        }

        this.lastOrderId = createdOrder.id || buildOrderId(); // Use imported buildOrderId
        this.lastOrderMessage = this.buildOrderMessage();

        this.openWhatsApp();
        this.orderSent = true;
        this.success = "Message ready in WhatsApp. Please send it.";
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Unable to send order.";
      } finally {
        this.isSubmitting = false;
      }
    },
    async markAsPaid() {
      if (!this.lastOrderId || this.isReportingPayment) {
        return;
      }
      this.error = "";
      this.success = "";
      this.isReportingPayment = true;
      try {
        await reportOrderPaid(this.lastOrderId);
        cartStore.clearCart();
        this.success = "Thank you. Payment pending verification.";
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Unable to report payment.";
      } finally {
        this.isReportingPayment = false;
      }
    },
    async copyOrder() {
      try {
        await navigator.clipboard.writeText(
          this.lastOrderMessage || this.buildOrderMessage()
        );
        this.success = "Order summary copied.";
      } catch (error) {
        this.error = "Unable to copy the summary.";
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

.checkout-page {
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

.checkout-page::before {
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

.checkout-main {
  margin-top: 32px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 24px;
}

.checkout-form,
.checkout-summary {
  border: 1px solid var(--line);
  border-radius: 20px;
  background: #fff;
  padding: 24px;
  animation: rise 0.7s ease both;
}

.section-head p {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.section-head h1,
.section-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.form-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-grid label {
  display: grid;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10px;
}

.form-grid input {
  border: 1px solid rgba(0, 0, 0, 0.3);
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
}

.form-grid .full {
  grid-column: 1 / -1;
}

.notice {
  margin-top: 16px;
  border: 1px dashed rgba(0, 0, 0, 0.3);
  padding: 12px;
  font-size: 12px;
  color: var(--muted);
}

.notice p {
  margin: 0 0 6px;
}

.confirmation {
  margin-bottom: 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 16px;
  background: #fff5f5;
  display: grid;
  gap: 8px;
}

.confirmation-kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 10px;
  color: var(--muted);
}

.confirmation h2 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 16px;
}

.confirmation-id {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.confirmation-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.delivery-box {
  margin-top: 16px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  padding: 14px;
  background: #fafafa;
}

.delivery-box h3 {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
}

.delivery-copy {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--muted);
}

.payment-box {
  margin-top: 16px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  padding: 14px;
  background: #fafafa;
}

.payment-box h3 {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
}

.payment-note {
  margin: 10px 0 0;
  font-size: 11px;
  color: var(--muted);
}

.checkout-actions {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.pay-button {
  width: 100%;
  border: 1px solid var(--line);
  background: #0b0b0b;
  color: #fff;
  padding: 12px 18px;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.ghost-button {
  width: 100%;
  border: 1px solid var(--line);
  background: #fff;
  color: #0b0b0b;
  padding: 12px 18px;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.pay-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ghost-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.hint {
  margin: 10px 0 0;
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.error {
  margin-top: 10px;
  color: #a00000;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
}

.success {
  margin-top: 10px;
  color: #007b2c;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
}

.summary-items {
  margin-top: 16px;
  display: grid;
  gap: 12px;
}

.summary-item {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 12px;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 14px;
  padding: 10px;
  background: #fff;
}

.summary-item img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  background: #fff;
}

.summary-item h3 {
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
}

.summary-item p {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
}

.summary-total {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
  color: var(--muted);
}

.summary-empty {
  margin-top: 16px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
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

@media (max-width: 980px) {
  .checkout-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .checkout-page {
    padding: 24px 16px 40px;
  }

  .checkout-form,
  .checkout-summary {
    padding: 18px;
  }

  .shop-header {
    align-items: flex-start;
  }

  .shop-cta {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .summary-item {
    grid-template-columns: 64px 1fr;
  }

  .summary-item strong {
    grid-column: 2;
    justify-self: start;
    margin-top: 6px;
  }

  .summary-total,
  .summary-row {
    gap: 8px;
    flex-wrap: wrap;
  }
}
</style>

