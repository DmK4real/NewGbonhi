import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const targetPort = env.API_PORT || "8787";
  const frontendPort = Number(env.VITE_PORT || 4000);

  return {
    plugins: [vue()],
    server: {
      port: frontendPort,
      strictPort: true,
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
  };
});
