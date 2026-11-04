import { defineConfig } from 'vite';
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  server: {
    port: 5173,
    proxy: {
      '/storage': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
});
