<template>
  <div class="payment-methods" aria-label="Accepted payment methods">
    <span
      v-for="method in methods"
      :key="method"
      class="payment-badge"
      :class="badgeClass(method)"
    >
      {{ method }}
    </span>
  </div>
</template>

<script>
const methods = [
  "Orange Money",
  "Wave",
  "MTN Money",
  "Moov Money",
];

export default {
  name: "PaymentMethods",
  data() {
    return {
      methods,
    };
  },
  methods: {
    badgeClass(method) {
      return `is-${method.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    },
  },
};
</script>

<style scoped>
.payment-methods {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px 16px;
}

.payment-badge {
  color: currentColor;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1.4;
  text-transform: uppercase;
  white-space: nowrap;
}

.is-orange-money {
  color: #ff7900;
}

.is-mtn-money {
  color: #d5aa00;
}

.is-moov-money {
  color: #005bbb;
}

.is-wave {
  color: #168fc2;
}

@media (max-width: 700px) {
  .payment-methods {
    gap: 8px 12px;
  }
}
</style>
