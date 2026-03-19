<template>
  <div class="scroll-progress" aria-hidden="true">
    <div class="scroll-progress-bar" :style="{ width: `${progress}%` }" />
  </div>
</template>

<script>
export default {
  name: "ScrollProgress",
  data() {
    return {
      progress: 0,
    };
  },
  mounted() {
    this.updateProgress();
    window.addEventListener("scroll", this.updateProgress, { passive: true });
    window.addEventListener("resize", this.updateProgress);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.updateProgress);
    window.removeEventListener("resize", this.updateProgress);
  },
  methods: {
    updateProgress() {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      const clientHeight = window.innerHeight || 1;
      const maxScroll = Math.max(1, scrollHeight - clientHeight);
      this.progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
    },
  },
};
</script>

<style scoped>
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  width: 100%;
  background: rgba(0, 0, 0, 0.08);
  z-index: 200;
}

.scroll-progress-bar {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #0b0b0b, #e10600);
  transition: width 0.12s ease-out;
}
</style>
