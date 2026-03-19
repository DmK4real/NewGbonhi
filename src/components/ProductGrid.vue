<template>
  <p v-if="products.length === 0" class="pg-empty">{{ emptyText }}</p>
  <div v-else class="pg-grid" role="list">
    <article
      v-for="product in products"
      :key="product.id || product.url || product.title"
      class="pg-card"
      role="listitem"
    >
      <component
        :is="linkTag(product)"
        class="pg-image-wrap"
        v-bind="linkProps(product)"
        :title="product.title || ''"
        :aria-label="product.title || 'Product'"
      >
        <template v-if="product.imagePrimary || product.imageSecondary">
          <picture class="pg-picture">
            <source
              v-if="product.imageWebp"
              :srcset="product.imageWebp"
              type="image/webp"
            />
            <img
              class="pg-image pg-image-primary"
              loading="lazy"
              decoding="async"
              :src="product.imagePrimary || product.imageSecondary"
              :alt="product.title || ''"
            />
          </picture>
        </template>
        <div v-else class="pg-placeholder" aria-hidden="true">
          <span class="pg-placeholder-text">Image coming soon</span>
        </div>
        <div class="pg-badges">
          <span v-if="product.soldOut" class="pg-badge pg-badge-soldout">
            Sold Out
          </span>
          <span
            v-for="badge in getBadges(product)"
            :key="badge"
            class="pg-badge pg-badge-tag"
          >
            {{ badge }}
          </span>
        </div>
        <span class="pg-view">View</span>
      </component>

      <h3 class="pg-title">
        <component :is="linkTag(product)" v-bind="linkProps(product)">
          {{ product.title || "Untitled product" }}
        </component>
      </h3>

      <p class="pg-price">
        {{ formatPrice(product.price) }}
        <template v-if="product.soldOut">
          {" - "}
          <strong class="pg-sold-out">Sold Out</strong>
        </template>
      </p>

      <button
        class="pg-add"
        type="button"
        :disabled="product.soldOut"
        @click="$emit('add-to-cart', product)"
      >
        {{ product.soldOut ? "Sold out" : "Add to cart" }}
      </button>
    </article>
  </div>
</template>

<script>
export default {
  name: "ProductGrid",
  emits: ["add-to-cart"],
  props: {
    products: {
      type: Array,
      required: true,
    },
    currency: {
      type: String,
      default: "XOF",
    },
    locale: {
      type: String,
      default: "fr-CI",
    },
    emptyText: {
      type: String,
      default: "No products found.",
    },
  },
  methods: {
    linkTag(product) {
      const url = product?.url || "";
      return url.startsWith("/") ? "RouterLink" : "a";
    },
    linkProps(product) {
      const url = product?.url || "#";
      return url.startsWith("/") ? { to: url } : { href: url };
    },
    getBadges(product) {
      if (!product || !Array.isArray(product.tags)) {
        return [];
      }
      const map = {
        new: "New",
        restock: "Restock",
      };
      return product.tags
        .map((tag) => map[tag] || "")
        .filter(Boolean);
    },
    formatPrice(value) {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return "";
      }
      if (this.currency === "XOF") {
        const formatted = new Intl.NumberFormat(this.locale, {
          style: "decimal",
          maximumFractionDigits: 0,
        }).format(value);
        return `${formatted} FCFA`;
      }
      return new Intl.NumberFormat(this.locale, {
        style: "currency",
        currency: this.currency,
        maximumFractionDigits: 2,
      }).format(value);
    },
  },
};
</script>

<style scoped>
.pg-grid {
  --pg-text: var(--text, #0b0b0b);
  --pg-muted: var(--muted, #5f5f5f);
  --pg-accent: var(--accent, #e10600);
  --pg-border: var(--line, #0b0b0b);
  --pg-card-bg: #ffffff;
  --pg-image-bg: #ffffff;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 26px 18px;
  font-family: "Space Grotesk", "Karla", Arial, sans-serif;
}

.pg-card {
  margin: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pg-card:hover {
  transform: translateY(-6px);
}

.pg-image-wrap {
  position: relative;
  display: block;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--pg-image-bg);
  border: 1px solid var(--pg-border);
  border-radius: 14px;
  text-decoration: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.pg-image-wrap::after {
  content: "";
  position: absolute;
  inset: 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.pg-image-wrap:focus-visible {
  outline: 2px solid var(--pg-accent);
  outline-offset: 3px;
}

.pg-card:hover .pg-image-wrap {
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.16);
  border-color: #000;
}

.pg-card:hover .pg-image-wrap::after,
.pg-image-wrap:focus-visible::after {
  opacity: 1;
}

.pg-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  padding: 0;
  box-sizing: border-box;
  transition: opacity 0.25s ease, transform 0.35s ease;
  background: transparent;
}

.pg-picture {
  display: block;
  width: 100%;
  height: 100%;
}

.pg-image-wrap:hover .pg-image-primary {
  transform: scale(1.04);
}

.pg-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: repeating-linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.04),
      rgba(0, 0, 0, 0.04) 10px,
      rgba(0, 0, 0, 0.02) 10px,
      rgba(0, 0, 0, 0.02) 20px
    ),
    #f7f7f7;
}

.pg-placeholder-text {
  padding: 6px 10px;
  border: 1px solid var(--pg-border);
  border-radius: 999px;
  font: 600 11px/1 "Space Grotesk", "Karla", Arial, sans-serif;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--pg-muted);
  background: #fff;
}

.pg-badges {
  position: absolute;
  inset: 10px 10px auto 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  pointer-events: none;
}

.pg-view {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--pg-border);
  background: #fff;
  font: 600 10px/1 "Space Grotesk", "Karla", Arial, sans-serif;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--pg-text);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

.pg-card:hover .pg-view,
.pg-image-wrap:focus-visible .pg-view {
  opacity: 1;
  transform: translateY(0);
}

.pg-badge-tag {
  background: #0b0b0b;
  margin-left: auto;
}

.pg-title {
  margin: 12px 0 4px;
  font: 600 14px/1.4 "Space Grotesk", "Karla", Arial, sans-serif;
  text-align: left;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--pg-text);
}

.pg-title a {
  color: inherit;
  text-decoration: none;
}

.pg-title :deep(a) {
  color: inherit;
  text-decoration: none;
}

.pg-title a:hover,
.pg-title a:focus-visible {
  text-decoration: underline;
  text-decoration-thickness: 2px;
}

.pg-title :deep(a:hover),
.pg-title :deep(a:focus-visible) {
  text-decoration: underline;
  text-decoration-thickness: 2px;
}

.pg-price {
  margin: 0;
  text-align: left;
  font: 500 14px/1.4 "Space Grotesk", "Karla", Arial, sans-serif;
  color: var(--pg-text);
}

.pg-add {
  margin-top: 10px;
  width: 100%;
  border: 1px solid var(--pg-border);
  background: #0b0b0b;
  color: #fff;
  padding: 10px 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pg-add:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
}

.pg-add:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.pg-sold-out {
  font-weight: 700;
  text-transform: uppercase;
}

.pg-empty {
  text-align: center;
  font: 500 14px/1.4 "Space Grotesk", "Karla", Arial, sans-serif;
  color: var(--pg-muted);
}

.pg-badge {
  position: relative;
  padding: 4px 8px;
  background: var(--pg-accent);
  color: #fff;
  font: 700 11px/1 "Space Grotesk", "Karla", Arial, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 999px;
}

@media (max-width: 700px) {
  .pg-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px 14px;
  }
}
</style>
