import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// Static build: no backend, so no dev proxy is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
