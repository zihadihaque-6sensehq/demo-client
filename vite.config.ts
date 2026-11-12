import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/customers": {
        target: process.env.VITE_API_BASE_URL ?? "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
