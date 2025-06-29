// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // /api 以下をバックエンド（localhost:4000）にフォワード
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
});