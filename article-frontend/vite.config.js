import { defineConfig } from 'vite'

// Proxy /articles to Django backend to avoid CORS during development
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/articles': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      // Proxy any other API paths if needed
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
