import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ================================
// Indian Market Intelligence Platform
// frontend/vite.config.js
// ================================

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },

  server: {
    port: 5173,
    host: true, // Needed for Docker
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://localhost:5000",
        ws: true,
        changeOrigin: true,
      },
      "/ai": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai/, ""),
      },
    },
  },

  preview: {
    port: 5173,
    host: true,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          charts: ["recharts"],
          store: ["zustand"],
        },
      },
    },
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "zustand", "recharts"],
  },
});
