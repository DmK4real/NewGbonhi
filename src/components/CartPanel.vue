<template>
  <div v-if="open" class="cart-layer">
    <button class="cart-backdrop" type="button" @click="$emit('close')" />
    <aside class="cart-panel" role="dialog" aria-label="Shopping cart">
      <header class="cart-header">
        <h3>Cart</h3>
        <button class="cart-close" type="button" @click="$emit('close')">
          Close
        </button>
      </header>

      <p v-if="cartItems.length === 0" class="cart-empty">
        Your cart is empty.
      </p>

      <div v-else class="cart-items">
        <article v-for="item in cartItems" :key="item.key" class="cart-item">
          <img
            v-if="item.imagePrimary"
            :src="item.imagePrimary"
            :alt="item.title"
            loading="lazy"
            decoding="async"
          />
          <div class="cart-item-body">
            <h4>{{ item.title }}</h4>
            <p v-if="item.selectedSize" class="cart-size">
              Size: {{ item.selectedSize }}
            </p>
            <p v-if="item.selectedColor" class="cart-color">
              Color: {{ item.selectedColor }}
            </p>
            <div class="cart-qty">
              <button
                type="button"
                aria-label="Decrease quantity"
                @click="decreaseQty(item)"
              >
                -
              </button>
              <span>{{ item.qty }}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                @click="increaseQty(item)"
              >
                +
              </button>
            </div>
            <p class="cart-price">{{ formatPrice(item.price * item.qty) }}</p>
          </div>
          <button
            class="cart-remove"
            type="button"
            @click="removeItem(item)"
          >
            Remove
          </button>
        </article>
      </div>

      <footer v-if="cartItems.length" class="cart-footer">
        <div class="cart-total">
          <span>Total</span>
          <strong>{{ formatPrice(cartTotal) }}</strong>
        </div>
        <RouterLink
          class="cart-checkout"
          to="/checkout"
          @click="$emit('close')"
        >
          Checkout
        </RouterLink>
        <button class="cart-clear" type="button" @click="clearCart">
          Clear cart
        </button>
      </footer>
    </aside>
  </div>
</template>

<script>
import { cartStore } from "../data/cart.js";

export default {
  name: "CartPanel",
  emits: ["close"],
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    cartItems() {
      return cartStore.state.items;
    },
    cartTotal() {
      return cartStore.cartTotal.value;
    },
  },
  methods: {
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
    increaseQty(item) {
      cartStore.updateQty(item.key, item.qty + 1);
    },
    decreaseQty(item) {
      cartStore.updateQty(item.key, item.qty - 1);
    },
    removeItem(item) {
      cartStore.removeFromCart(item.key);
    },
    clearCart() {
      cartStore.clearCart();
    },
  },
};
</script>

<style scoped>
.cart-layer {
  position: fixed;
  inset: 0;
  z-index: 220;
  display: flex;
  justify-content: flex-end;
}

.cart-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  border: none;
  padding: 0;
}

.cart-panel {
  position: relative;
  width: min(360px, 92vw);
  height: 100%;
  background: #fff;
  border-left: 1px solid rgba(0, 0, 0, 0.2);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: -12px 0 24px rgba(0, 0, 0, 0.12);
  overflow-y: auto;
  animation: slideIn 0.25s ease;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
}

.cart-header h3 {
  margin: 0;
}

.cart-close {
  border: 1px solid #0b0b0b;
  background: #fff;
  padding: 6px 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
  cursor: pointer;
}

.cart-empty {
  color: #606060;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 11px;
}

.cart-items {
  display: grid;
  gap: 14px;
}

.cart-item {
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 12px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 14px;
  padding: 10px;
  background: #fff;
  align-items: center;
}

.cart-item img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 10px;
  background: #fff;
}

.cart-item-body h4 {
  margin: 0 0 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.cart-size {
  margin: 0 0 6px;
  font-size: 11px;
  color: #606060;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.cart-color {
  margin: 0 0 6px;
  font-size: 11px;
  color: #606060;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.cart-qty {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 999px;
  padding: 4px 8px;
  background: #fff;
}

.cart-qty button {
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
}

.cart-price {
  margin: 6px 0 0;
  font-weight: 600;
  font-size: 12px;
}

.cart-remove {
  border: none;
  background: transparent;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #a00000;
  cursor: pointer;
}

.cart-footer {
  margin-top: auto;
  display: grid;
  gap: 10px;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
}

.cart-checkout,
.cart-clear {
  border: 1px solid #0b0b0b;
  padding: 10px 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 11px;
  cursor: pointer;
  background: #0b0b0b;
  color: #fff;
  text-decoration: none;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cart-clear {
  background: #fff;
  color: #0b0b0b;
}

@keyframes slideIn {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 700px) {
  .cart-item {
    grid-template-columns: 64px 1fr;
    grid-template-rows: auto auto;
  }

  .cart-remove {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
</style>


