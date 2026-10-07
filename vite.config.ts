import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/backend-api': {
        target: process.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
        timeout: 600000,
      },
      '/api': {
        target: process.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
        timeout: 600000,
      }
    }
  }
})
