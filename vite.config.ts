import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/backend-api': {
        target: 'https://aivista.co.in/sahajai',
        changeOrigin: true,
        secure: false,
        timeout: 600000,
      },
      '/api': {
        target: 'https://aivista.co.in/sahajai',
        changeOrigin: true,
        secure: false,
        timeout: 600000,
      }
    }
  }
})
