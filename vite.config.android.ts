// Build statis untuk aplikasi Android (Capacitor). Tanpa SSR, tanpa server.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  base: "./",
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true, generatedRouteTree: "src/routeTree.gen.ts" }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  build: {
    outDir: "dist-android",
    emptyOutDir: true,
    target: "es2020",
    sourcemap: false,
  },
});
