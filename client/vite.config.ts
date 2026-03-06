import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext", // <= enables TLA output
    modulePreload: { polyfill: false },
  },
  esbuild: {
    supported: { "top-level-await": true }, // hint to esbuild
  },
});
