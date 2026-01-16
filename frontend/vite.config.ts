import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
  },
  server: {
    host: true, 
    port: 5173,
    proxy: {
      '/events': {
        target: 'http://backend:8787',
        changeOrigin: true,
        ws: true // SSE / streaming support
      }
    }
  },
})
