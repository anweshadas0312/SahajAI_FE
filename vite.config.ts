// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     proxy: {
//       '/backend-api': {
//         target: process.env.VITE_BACKEND_URL,
//         changeOrigin: true,
//         secure: false,
//         timeout: 600000,
//       },
//       '/api': {
//         target: process.env.VITE_BACKEND_URL,
//         changeOrigin: true,
//         secure: false,
//         timeout: 600000,
//       }
//     }
//   }
// })


import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://127.0.0.1:1338'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/backend-api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          timeout: 600000,
        },
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          timeout: 600000,
        }
      }
    }
  }
})
