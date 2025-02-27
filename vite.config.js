import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',  // Change this if needed based on your deployment URL
  build: {
    minify: 'terser',
  },
});
