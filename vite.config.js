import { defineConfig } from "vite";

export default defineConfig({
  base: "/", // Should be "/" for GitHub Pages at root level
  build: {
    minify: "terser",
  },
});
