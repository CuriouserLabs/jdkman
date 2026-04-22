import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Tauri dev server runs on 5173
  server: {
    port: 5173,
    strictPort: true,
  },
  // Prevent vite from obscuring rust errors
  clearScreen: false,
  // Tauri requires a relative base
  base: "./",
  build: {
    // Tauri uses Chromium on Windows; don't need to target older browsers
    target: "chrome105",
    minify: "esbuild",
    sourcemap: false,
  },
});
