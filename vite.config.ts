import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, '/v1/messages'),
        headers: {
          'anthropic-version': '2023-06-01'
        }
      },
      '/api/llm': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  },
  base: '/react-multi-agent-demo/',
});
