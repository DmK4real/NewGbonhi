import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const targetPort = env.API_PORT || "8787";
  const frontendPort = Number(env.VITE_PORT || 4000);
  const optimizeImages = env.SKIP_IMAGE_OPTIMIZER !== "true";

  return {
    plugins: [
      vue(),
      optimizeImages &&
        ViteImageOptimizer({
          /* no default options */
        }),
    ].filter(Boolean),
    server: {
      port: frontendPort,
      strictPort: false,
      proxy: {
        "/api": {
          target: `http://localhost:${targetPort}`,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: frontendPort,
      strictPort: true,
    },
    test: {
      environment: "node",
    },
  };
});
