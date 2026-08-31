<template>
  <div class="checkout-page">
    <SiteHeader @toggle-cart="toggleCart" />

    <CartPanel :open="cartOpen" @close="cartOpen = false" />

    <main class="checkout-main">
      <nav class="checkout-progress" aria-label="Checkout progress">
        <span class="done"><b>01</b>{{ $t("cart") }}</span>
        <span :class="{ done: orderSent, active: !orderSent }"><b>02</b>{{ $t("delivery") }}</span>
        <span :class="{ done: paymentReported, active: orderSent && !paymentReported }"><b>03</b>{{ $t("payment") }}</span>
        <span :class="{ active: paymentReported }"><b>04</b>{{ $t("orderSent") }}</span>
      </nav>
      <section class="checkout-form">
        <div class="section-head">
          <p>CHECKOUT / 001 — {{ $t("checkoutKicker") }}</p>
          <h1>{{ $t("finalizeOrder") }}</h1>
        </div>

        <div class="preorder-banner">
          <p>{{ $t("preorderBadge") }}</p>
          <strong>{{ $t("preorderCheckoutTitle") }}</strong>
          <span>{{ $t("preorderCheckoutCopy") }}</span>
        </div>

        <div
          v-if="paymentReturnMessage"
          class="payment-return"
          :class="`is-${paymentReturnStatus}`"
        >
          <p>{{ paymentReturnMessage }}</p>
          <strong v-if="paymentReturnOrderId">{{ paymentReturnOrderId }}</strong>
        </div>

        <div v-if="orderSent" class="confirmation payment-handoff">
          <p class="confirmation-kicker">
            {{ paymentKicker }}
          </p>
          <h2>
            {{ paymentTitle }}
          </h2>
          <p class="confirmation-copy">
            {{ paymentCopy }}
          </p>

          <div class="payment-status-grid">
            <article>
              <span>{{ $t("orderId") }}</span>
              <strong>{{ lastOrderId }}</strong>
              <button type="button" @click="copyText(lastOrderId, $t('orderIdCopied'))">
                {{ $t("copy") }}
              </button>
            </article>
            <article>
              <span>{{ $t("paymentNow") }}</span>
              <strong>{{ formatPrice(amountToPayNow) }}</strong>
              <button type="button" @click="copyText(String(amountToPayNow), $t('amountCopied'))">
                {{ $t("copy") }}
              </button>
            </article>
            <article>
              <span>{{ $t("deliveryOnArrival") }}</span>
              <strong>{{ formatPrice(orderDeliveryFee) }}</strong>
              <small>{{ orderDeliveryLabel }}</small>
            </article>
          </div>

          <div class="geniuspay-panel">
            <div>
              <span>{{ $t("geniusPayProvider") }}</span>
              <strong>{{ $t("geniusPayName") }}</strong>
              <p>
                {{
                  geniusPayError
                    ? $t("geniusPayFallback")
                    : $t("geniusPayCopy")
                }}
              </p>
              <small v-if="paymentReference">
                {{ $t("geniusPayReference") }}: {{ paymentReference }}
              </small>
            </div>
            <button
              class="pay-button"
              type="button"
              @click="openGeniusPay"
              :disabled="!paymentCheckoutUrl || isStartingPayment"
            >
              {{
                isStartingPayment
                  ? $t("openingPayment")
                  : $t("payWithGeniusPay")
              }}
            </button>
          </div>

          <div class="payment-reference">
            <span>{{ $t("paymentReference") }}</span>
            <strong>{{ lastOrderId }}</strong>
            <p>{{ $t("paymentReferenceHint") }}</p>
          </div>

          <div class="manual-payment-list">
            <article
              v-for="method in manualPaymentMethods"
              :key="method.label"
              class="manual-payment-method"
            >
              <div>
                <span>{{ $t("transferTo") }}</span>
                <strong>{{ method.label }}</strong>
                <p>{{ method.value }}</p>
              </div>
              <button type="button" @click="copyPaymentMethod(method)">
                {{ $t("copyNumber") }}
              </button>
            </article>
            <article v-if="manualPaymentMethods.length === 0" class="manual-payment-empty">
              {{ $t("paymentMethodFallback") }}
            </article>
          </div>

          <ol class="payment-checklist" aria-label="Payment checklist">
            <li>{{ paymentCheckoutUrl ? $t("paymentStepOnline") : $t("paymentStepTransfer") }}</li>
            <li>{{ paymentCheckoutUrl ? $t("paymentStepOnlineMethod") : $t("paymentStepReference") }}</li>
            <li>{{ paymentCheckoutUrl ? $t("paymentStepAutoConfirm") : $t("paymentStepReport") }}</li>
          </ol>

          <div class="confirmation-actions">
            <button class="ghost-button" type="button" @click="openWhatsApp">
              {{ $t("openWhatsApp") }}
            </button>
            <button
              class="pay-button"
              type="button"
              @click="markAsPaid"
              :disabled="isReportingPayment || paymentReported"
            >
              {{
                paymentReported
                  ? $t("paymentReportSent")
                  : isReportingPayment
                    ? $t("verification")
                    : $t("customerPaid")
              }}
            </button>
          </div>
          <p v-if="error" class="error" role="alert">{{ error }}</p>
          <p v-if="success" class="success" role="status" aria-live="polite">{{ success }}</p>
        </div>

        <form v-if="!orderSent" id="checkout-order-form" @submit.prevent="sendOrder">
          <p class="checkout-step-label">01 / CUSTOMER</p>
          <div class="form-grid">
            <label>
              {{ $t("firstName") }}
              <input v-model.trim="customer.firstName" autocomplete="given-name" required />
            </label>
            <label>
              {{ $t("lastName") }}
              <input v-model.trim="customer.lastName" autocomplete="family-name" required />
            </label>
            <label>
              {{ $t("email") }}
              <input v-model.trim="customer.email" type="email" autocomplete="email" inputmode="email" required />
            </label>
            <label>
              {{ $t("phone") }}
              <input v-model.trim="customer.phone" type="tel" autocomplete="tel" inputmode="tel" minlength="8" maxlength="20" required />
            </label>
            <label class="full">
              {{ $t("address") }}
              <input v-model.trim="customer.address" autocomplete="street-address" required />
            </label>
            <label>
              {{ $t("city") }}
              <input v-model.trim="customer.city" autocomplete="address-level2" required />
            </label>
            <label>
              {{ $t("zipCode") }}
              <input v-model.trim="customer.zip" autocomplete="postal-code" inputmode="numeric" required />
            </label>
          </div>

          <div class="notice">
            <p>{{ $t("steps") }}</p>
            <p>{{ $t("step1") }}</p>
            <p>{{ $t("step2") }}</p>
            <p>{{ $t("step3") }}</p>
            <p>{{ $t("step4") }}</p>
          </div>

          <div class="delivery-box">
            <p class="checkout-step-label">02 / DELIVERY</p>
            <h3>{{ $t("yangoDelivery") }}</h3>
            <p class="delivery-copy">
              {{ $t("deliveryCopy") }}
            </p>
            <label class="delivery-select-label" for="delivery-zone">
              {{ $t("deliveryZone") }}
            </label>
            <select
              id="delivery-zone"
              v-model="shippingOptionId"
              class="delivery-select"
            >
              <option
                v-for="option in shippingOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.label }} - {{ formatPrice(option.fee) }}
              </option>
            </select>
            <p v-if="selectedShipping" class="delivery-copy">
              {{ $t("estimatedFee") }}: {{ formatPrice(shippingFee) }}
            </p>
            <p v-if="selectedShipping" class="delivery-copy">
              {{ $t("deliveryWindow") }}: {{ selectedShipping.eta }}
            </p>
          </div>

          <div class="payment-box">
            <p class="checkout-step-label">03 / PAYMENT</p>
            <h3>{{ $t("payment") }}</h3>
            <PaymentMethods />
            <p class="payment-note">
              {{ $t("paymentNote") }}
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
                  ? $t("sending")
                  : $t("sendOrder") + " (" + formatPrice(cartTotal) + " " + $t("excludingDelivery") + ")"
              }}
            </button>
            <button
              class="ghost-button"
              type="button"
              @click="copyOrder"
              :disabled="!cartItems.length || isSubmitting"
            >
              {{ $t("copySummary") }}
            </button>
          </div>

          <p v-if="whatsappNumberDisplay" class="hint">
            WhatsApp: {{ whatsappNumberDisplay }}
          </p>
          <p v-if="contactEmail" class="hint">
            Email: {{ contactEmail }}
          </p>

          <p v-if="error" class="error" role="alert">{{ error }}</p>
          <p v-if="success" class="success" role="status" aria-live="polite">{{ success }}</p>
        </form>
      </section>

      <aside class="checkout-summary">
        <div class="section-head">
          <p>{{ $t("order") }}</p>
          <h2>{{ $t("summary") }}</h2>
        </div>

        <div v-if="cartItems.length === 0" class="summary-empty">
          {{ $t("emptyCart") }}
        </div>
        <div v-else class="summary-items">
          <article
            v-for="item in cartItems"
            :key="item.key"
            class="summary-item"
            :class="{
              'is-custom-studio': item.isCustomStudio,
              'is-preorder': item.preorder,
            }"
          >
            <img
              v-if="item.imagePrimary"
              :src="item.imagePrimary"
              :alt="item.title"
              loading="lazy"
              decoding="async"
            />
            <div>
              <p v-if="item.preorder" class="summary-badge summary-preorder">
                {{ $t("preorderBadge") }}
              </p>
              <p v-if="item.isCustomStudio" class="summary-badge">{{ $t("customStudio") }}</p>
              <h3>{{ item.title }}</h3>
              <p v-if="item.selectedSize">{{ $t("size") }}: {{ item.selectedSize }}</p>
              <p v-if="item.selectedColor">{{ $t("color") }}: {{ item.selectedColor }}</p>
              <p v-if="item.selectedDesignName">{{ $t("design") }}: {{ item.selectedDesignName }}</p>
              <p>{{ $t("qty") }}: {{ item.qty }}</p>
            </div>
            <strong>{{ formatPrice(item.qty * item.price) }}</strong>
          </article>
          <div class="summary-row">
            <span>{{ $t("subtotal") }}</span>
            <strong>{{ formatPrice(cartTotal) }}</strong>
          </div>
          <div class="summary-row">
            <span>{{ $t("delivery") }}</span>
            <strong>{{ selectedShipping ? formatPrice(shippingFee) : "-" }}</strong>
          </div>
          <div class="summary-total">
            <span>{{ $t("finalTotal") }}</span>
            <strong>{{ formatPrice(totalWithShipping) }}</strong>
          </div>
        </div>
      </aside>
    </main>

    <div v-if="!orderSent && cartItems.length" class="checkout-mobile-bar">
      <div><span>{{ $t("finalTotal") }}</span><strong>{{ formatPrice(totalWithShipping) }}</strong></div>
      <button type="submit" form="checkout-order-form" :disabled="!canSend || isSubmitting">
        {{ isSubmitting ? $t("sending") : $t("sendOrder") }}
      </button>
    </div>

    <SiteFooter />
  </div>
</template>

<script>
import SiteHeader from "./components/SiteHeader.vue";
import CartPanel from "./components/CartPanel.vue";
import PaymentMethods from "./components/PaymentMethods.vue";
import { cartStore } from "./data/cart.ts";
import {
  createGeniusPayPayment,
  createOrder,
  reportOrderPaid,
} from "./data/orders.js";
import {
  SHIPPING_OPTIONS,
  buildOrderId,
  buildOrderMessage,
  formatPhoneDisplay,
  formatPrice,
  isValidCustomer,
  normalizeNumber,
  VITE_WHATSAPP_NUMBER,
  VITE_CONTACT_EMAIL,
  VITE_MOMO_WAVE,
  VITE_MOMO_ORANGE,
  VITE_MOMO_MTN,
  VITE_MOMO_MOOV,
  VITE_MOMO_ADDITIONAL,
  VITE_PAYMENT_NOTE,
} from "./utils/checkout.ts";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;

// These are now imported from checkout.ts
// const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "";
// const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "";

export default {
  name: "CheckoutPage",
  components: {
    SiteHeader,
    CartPanel,
    PaymentMethods,
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
      isStartingPayment: false,
      paymentReported: false,
      paymentCheckoutUrl: "",
      paymentReference: "",
      paymentToken: "",
      geniusPayError: "",
      lastOrderId: "",
      lastOrderMessage: "",
      lastOrderSubtotal: 0,
      lastOrderShippingFee: 0,
      lastOrderShippingLabel: "",
      lastOrderTotal: 0,
      shippingOptions: SHIPPING_OPTIONS,
      shippingOptionId: SHIPPING_OPTIONS[0]?.id || "",
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
      return (
        this.shippingOptions.find((option) => option.id === this.shippingOptionId) ||
        this.shippingOptions[0] ||
        null
      );
    },
    shippingFee() {
      return this.selectedShipping?.fee || 0;
    },
    totalWithShipping() {
      return this.cartTotal + this.shippingFee;
    },
    amountToPayNow() {
      return this.orderSent ? this.lastOrderSubtotal : this.cartTotal;
    },
    orderDeliveryFee() {
      return this.orderSent ? this.lastOrderShippingFee : this.shippingFee;
    },
    orderDeliveryLabel() {
      if (this.orderSent) {
        return this.lastOrderShippingLabel || "-";
      }
      return this.selectedShipping?.label || "-";
    },
    orderTotal() {
      return this.orderSent ? this.lastOrderTotal : this.totalWithShipping;
    },
    paymentReturnStatus() {
      const status = String(this.$route?.query?.payment || "").toLowerCase();
      return ["success", "failed"].includes(status) ? status : "";
    },
    paymentReturnOrderId() {
      return String(this.$route?.query?.order || "").trim();
    },
    paymentReturnMessage() {
      if (this.paymentReturnStatus === "success") {
        return this.$t("paymentReturnSuccess");
      }
      if (this.paymentReturnStatus === "failed") {
        return this.$t("paymentReturnFailed");
      }
      return "";
    },
    paymentKicker() {
      if (this.paymentReported) {
        return this.$t("paymentReportedKicker");
      }
      if (this.paymentCheckoutUrl) {
        return this.$t("geniusPayKicker");
      }
      return this.$t("manualPaymentKicker");
    },
    paymentTitle() {
      if (this.paymentReported) {
        return this.$t("paymentReportedTitle");
      }
      if (this.paymentCheckoutUrl) {
        return this.$t("geniusPayTitle");
      }
      return this.$t("paymentPendingTitle");
    },
    paymentCopy() {
      if (this.paymentReported) {
        return this.$t("paymentReportedCopy");
      }
      if (this.paymentCheckoutUrl) {
        return this.$t("geniusPayCheckoutCopy");
      }
      return this.$t("manualPaymentCopy");
    },
    manualPaymentMethods() {
      return [
        { label: "Wave", value: VITE_MOMO_WAVE },
        { label: "Orange Money", value: VITE_MOMO_ORANGE },
        { label: "MTN Money", value: VITE_MOMO_MTN },
        { label: "Moov Money", value: VITE_MOMO_MOOV },
        { label: "Mobile Money", value: VITE_MOMO_ADDITIONAL },
      ]
        .filter((method) => method.value)
        .map((method) => ({
          ...method,
          copyValue: this.normalizePaymentValue(method.value),
        }));
    },
    preorderFulfillment() {
      return {
        mode: "preorder",
        paymentRequired: true,
        productionWindow: this.$t("productionAfterPayment"),
        deliveryWindow: this.$t("deliveryWindow48h72h"),
      };
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
      return isValidCustomer(this.customer);
    },
    canSend() {
      return (
        this.cartItems.length > 0 &&
        this.cartTotal > 0 &&
        this.isFormValid &&
        Boolean(this.selectedShipping) &&
        !this.isSubmitting
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
        fulfillment: this.preorderFulfillment,
      });
    },
    buildOrderId() {
      // This now comes from utils/checkout.ts
      return buildOrderId();
    },
    openWhatsApp() {
      if (!this.whatsappUrl) {
        this.error = "WhatsApp number missing.";
        return;
      }
      window.open(this.whatsappUrl, "_blank", "noopener");
    },
    openGeniusPay() {
      if (!this.paymentCheckoutUrl) {
        this.error = this.$t("geniusPayUnavailable");
        return;
      }
      window.location.assign(this.paymentCheckoutUrl);
    },
    normalizePaymentValue(value) {
      return String(value || "")
        .replace(
          /^(wave|orange money|orange|mtn money|mtn|moov money|moov|mobile money)\s*:?\s*/i,
          ""
        )
        .trim();
    },
    async copyText(value, message) {
      const text = String(value || "").trim();
      if (!text) {
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        this.error = "";
        this.success = message || this.$t("copied");
      } catch (error) {
        this.error = this.$t("copyFailed");
      }
    },
    copyPaymentMethod(method) {
      return this.copyText(method.copyValue || method.value, this.$t("numberCopied"));
    },
    async startGeniusPayPayment(order) {
      if (!order?.id) {
        return;
      }
      this.isStartingPayment = true;
      this.geniusPayError = "";
      this.paymentCheckoutUrl = "";
      this.paymentReference = "";
      try {
        const result = await createGeniusPayPayment(
          order.id,
          order.paymentToken || this.paymentToken
        );
        const payment = result.payment || null;
        this.paymentCheckoutUrl = payment?.checkoutUrl || payment?.paymentUrl || "";
        this.paymentReference = payment?.reference || "";
        if (!this.paymentCheckoutUrl) {
          throw new Error(this.$t("geniusPayUnavailable"));
        }
        this.success = this.$t("geniusPayReady");
      } catch (error) {
        this.geniusPayError =
          error instanceof Error ? error.message : this.$t("geniusPayUnavailable");
        this.success = this.$t("manualPaymentReady");
      } finally {
        this.isStartingPayment = false;
      }
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
            selectedColor: item.selectedColor || null,
            selectedColorId: item.selectedColorId || null,
            selectedDesignId: item.selectedDesignId || null,
            selectedDesignName: item.selectedDesignName || null,
            selectedDesignCategory: item.selectedDesignCategory || null,
            isCustomStudio: Boolean(item.isCustomStudio),
            preorder: item.preorder !== false,
            productionWindow:
              item.productionWindow || this.preorderFulfillment.productionWindow,
            deliveryWindow:
              item.deliveryWindow || this.preorderFulfillment.deliveryWindow,
          })),
          subtotal: this.cartTotal,
          shipping: {
            id: this.selectedShipping.id,
            label: this.selectedShipping.label,
            fee: this.shippingFee,
          },
          type: "preorder",
          fulfillment: this.preorderFulfillment,
        });

        if (!createdOrder || !createdOrder.id) {
          throw new Error("Unable to create order.");
        }

        this.lastOrderId = createdOrder.id || buildOrderId(); // Use imported buildOrderId
        this.paymentToken = createdOrder.paymentToken || "";
        this.lastOrderSubtotal = createdOrder.subtotal ?? this.cartTotal;
        this.lastOrderShippingFee = createdOrder.shipping?.fee ?? this.shippingFee;
        this.lastOrderShippingLabel =
          createdOrder.shipping?.label || this.selectedShipping.label;
        this.lastOrderTotal = createdOrder.total ?? this.totalWithShipping;
        this.lastOrderMessage = this.buildOrderMessage();

        this.orderSent = true;
        await this.startGeniusPayPayment(createdOrder);
        if (!this.paymentCheckoutUrl && !this.success) {
          this.success = this.$t("manualPaymentReady");
        }
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
        await reportOrderPaid(this.lastOrderId, this.paymentToken);
        this.paymentReported = true;
        cartStore.clearCart();
        this.success = this.$t("paymentReported");
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
      await this.copyText(
        this.lastOrderMessage || this.buildOrderMessage(),
        this.$t("summaryCopied")
      );
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

.preorder-banner {
  margin-top: 16px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 16px;
  padding: 14px;
  background: #fafafa;
  display: grid;
  gap: 5px;
}

.preorder-banner p,
.preorder-banner strong,
.preorder-banner span {
  margin: 0;
}

.preorder-banner p {
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 10px;
  font-weight: 700;
}

.preorder-banner strong {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
}

.preorder-banner span {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
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

.confirmation-copy {
  margin: 0;
  max-width: 680px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.confirmation-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.payment-return {
  margin-top: 16px;
  padding: 14px 16px;
  border: 1px solid currentColor;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
}

.payment-return p {
  margin: 0;
  line-height: 1.5;
}

.payment-return strong {
  font-family: monospace;
  overflow-wrap: anywhere;
}

.payment-return.is-success {
  color: #007b2c;
  background: #f1fff5;
}

.payment-return.is-failed {
  color: #a00000;
  background: #fff5f5;
}

.payment-handoff {
  margin-top: 20px;
  padding: clamp(18px, 3vw, 28px);
  background: #fff;
  border-color: var(--line);
  gap: 18px;
}

.payment-status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);
}

.payment-status-grid article {
  min-height: 118px;
  padding: 14px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.payment-status-grid span,
.payment-reference span,
.manual-payment-method span {
  font: 700 9px/1.2 monospace;
  color: var(--accent);
  letter-spacing: .16em;
  text-transform: uppercase;
}

.payment-status-grid strong {
  font: 900 15px/1.2 "Space Grotesk", Arial, sans-serif;
  letter-spacing: .04em;
  overflow-wrap: anywhere;
}

.payment-status-grid small {
  color: var(--muted);
  font: 700 10px/1.3 monospace;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.payment-status-grid button,
.manual-payment-method button {
  justify-self: start;
  width: fit-content;
  border: 1px solid var(--line);
  background: transparent;
  color: inherit;
  min-height: 32px;
  padding: 8px 10px;
  font: 800 9px/1 monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
  cursor: pointer;
}

.payment-reference {
  padding: 18px;
  display: grid;
  gap: 8px;
  background: #0b0b0b;
  color: #fff;
}

.payment-reference strong {
  font: 900 24px/1 "Archivo Black", "Space Grotesk", sans-serif;
  letter-spacing: .04em;
}

.payment-reference p {
  margin: 0;
  max-width: 560px;
  color: rgba(255, 255, 255, .72);
  font-size: 12px;
  line-height: 1.55;
}

.geniuspay-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 240px);
  gap: 14px;
  align-items: center;
  padding: 18px;
  border: 1px solid var(--line);
  background: #f4f1e9;
}

.geniuspay-panel div {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.geniuspay-panel span {
  font: 700 9px/1.2 monospace;
  color: var(--accent);
  letter-spacing: .16em;
  text-transform: uppercase;
}

.geniuspay-panel strong {
  font-size: 13px;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.geniuspay-panel p,
.geniuspay-panel small {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}

.geniuspay-panel small {
  font-family: monospace;
  overflow-wrap: anywhere;
}

.manual-payment-list {
  display: grid;
  border-top: 1px solid rgba(0, 0, 0, .2);
}

.manual-payment-method {
  padding: 15px 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, .2);
}

.manual-payment-method div {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.manual-payment-method strong {
  font-size: 12px;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.manual-payment-method p {
  margin: 0;
  color: var(--muted);
  font: 700 13px/1.35 monospace;
  overflow-wrap: anywhere;
}

.manual-payment-empty {
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, .2);
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}

.payment-checklist {
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
  counter-reset: payment-step;
  list-style: none;
}

.payment-checklist li {
  min-height: 46px;
  padding: 12px 0 12px 42px;
  border-bottom: 1px solid rgba(0, 0, 0, .16);
  position: relative;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.45;
}

.payment-checklist li::before {
  counter-increment: payment-step;
  content: counter(payment-step, decimal-leading-zero);
  position: absolute;
  left: 0;
  top: 12px;
  color: var(--text);
  font: 900 11px/1 monospace;
  letter-spacing: .08em;
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

.delivery-select-label {
  display: block;
  margin: 12px 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
}

.delivery-select {
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.3);
  background: #fff;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
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
  object-fit: contain;
  border-radius: 10px;
  background: #fff;
}

.summary-item.is-custom-studio {
  border-color: rgba(225, 6, 0, 0.28);
  background:
    linear-gradient(145deg, rgba(225, 6, 0, 0.06), rgba(225, 6, 0, 0)),
    #fff;
}

.summary-item.is-preorder {
  border-color: rgba(0, 0, 0, 0.28);
}

.summary-item.is-custom-studio img {
  border: 1px solid rgba(225, 6, 0, 0.22);
  background: #f7f7f7;
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

.summary-badge {
  margin: 0 0 6px;
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid rgba(225, 6, 0, 0.55);
  border-radius: 999px;
  background: rgba(225, 6, 0, 0.08);
  color: #a00000;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.summary-preorder {
  border-color: rgba(0, 0, 0, 0.5);
  background: #0b0b0b;
  color: #fff;
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

/* Editorial checkout */
.checkout-main { grid-template-columns: minmax(0,1.08fr) minmax(360px,.92fr); align-items: start; }
.checkout-progress { grid-column: 1/-1; display: grid; grid-template-columns: repeat(4,1fr); border: 1px solid var(--line); }
.checkout-progress span { min-height: 58px; padding: 12px; border-right: 1px solid var(--line); display: flex; align-items: center; gap: 10px; color: #777; font: 700 9px/1.2 monospace; letter-spacing: .1em; text-transform: uppercase; }
.checkout-progress span:last-child { border-right: 0; }
.checkout-progress b { color: var(--accent); }
.checkout-progress .done { background: #efefeb; color: #0b0b0b; }
.checkout-progress .active { background: #0b0b0b; color: #fff; }
.checkout-form,
.checkout-summary { border-radius: var(--ng-radius); }
.checkout-form { padding: clamp(24px,4vw,46px); }
.checkout-summary { position: sticky; top: calc(var(--header-height) + 24px); }
.section-head h1 {
  max-width: 100%;
  font-family: "Archivo Black","Space Grotesk",sans-serif;
  font-size: clamp(32px, 4vw, 54px);
  line-height: .96;
  letter-spacing: -.025em;
  overflow-wrap: break-word;
  text-wrap: balance;
}
.preorder-banner,
.confirmation,
.delivery-box,
.payment-box,
.summary-item { border-radius: var(--ng-radius); }
.checkout-step-label { margin: 28px 0 12px; color: var(--accent); font: 700 9px/1 monospace; letter-spacing: .16em; }
.form-grid { gap: 18px 14px; }
.form-grid input,
.delivery-select { min-height: 48px; border-radius: 0; transition: border-color .18s ease,box-shadow .18s ease; }
.form-grid input:focus,
.delivery-select:focus { outline: 0; border-color: var(--accent); box-shadow: 0 0 0 2px rgba(225,6,0,.12); }
.delivery-box,
.payment-box { margin-top: 28px; padding: 20px; }
.delivery-box .checkout-step-label,
.payment-box .checkout-step-label { margin-top: 0; }
.pay-button,
.ghost-button { min-height: 50px; }
.pay-button { transition: background-color .18s ease; }
.pay-button:hover:not(:disabled) { border-color: var(--accent); background: var(--accent); }
.summary-item { border-width: 0 0 1px; padding: 14px 0; }
.summary-item img { border-radius: var(--ng-radius); background: #efefeb; }
.summary-badge { border-radius: var(--ng-radius); }
.summary-total { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--line); font-size: 13px; }
.checkout-mobile-bar { display: none; }

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
  .checkout-summary { position: static; }
}

@media (max-width: 700px) {
  .checkout-page {
    padding: 24px 16px 40px;
  }

  .checkout-form .section-head h1 {
    max-width: 100%;
    font-size: clamp(25px, 8vw, 34px) !important;
    line-height: 1 !important;
    letter-spacing: -.03em !important;
    overflow-wrap: normal;
    word-break: normal;
    text-wrap: balance;
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
  .checkout-progress { grid-template-columns: repeat(2,1fr); }
  .checkout-progress span:nth-child(2) { border-right: 0; }
  .checkout-progress span { min-height: 48px; }

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
  .payment-status-grid {
    grid-template-columns: 1fr;
  }
  .manual-payment-method {
    grid-template-columns: 1fr;
  }
  .payment-return,
  .geniuspay-panel {
    display: grid;
    grid-template-columns: 1fr;
  }
  .manual-payment-method button,
  .payment-status-grid button,
  .geniuspay-panel button {
    width: 100%;
  }
  .checkout-mobile-bar { position: fixed; right: 0; bottom: 0; left: 0; z-index: 120; padding: 10px 14px; display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 12px; align-items: center; border-top: 1px solid #0b0b0b; background: rgba(255,255,255,.96); backdrop-filter: blur(14px); }
  .checkout-mobile-bar div { display: grid; gap: 3px; }
  .checkout-mobile-bar span { font: 700 8px/1 monospace; letter-spacing: .12em; text-transform: uppercase; }
  .checkout-mobile-bar strong { font: 700 12px/1 monospace; }
  .checkout-mobile-bar button { min-height: 42px; border: 0; background: var(--accent); color: #fff; padding: 10px 14px; font: 700 9px/1 sans-serif; letter-spacing: .12em; text-transform: uppercase; }
  .checkout-mobile-bar button:disabled { opacity: .45; }
  .checkout-page { padding-bottom: 100px; }
}

@media (prefers-color-scheme: dark) {
  .checkout-form,
  .checkout-summary {
    --text: #f3f0e8;
    --muted: #aaa79f;
    --line: rgba(243, 240, 232, .24);
    border-color: rgba(243, 240, 232, .24) !important;
    background: #181818 !important;
    color: #f3f0e8 !important;
  }

  .checkout-progress {
    border-color: rgba(243, 240, 232, .28) !important;
    background: #151515 !important;
  }

  .checkout-progress span,
  .checkout-progress .done,
  .checkout-progress .active {
    border-color: rgba(243, 240, 232, .22) !important;
  }

  .checkout-progress .done {
    background: #222 !important;
    color: #f3f0e8 !important;
  }

  .checkout-progress .active {
    background: #0b0b0b !important;
    color: #fff !important;
  }

  .payment-handoff,
  .delivery-box,
  .payment-box,
  .preorder-banner,
  .geniuspay-panel,
  .manual-payment-empty {
    background: #181818 !important;
    color: #f3f0e8 !important;
    border-color: rgba(243, 240, 232, .22) !important;
  }

  .payment-status-grid,
  .payment-status-grid article,
  .manual-payment-list,
  .manual-payment-method,
  .geniuspay-panel,
  .payment-checklist li {
    border-color: rgba(243, 240, 232, .22) !important;
  }

  .payment-status-grid button,
  .manual-payment-method button {
    border-color: rgba(243, 240, 232, .28) !important;
  }
}
</style>
