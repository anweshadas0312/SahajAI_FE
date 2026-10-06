import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/backend-api': {
        target: 'http://127.0.0.1:1338',
        changeOrigin: true,
      }
    }
  }
})
