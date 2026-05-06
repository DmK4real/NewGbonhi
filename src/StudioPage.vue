<template>
  <div class="studio-page">
    <header class="shop-header">
      <div class="brand">
        <img class="brand-logo" :src="logoUrl" alt="NewGbonhi logo" />
        <div class="brand-meta">
          <p class="brand-name">NewGbonhi</p>
          <p class="brand-tagline">Digital Atelier // Build your own fit</p>
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
        <RouterLink :class="{ 'is-active': $route.name === 'studio' }" to="/studio">
          Studio
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

    <section class="studio-hero">
      <div class="studio-copy">
        <p class="studio-kicker">Digital Atelier</p>
        <h1>Create freely, like a mini design studio</h1>
        <p class="studio-sub">
          Change template, change color, add multiple stickers, move them anywhere,
          and build your final custom piece.
        </p>
      </div>
      <div class="studio-count">
        <strong>{{ studioTemplates.length }}</strong>
        <span>templates</span>
      </div>
    </section>

    <main class="studio-main">
      <section class="studio-preview">
        <p class="section-kicker">Canvas</p>
        <div class="mockup-stage">
          <div class="mockup-shirt">
            <img
              v-if="selectedColor?.mockup"
              class="mockup-base"
              :src="selectedColor.mockup"
              :alt="`${selectedTemplate?.label || 'Template'} ${selectedColor?.label || ''}`"
            />
            <div
              ref="designZone"
              class="mockup-design-zone"
              :style="designZoneStyle"
              @dblclick.stop="onDesignZoneDoubleClick"
            >
              <button
                v-for="sticker in stickers"
                :key="sticker.id"
                type="button"
                class="sticker-item"
                :class="[
                  { active: selectedStickerId === sticker.id },
                  `render-${stickerRenderMode}`,
                ]"
                :style="stickerStyle(sticker)"
                :aria-label="designById(sticker.designId)?.title || 'Sticker'"
                @pointerdown.stop.prevent="onStickerPointerDown($event, sticker.id)"
                @click.stop="selectSticker(sticker.id)"
              >
                <img
                  class="sticker-art sticker-art-flat"
                  :src="designById(sticker.designId)?.imagePrimary || ''"
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                />
                <img
                  class="sticker-art sticker-art-print"
                  :src="designById(sticker.designId)?.imagePrimary || ''"
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                />
                <img
                  class="sticker-art sticker-art-depth"
                  :src="designById(sticker.designId)?.imagePrimary || ''"
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                />
                <span
                  class="sticker-art-fiber"
                  :style="stickerFiberStyle(sticker)"
                  aria-hidden="true"
                ></span>
                <img
                  class="sticker-art sticker-art-highlight"
                  :src="designById(sticker.designId)?.imagePrimary || ''"
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                />
              </button>
            </div>
          </div>
        </div>

        <div class="canvas-actions">
          <button type="button" class="ghost-btn" @click="addSticker()">
            Add sticker
          </button>
          <button
            type="button"
            class="ghost-btn"
            :disabled="!selectedSticker"
            @click="duplicateSelectedSticker"
          >
            Duplicate selected
          </button>
          <button
            type="button"
            class="danger-btn"
            :disabled="!selectedSticker"
            @click="removeSelectedSticker"
          >
            Remove selected
          </button>
          <button
            type="button"
            class="ghost-btn"
            :disabled="stickers.length === 0"
            @click="clearCanvas"
          >
            Clear canvas
          </button>
        </div>

        <div class="preview-meta">
          <p><strong>Template:</strong> {{ selectedTemplate?.label || "-" }}</p>
          <p><strong>Color:</strong> {{ selectedColor?.label || "-" }}</p>
          <p><strong>Size:</strong> {{ selectedSize }}</p>
          <p><strong>Composition:</strong> {{ compositionSummary || "-" }}</p>
          <p><strong>Price:</strong> {{ formatPrice(basePrice) }}</p>
        </div>
      </section>

      <section class="studio-controls">
        <p class="section-kicker">Controls</p>

        <div class="control-block">
          <h2>Template</h2>
          <div class="template-grid">
            <button
              v-for="template in studioTemplates"
              :key="template.id"
              type="button"
              :class="{ active: selectedTemplateId === template.id }"
              @click="selectTemplate(template.id)"
            >
              {{ template.label }}
            </button>
          </div>
        </div>

        <div class="control-block">
          <h2>Color</h2>
          <div class="color-grid">
            <button
              v-for="color in availableColors"
              :key="color.id"
              type="button"
              :class="{ active: selectedColorId === color.id }"
              @click="selectedColorId = color.id"
            >
              <span class="color-dot" :style="{ background: color.swatch }"></span>
              {{ color.label }}
            </button>
          </div>
        </div>

        <div class="control-block">
          <h2>Size</h2>
          <div class="size-grid">
            <button
              v-for="size in sizeOptions"
              :key="size"
              type="button"
              :class="{ active: selectedSize === size }"
              @click="selectedSize = size"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <div class="control-block">
          <h2>Sticker render</h2>
          <div class="render-mode-grid">
            <button
              type="button"
              :class="{ active: stickerRenderMode === 'sticker' }"
              @click="stickerRenderMode = 'sticker'"
            >
              Classic sticker
            </button>
            <button
              type="button"
              :class="{ active: stickerRenderMode === 'print' }"
              @click="stickerRenderMode = 'print'"
            >
              Textile print
            </button>
            <button
              type="button"
              :class="{ active: stickerRenderMode === 'puff' }"
              @click="stickerRenderMode = 'puff'"
            >
              Puff print
            </button>
          </div>
          <div v-if="stickerRenderMode !== 'sticker'" class="render-profile-grid">
            <button
              v-for="profile in renderProfiles"
              :key="profile.id"
              type="button"
              :class="{ active: selectedRenderProfileId === profile.id }"
              @click="selectedRenderProfileId = profile.id"
            >
              {{ profile.label }}
            </button>
          </div>
          <label v-if="stickerRenderMode !== 'sticker'" class="print-strength-control">
            Print intensity
            <input
              v-model.number="printBlendStrength"
              type="range"
              min="45"
              max="100"
              step="1"
            />
            <span>{{ printBlendStrength }}%</span>
          </label>
          <p class="render-hint">{{ renderModeHint }}</p>
        </div>

        <div class="control-block">
          <h2>Selected sticker</h2>
          <div v-if="selectedSticker" class="sticker-edit">
            <p class="sticker-name">
              {{ designById(selectedSticker.designId)?.title || "Sticker" }}
            </p>
            <label>
              Design
              <select v-model="selectedSticker.designId">
                <option
                  v-for="design in studioDesigns"
                  :key="design.id"
                  :value="design.id"
                >
                  {{ design.title }}
                </option>
              </select>
            </label>
            <label>
              Scale
              <input
                v-model.number="selectedSticker.scale"
                type="range"
                min="40"
                max="220"
                step="1"
              />
              <span>{{ selectedSticker.scale }}%</span>
            </label>
            <label>
              Rotation
              <input
                v-model.number="selectedSticker.rotation"
                type="range"
                min="-180"
                max="180"
                step="1"
              />
              <span>{{ selectedSticker.rotation }} deg</span>
            </label>
            <div class="layer-actions">
              <button type="button" class="ghost-btn" @click="bringSelectedToFront">
                Layer to front
              </button>
              <button type="button" class="ghost-btn" @click="sendSelectedToBack">
                Layer to back
              </button>
            </div>
          </div>
          <p v-else class="sticker-empty">
            Select a sticker in the canvas to edit it.
          </p>
        </div>

        <div class="control-block">
          <h2>Layout presets</h2>
          <div class="preset-grid">
            <button
              v-for="preset in layoutPresets"
              :key="preset.id"
              type="button"
              class="ghost-btn"
              :disabled="stickers.length === 0"
              @click="applyLayoutPreset(preset.id)"
            >
              {{ preset.label }}
            </button>
          </div>
          <p class="preset-hint">
            Double-click the shirt area to place the active sticker directly.
          </p>
        </div>

        <button
          class="add-button"
          type="button"
          :disabled="stickers.length === 0"
          @click="addStudioItemToCart"
        >
          Add custom piece to cart
        </button>
      </section>
    </main>

    <section class="design-catalog">
      <div class="catalog-head">
        <p class="section-kicker">Sticker Library</p>
        <h2>Pick and stack as many as you want</h2>
      </div>
      <div class="design-grid">
        <button
          v-for="design in studioDesigns"
          :key="design.id"
          type="button"
          class="design-card"
          :class="{ active: activeDesignId === design.id }"
          @click="activeDesignId = design.id"
          @dblclick="addSticker(design.id)"
        >
          <div class="design-media">
            <img :src="design.imagePrimary" :alt="design.title" loading="lazy" />
          </div>
          <p class="design-title">{{ design.title }}</p>
          <p class="design-type">{{ design.category }}</p>
        </button>
      </div>
      <p class="catalog-hint">
        Tip: click a design to select it, double-click to add it directly.
      </p>
    </section>

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

    <div class="toast" :class="{ show: toastVisible }" role="status">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import CartPanel from "./components/CartPanel.vue";
import { cartStore } from "./data/cart.ts";
import { studioDesigns } from "./data/studioDesigns.ts";
import studioMockups from "./data/studioMockups.json";

const logoUrl = new URL("./assets/newgbonhi-logo.png", import.meta.url).href;
const mockupModules = import.meta.glob("./assets/studio/mockups/*.png", {
  eager: true,
  import: "default",
});

const resolveMockup = (assetName) =>
  mockupModules[`./assets/studio/mockups/${assetName}`] || "";

const studioTemplates = (studioMockups?.templates || []).map((template) => ({
  ...template,
  colors: (template.colors || []).map((color) => ({
    ...color,
    mockup: resolveMockup(color.asset),
  })),
}));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const renderProfiles = [
  {
    id: "ultra-realistic",
    label: "Ultra realistic",
    tuning: { ink: 1, depth: 1, highlight: 1, fiber: 1, puff: 1 },
  },
  {
    id: "clean-print",
    label: "Clean print",
    tuning: { ink: 1.08, depth: 0.72, highlight: 0.82, fiber: 0.66, puff: 0.78 },
  },
  {
    id: "vintage-fade",
    label: "Vintage fade",
    tuning: { ink: 0.8, depth: 0.88, highlight: 0.7, fiber: 1.15, puff: 0.68 },
  },
];

export default {
  name: "StudioPage",
  components: {
    CartPanel,
  },
  data() {
    return {
      logoUrl,
      studioDesigns,
      studioTemplates,
      cartOpen: false,
      toastMessage: "",
      toastVisible: false,
      basePrice: 15000,
      selectedTemplateId: studioTemplates[0]?.id || "",
      selectedColorId: studioTemplates[0]?.colors?.[0]?.id || "",
      selectedSize: "M",
      sizeOptions: ["XS", "S", "M", "L", "XL", "XXL"],
      activeDesignId: studioDesigns[0]?.id || "",
      layoutPresets: [
        { id: "center-stack", label: "Center stack" },
        { id: "left-chest", label: "Left chest" },
        { id: "top-row", label: "Top row" },
        { id: "grid", label: "Grid" },
      ],
      stickers: [],
      selectedStickerId: "",
      nextStickerSeed: 1,
      dragState: null,
      renderProfiles,
      selectedRenderProfileId: renderProfiles[0]?.id || "",
      stickerRenderMode: "print",
      printBlendStrength: 82,
    };
  },
  mounted() {
    this.addSticker();
    window.addEventListener("keydown", this.onGlobalKeyDown);
  },
  beforeUnmount() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.detachDragListeners();
    window.removeEventListener("keydown", this.onGlobalKeyDown);
  },
  computed: {
    cartCount() {
      return cartStore.cartCount.value;
    },
    selectedTemplate() {
      return (
        this.studioTemplates.find((template) => template.id === this.selectedTemplateId) ||
        this.studioTemplates[0] ||
        null
      );
    },
    availableColors() {
      return this.selectedTemplate?.colors || [];
    },
    selectedColor() {
      return (
        this.availableColors.find((color) => color.id === this.selectedColorId) ||
        this.availableColors[0] ||
        null
      );
    },
    selectedSticker() {
      return this.stickers.find((item) => item.id === this.selectedStickerId) || null;
    },
    printBlendRatio() {
      return clamp(this.printBlendStrength / 100, 0.45, 1);
    },
    activeRenderProfile() {
      return (
        this.renderProfiles.find((profile) => profile.id === this.selectedRenderProfileId) ||
        this.renderProfiles[0] ||
        null
      );
    },
    renderModeHint() {
      const profileLabel = this.activeRenderProfile?.label || "Ultra realistic";
      if (this.stickerRenderMode === "print") {
        return `${profileLabel} preset keeps ink inside fabric folds with subtle grain.`;
      }
      if (this.stickerRenderMode === "puff") {
        return `${profileLabel} profile adds raised volume and soft edge shadow like thick screen ink.`;
      }
      return "Classic sticker keeps a clean flat overlay look.";
    },
    designZoneStyle() {
      const box = this.selectedTemplate?.designBox;
      if (!box) {
        return {
          left: "25%",
          top: "20%",
          width: "50%",
          height: "58%",
        };
      }
      return {
        left: `${box.xPct}%`,
        top: `${box.yPct}%`,
        width: `${box.wPct}%`,
        height: `${box.hPct}%`,
      };
    },
    compositionSummary() {
      if (!this.stickers.length) {
        return "";
      }
      const counts = {};
      this.stickers.forEach((item) => {
        const designName = this.designById(item.designId)?.title || "Sticker";
        counts[designName] = (counts[designName] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => (count > 1 ? `${name} x${count}` : name))
        .join(", ");
    },
  },
  watch: {
    selectedTemplateId: {
      immediate: false,
      handler() {
        const firstColor = this.availableColors[0]?.id || "";
        if (!this.availableColors.some((color) => color.id === this.selectedColorId)) {
          this.selectedColorId = firstColor;
        }
      },
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
    toggleCart() {
      this.cartOpen = !this.cartOpen;
    },
    selectTemplate(templateId) {
      this.selectedTemplateId = templateId;
    },
    designById(designId) {
      return this.studioDesigns.find((design) => design.id === designId) || null;
    },
    addSticker(
      designId = "",
      options = { xPct: 50, yPct: 50, scale: 100, rotation: 0 }
    ) {
      const targetId = designId || this.activeDesignId || this.studioDesigns[0]?.id;
      if (!targetId) {
        return;
      }
      const id = `stk-${this.nextStickerSeed++}`;
      const maxZ = this.stickers.reduce((max, item) => Math.max(max, item.zIndex), 0);
      this.stickers.push({
        id,
        designId: targetId,
        xPct: clamp(options.xPct ?? 50, 0, 100),
        yPct: clamp(options.yPct ?? 50, 0, 100),
        scale: clamp(options.scale ?? 100, 40, 220),
        rotation: clamp(options.rotation ?? 0, -180, 180),
        zIndex: maxZ + 1,
      });
      this.selectedStickerId = id;
    },
    duplicateSelectedSticker() {
      if (!this.selectedSticker) {
        return;
      }
      const source = this.selectedSticker;
      const id = `stk-${this.nextStickerSeed++}`;
      const maxZ = this.stickers.reduce((max, item) => Math.max(max, item.zIndex), 0);
      this.stickers.push({
        id,
        designId: source.designId,
        xPct: clamp(source.xPct + 6, 6, 94),
        yPct: clamp(source.yPct + 6, 6, 94),
        scale: source.scale,
        rotation: source.rotation,
        zIndex: maxZ + 1,
      });
      this.selectedStickerId = id;
    },
    removeSelectedSticker() {
      if (!this.selectedSticker) {
        return;
      }
      this.stickers = this.stickers.filter((item) => item.id !== this.selectedSticker.id);
      this.selectedStickerId = this.stickers[0]?.id || "";
    },
    clearCanvas() {
      this.stickers = [];
      this.selectedStickerId = "";
    },
    onDesignZoneDoubleClick(event) {
      const zone = this.$refs.designZone;
      if (!zone) {
        return;
      }
      const rect = zone.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }
      const xPct = ((event.clientX - rect.left) / rect.width) * 100;
      const yPct = ((event.clientY - rect.top) / rect.height) * 100;
      this.addSticker(this.activeDesignId, { xPct, yPct, scale: 100, rotation: 0 });
    },
    selectSticker(stickerId) {
      this.selectedStickerId = stickerId;
      this.bringStickerToFront(stickerId);
    },
    bringStickerToFront(stickerId) {
      const sticker = this.stickers.find((item) => item.id === stickerId);
      if (!sticker) {
        return;
      }
      const maxZ = this.stickers.reduce((max, item) => Math.max(max, item.zIndex), 0);
      sticker.zIndex = maxZ + 1;
      this.normalizeStickerLayerOrder();
    },
    bringSelectedToFront() {
      if (!this.selectedStickerId) {
        return;
      }
      this.bringStickerToFront(this.selectedStickerId);
    },
    sendSelectedToBack() {
      if (!this.selectedStickerId) {
        return;
      }
      const sticker = this.stickers.find((item) => item.id === this.selectedStickerId);
      if (!sticker) {
        return;
      }
      const minZ = this.stickers.reduce((min, item) => Math.min(min, item.zIndex), 0);
      sticker.zIndex = minZ - 1;
      this.normalizeStickerLayerOrder();
    },
    normalizeStickerLayerOrder() {
      const ordered = [...this.stickers].sort((a, b) => a.zIndex - b.zIndex);
      ordered.forEach((item, index) => {
        item.zIndex = index + 1;
      });
    },
    applyLayoutPreset(presetId) {
      if (!this.stickers.length) {
        return;
      }
      if (presetId === "left-chest") {
        this.stickers.forEach((item, index) => {
          item.xPct = clamp(34 + ((index % 3) - 1) * 4, 0, 100);
          item.yPct = clamp(34 + Math.floor(index / 3) * 10, 0, 100);
        });
        return;
      }
      if (presetId === "top-row") {
        const count = this.stickers.length;
        this.stickers.forEach((item, index) => {
          const ratio = count > 1 ? index / (count - 1) : 0.5;
          item.xPct = clamp(18 + ratio * 64, 0, 100);
          item.yPct = 24;
        });
        return;
      }
      if (presetId === "grid") {
        this.stickers.forEach((item, index) => {
          const col = index % 3;
          const row = Math.floor(index / 3);
          item.xPct = 32 + col * 18;
          item.yPct = 30 + row * 16;
        });
        return;
      }
      this.stickers.forEach((item, index) => {
        item.xPct = clamp(50 + ((index % 3) - 1) * 7, 0, 100);
        item.yPct = clamp(50 + Math.floor(index / 3) * 10, 0, 100);
      });
    },
    nudgeSelectedSticker(deltaXPct, deltaYPct) {
      if (!this.selectedSticker) {
        return;
      }
      this.selectedSticker.xPct = clamp(this.selectedSticker.xPct + deltaXPct, 0, 100);
      this.selectedSticker.yPct = clamp(this.selectedSticker.yPct + deltaYPct, 0, 100);
    },
    onGlobalKeyDown(event) {
      const targetTag =
        typeof event.target?.tagName === "string"
          ? event.target.tagName.toLowerCase()
          : "";
      if (targetTag === "input" || targetTag === "textarea" || targetTag === "select") {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (this.selectedSticker) {
          event.preventDefault();
          this.removeSelectedSticker();
        }
        return;
      }

      const step = event.shiftKey ? 2.5 : 1;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.nudgeSelectedSticker(-step, 0);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        this.nudgeSelectedSticker(step, 0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        this.nudgeSelectedSticker(0, -step);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this.nudgeSelectedSticker(0, step);
      }
    },
    stickerStyle(sticker) {
      const visualSize = clamp(sticker.scale ?? 100, 40, 220) * 0.36;
      const profileTuning = this.activeRenderProfile?.tuning || {};
      const inkFactor = profileTuning.ink ?? 1;
      const depthFactor = profileTuning.depth ?? 1;
      const highlightFactor = profileTuning.highlight ?? 1;
      const fiberFactor = profileTuning.fiber ?? 1;
      const puffFactor = profileTuning.puff ?? 1;
      const isPrint = this.stickerRenderMode === "print";
      const isPuff = this.stickerRenderMode === "puff";
      const printInkOpacity = clamp(
        (0.52 + this.printBlendRatio * 0.4) * inkFactor,
        0.45,
        0.98
      );
      const printDepthOpacity = clamp(
        (0.1 + this.printBlendRatio * 0.2) * depthFactor,
        0.08,
        0.42
      );
      const printHighlightOpacity = clamp(
        (0.04 + this.printBlendRatio * 0.12) * highlightFactor,
        0.04,
        0.24
      );
      const printFiberOpacity = clamp(
        (0.08 + this.printBlendRatio * 0.18) * fiberFactor,
        0.08,
        0.34
      );
      const puffInkOpacity = clamp(
        (0.56 + this.printBlendRatio * 0.3) * inkFactor,
        0.5,
        1
      );
      const puffDepthOpacity = clamp(
        (0.2 + this.printBlendRatio * 0.2) * depthFactor,
        0.16,
        0.52
      );
      const puffHighlightOpacity = clamp(
        (0.12 + this.printBlendRatio * 0.18) * highlightFactor,
        0.1,
        0.44
      );
      const puffFiberOpacity = clamp(
        (0.06 + this.printBlendRatio * 0.12) * fiberFactor,
        0.05,
        0.22
      );
      const puffLift = clamp((0.24 + this.printBlendRatio * 0.92) * puffFactor, 0.2, 1.5);
      const puffShadowAlpha = clamp(
        (0.16 + this.printBlendRatio * 0.28) * puffFactor,
        0.1,
        0.46
      );
      return {
        left: `${sticker.xPct}%`,
        top: `${sticker.yPct}%`,
        zIndex: sticker.zIndex,
        width: `${visualSize}%`,
        height: `${visualSize}%`,
        "--print-ink-opacity": isPrint ? `${printInkOpacity}` : "0",
        "--print-depth-opacity": isPrint ? `${printDepthOpacity}` : "0",
        "--print-highlight-opacity": isPrint ? `${printHighlightOpacity}` : "0",
        "--print-fiber-opacity": isPrint ? `${printFiberOpacity}` : "0",
        "--puff-ink-opacity": isPuff ? `${puffInkOpacity}` : "0",
        "--puff-depth-opacity": isPuff ? `${puffDepthOpacity}` : "0",
        "--puff-highlight-opacity": isPuff ? `${puffHighlightOpacity}` : "0",
        "--puff-fiber-opacity": isPuff ? `${puffFiberOpacity}` : "0",
        "--puff-lift": isPuff ? `${puffLift}` : "0",
        "--puff-shadow-alpha": isPuff ? `${puffShadowAlpha}` : "0",
        transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
      };
    },
    stickerFiberStyle(sticker) {
      const designSrc = this.designById(sticker.designId)?.imagePrimary || "";
      if (!designSrc) {
        return {
          opacity: 0,
        };
      }
      const maskValue = `url("${designSrc}")`;
      return {
        "--sticker-mask-image": maskValue,
      };
    },
    onStickerPointerDown(event, stickerId) {
      const zone = this.$refs.designZone;
      if (!zone) {
        return;
      }
      const sticker = this.stickers.find((item) => item.id === stickerId);
      if (!sticker) {
        return;
      }
      this.selectSticker(stickerId);
      const rect = zone.getBoundingClientRect();
      this.dragState = {
        stickerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startXPct: sticker.xPct,
        startYPct: sticker.yPct,
        zoneWidth: rect.width,
        zoneHeight: rect.height,
      };
      this.attachDragListeners();
    },
    onGlobalPointerMove(event) {
      if (!this.dragState) {
        return;
      }
      const target = this.stickers.find((item) => item.id === this.dragState.stickerId);
      if (!target) {
        return;
      }
      const dxPct =
        ((event.clientX - this.dragState.startClientX) / this.dragState.zoneWidth) * 100;
      const dyPct =
        ((event.clientY - this.dragState.startClientY) / this.dragState.zoneHeight) * 100;
      target.xPct = clamp(this.dragState.startXPct + dxPct, 0, 100);
      target.yPct = clamp(this.dragState.startYPct + dyPct, 0, 100);
    },
    onGlobalPointerUp() {
      this.dragState = null;
      this.detachDragListeners();
    },
    attachDragListeners() {
      window.addEventListener("pointermove", this.onGlobalPointerMove);
      window.addEventListener("pointerup", this.onGlobalPointerUp);
      window.addEventListener("pointercancel", this.onGlobalPointerUp);
    },
    detachDragListeners() {
      window.removeEventListener("pointermove", this.onGlobalPointerMove);
      window.removeEventListener("pointerup", this.onGlobalPointerUp);
      window.removeEventListener("pointercancel", this.onGlobalPointerUp);
    },
    loadImage(src) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
        image.src = src;
      });
    },
    async buildStudioPreviewImage() {
      if (!this.selectedColor?.mockup) {
        return "";
      }
      if (typeof document === "undefined") {
        return this.selectedColor.mockup;
      }
      const designBox = this.selectedTemplate?.designBox;
      if (!designBox) {
        return this.selectedColor.mockup;
      }

      try {
        const baseImage = await this.loadImage(this.selectedColor.mockup);
        const baseWidth = baseImage.naturalWidth || baseImage.width;
        const baseHeight = baseImage.naturalHeight || baseImage.height;
        if (!baseWidth || !baseHeight) {
          return this.selectedColor.mockup;
        }

        const maxDimension = 860;
        const resizeRatio = Math.min(1, maxDimension / Math.max(baseWidth, baseHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(420, Math.round(baseWidth * resizeRatio));
        canvas.height = Math.max(420, Math.round(baseHeight * resizeRatio));

        const context = canvas.getContext("2d");
        if (!context) {
          return this.selectedColor.mockup;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        const zoneX = (designBox.xPct / 100) * canvas.width;
        const zoneY = (designBox.yPct / 100) * canvas.height;
        const zoneWidth = (designBox.wPct / 100) * canvas.width;
        const zoneHeight = (designBox.hPct / 100) * canvas.height;
        const sortedStickers = [...this.stickers].sort((a, b) => a.zIndex - b.zIndex);
        const loadedDesigns = {};

        for (const sticker of sortedStickers) {
          const design = this.designById(sticker.designId);
          if (!design?.imagePrimary) {
            continue;
          }

          if (!loadedDesigns[design.id]) {
            try {
              loadedDesigns[design.id] = await this.loadImage(design.imagePrimary);
            } catch (error) {
              loadedDesigns[design.id] = null;
            }
          }

          const designImage = loadedDesigns[design.id];
          if (!designImage) {
            continue;
          }

          const visualSize = clamp(sticker.scale ?? 100, 40, 220) * 0.36;
          const stickerWidth = zoneWidth * (visualSize / 100);
          const stickerHeight = zoneHeight * (visualSize / 100);
          const centerX = zoneX + zoneWidth * (sticker.xPct / 100);
          const centerY = zoneY + zoneHeight * (sticker.yPct / 100);
          const rotation = ((sticker.rotation || 0) * Math.PI) / 180;

          context.save();
          context.translate(centerX, centerY);
          context.rotate(rotation);

          if (this.stickerRenderMode === "print") {
            context.globalAlpha = clamp(0.74 + this.printBlendRatio * 0.2, 0.68, 0.96);
          } else if (this.stickerRenderMode === "puff") {
            context.globalAlpha = clamp(0.76 + this.printBlendRatio * 0.18, 0.7, 0.98);
            context.shadowColor = "rgba(0, 0, 0, 0.28)";
            context.shadowBlur = Math.max(1.4, stickerWidth * 0.015);
            context.shadowOffsetY = Math.max(0.8, stickerWidth * 0.006);
          } else {
            context.globalAlpha = 1;
          }

          context.drawImage(
            designImage,
            -stickerWidth / 2,
            -stickerHeight / 2,
            stickerWidth,
            stickerHeight
          );
          context.restore();
        }

        return canvas.toDataURL("image/webp", 0.92);
      } catch (error) {
        return this.selectedColor.mockup;
      }
    },
    buildCompositionFingerprint() {
      const renderToken = [
        this.stickerRenderMode,
        this.selectedRenderProfileId,
        Math.round(this.printBlendStrength),
      ].join(":");
      const payload = this.stickers
        .map((item) => {
          const x = Math.round(item.xPct);
          const y = Math.round(item.yPct);
          const scale = Math.round(item.scale);
          const rotation = Math.round(item.rotation);
          return `${item.designId}:${x}:${y}:${scale}:${rotation}`;
        })
        .sort()
        .join("|");
      let hash = 0;
      const seed = `${renderToken}|${payload}`;
      for (let index = 0; index < seed.length; index += 1) {
        hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
      }
      return hash.toString(36);
    },
    async addStudioItemToCart() {
      if (!this.selectedTemplate || !this.selectedColor || this.stickers.length === 0) {
        return;
      }

      const compositionId = this.buildCompositionFingerprint();
      const designSummary = this.compositionSummary || "Custom composition";
      const composedPreview = await this.buildStudioPreviewImage();

      cartStore.addToCart({
        id: `studio-${this.selectedTemplate.id}`,
        slug: `studio-${this.selectedTemplate.id}-${this.selectedColor.id}`,
        title: `Custom ${this.selectedTemplate.label}`,
        price: this.basePrice,
        imagePrimary: composedPreview || this.selectedColor.mockup,
        url: "/studio",
        selectedSize: this.selectedSize,
        selectedColor: this.selectedColor.label,
        selectedColorId: `${this.selectedTemplate.id}-${this.selectedColor.id}`,
        selectedDesignId: `${this.selectedTemplate.id}-${compositionId}`,
        selectedDesignName: designSummary,
        selectedDesignCategory: this.selectedTemplate.family,
        isCustomStudio: true,
      });

      this.cartOpen = true;
      this.showToast("Custom piece added to cart");
    },
    showToast(message) {
      this.toastMessage = message;
      this.toastVisible = true;
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }
      this.toastTimer = setTimeout(() => {
        this.toastVisible = false;
      }, 2200);
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

.studio-page {
  --text: #0b0b0b;
  --muted: #606060;
  --accent: #e10600;
  --line: #0b0b0b;
  max-width: 1240px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  position: relative;
  z-index: 0;
}

.studio-page::before {
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

.studio-hero {
  margin-top: 30px;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 24px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
}

.studio-kicker,
.section-kicker {
  margin: 0;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 11px;
  font-weight: 600;
}

.studio-copy h1 {
  margin: 8px 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: "Archivo Black", "Space Grotesk", Arial, sans-serif;
}

.studio-sub {
  margin: 0;
  color: var(--muted);
  max-width: 640px;
}

.studio-count {
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 16px;
  padding: 12px 16px;
  background: #f8f8f8;
  display: grid;
  gap: 4px;
  min-width: 160px;
  text-align: center;
}

.studio-count strong {
  font-size: 28px;
  line-height: 1;
}

.studio-count span {
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  color: var(--muted);
}

.studio-main {
  margin-top: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 22px;
}

.studio-preview,
.studio-controls,
.design-catalog {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #fff;
  padding: 20px;
}

.mockup-stage {
  --mockup-stage-height: clamp(380px, 62vh, 560px);
  margin-top: 16px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.8), transparent 55%),
    #efefef;
  display: grid;
  place-items: center;
  height: var(--mockup-stage-height);
  min-height: 380px;
  overflow: hidden;
}

.mockup-shirt {
  position: relative;
  display: inline-block;
  width: fit-content;
  max-width: min(560px, 100%);
  max-height: calc(var(--mockup-stage-height) - 36px);
}

.mockup-base {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: calc(var(--mockup-stage-height) - 36px);
  object-fit: contain;
  display: block;
  margin: 0 auto;
  user-select: none;
  pointer-events: none;
}

.mockup-design-zone {
  position: absolute;
  overflow: hidden;
  touch-action: none;
  isolation: isolate;
}

.sticker-item {
  position: absolute;
  border: none;
  background: transparent;
  padding: 0;
  cursor: grab;
  transform-origin: center center;
  user-select: none;
}

.sticker-item:active {
  cursor: grabbing;
}

.sticker-item.active {
  outline: none;
}

.sticker-item:focus-visible {
  outline: none;
}

.sticker-art,
.sticker-art-fiber {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

.sticker-art-flat {
  opacity: 1;
}

.sticker-art-print,
.sticker-art-depth,
.sticker-art-highlight,
.sticker-art-fiber {
  opacity: 0;
}

.sticker-item.render-print .sticker-art-flat {
  opacity: 0;
}

.sticker-item.render-print .sticker-art-print {
  opacity: var(--print-ink-opacity, 0.86);
  mix-blend-mode: multiply;
  filter: saturate(1.06) contrast(0.96);
}

.sticker-item.render-print .sticker-art-depth {
  opacity: var(--print-depth-opacity, 0.22);
  mix-blend-mode: soft-light;
  filter: grayscale(1) contrast(185%);
}

.sticker-item.render-print .sticker-art-highlight {
  opacity: var(--print-highlight-opacity, 0.12);
  mix-blend-mode: screen;
  filter: blur(0.25px) brightness(1.08);
}

.sticker-item.render-puff .sticker-art-flat {
  opacity: 0;
}

.sticker-item.render-puff .sticker-art-print {
  opacity: var(--puff-ink-opacity, 0.82);
  mix-blend-mode: multiply;
  filter:
    saturate(1.08)
    contrast(0.98)
    drop-shadow(
      0 calc(var(--puff-lift, 0.9) * 0.48px)
      calc(var(--puff-lift, 0.9) * 1.2px)
      rgba(0, 0, 0, var(--puff-shadow-alpha, 0.28))
    )
    drop-shadow(
      0 calc(var(--puff-lift, 0.9) * -0.35px)
      calc(var(--puff-lift, 0.9) * 0.95px)
      rgba(255, 255, 255, 0.3)
    );
  transform: translateY(calc(var(--puff-lift, 0.9) * -0.35px));
}

.sticker-item.render-puff .sticker-art-depth {
  opacity: var(--puff-depth-opacity, 0.28);
  mix-blend-mode: multiply;
  filter: grayscale(1) contrast(210%) blur(0.3px);
  transform: translateY(calc(var(--puff-lift, 0.9) * 0.4px));
}

.sticker-item.render-puff .sticker-art-highlight {
  opacity: var(--puff-highlight-opacity, 0.24);
  mix-blend-mode: screen;
  filter: brightness(1.2) blur(0.35px);
  transform: translateY(calc(var(--puff-lift, 0.9) * -0.5px));
}

.sticker-art-fiber {
  background-image:
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.24) 0 1px,
      rgba(255, 255, 255, 0) 1px 3px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.22) 0 1px,
      rgba(0, 0, 0, 0) 1px 4px
    );
  mix-blend-mode: overlay;
  -webkit-mask-image: var(--sticker-mask-image);
  mask-image: var(--sticker-mask-image);
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.sticker-item.render-print .sticker-art-fiber {
  opacity: var(--print-fiber-opacity, 0.22);
}

.sticker-item.render-puff .sticker-art-fiber {
  opacity: var(--puff-fiber-opacity, 0.1);
}

.canvas-actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ghost-btn,
.danger-btn {
  border: 1px solid var(--line);
  background: #fff;
  padding: 8px 12px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10px;
  cursor: pointer;
}

.danger-btn {
  border-color: #b10000;
  color: #b10000;
  background: #fff4f4;
}

.ghost-btn:disabled,
.danger-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preview-meta {
  margin-top: 14px;
  display: grid;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
}

.preview-meta p {
  margin: 0;
}

.control-block {
  margin-top: 14px;
}

.control-block h2 {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

.template-grid button,
.color-grid button,
.size-grid button,
.render-mode-grid button,
.render-profile-grid button {
  border: 1px solid var(--line);
  background: #fff;
  padding: 8px 12px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 10px;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.template-grid button.active,
.color-grid button.active,
.size-grid button.active,
.render-mode-grid button.active,
.render-profile-grid button.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.color-grid,
.size-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.render-mode-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.render-profile-grid {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.print-strength-control {
  margin-top: 10px;
  display: grid;
  gap: 4px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10px;
}

.print-strength-control span {
  font-size: 11px;
  color: var(--muted);
}

.render-hint {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.color-dot {
  width: 13px;
  height: 13px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.22);
  flex: 0 0 auto;
}

.sticker-edit {
  border: 1px dashed rgba(0, 0, 0, 0.24);
  border-radius: 12px;
  padding: 10px;
  display: grid;
  gap: 8px;
}

.sticker-name {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
}

.sticker-edit label {
  display: grid;
  gap: 4px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10px;
}

.sticker-edit select {
  border: 1px solid rgba(0, 0, 0, 0.22);
  background: #fff;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 11px;
}

.sticker-edit span {
  font-size: 11px;
  color: var(--muted);
}

.layer-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.sticker-empty {
  margin: 0;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10px;
}

.preset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.preset-hint {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.add-button {
  margin-top: 20px;
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

.add-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.design-catalog {
  margin-top: 24px;
}

.catalog-head h2 {
  margin: 8px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.design-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.design-card {
  border: 1px solid rgba(0, 0, 0, 0.16);
  background: #fff;
  border-radius: 14px;
  padding: 10px;
  text-align: left;
  cursor: pointer;
}

.design-card.active {
  border-color: var(--accent);
  box-shadow: 0 10px 20px rgba(225, 6, 0, 0.12);
}

.design-media {
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background: #f1f1f1;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.design-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.design-title {
  margin: 10px 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
}

.design-type {
  margin: 0;
  color: var(--muted);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.catalog-hint {
  margin: 12px 0 0;
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.shop-footer {
  margin-top: 42px;
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
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links a {
  color: inherit;
  text-decoration: none;
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: #0b0b0b;
  color: #fff;
  padding: 12px 16px;
  border-radius: 999px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 150;
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
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
  .studio-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .studio-page {
    padding: 24px 16px 40px;
  }

  .shop-header {
    align-items: flex-start;
  }

  .shop-cta {
    width: 100%;
  }

  .studio-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .studio-count {
    width: 100%;
  }

  .mockup-stage {
    --mockup-stage-height: clamp(280px, 72vw, 420px);
    height: var(--mockup-stage-height);
    min-height: 280px;
  }

  .mockup-shirt {
    max-width: 100%;
    max-height: calc(var(--mockup-stage-height) - 36px);
  }

  .template-grid {
    grid-template-columns: 1fr;
  }

  .canvas-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .canvas-actions .ghost-btn,
  .canvas-actions .danger-btn {
    width: 100%;
  }

  .layer-actions,
  .preset-grid,
  .render-mode-grid,
  .render-profile-grid {
    grid-template-columns: 1fr;
  }

  .toast {
    right: 16px;
    left: 16px;
    text-align: center;
  }
}
</style>
