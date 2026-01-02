import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Use '|| ""' to ensure it's replaced with a string even if the env var is missing.
      // This prevents "Uncaught ReferenceError: process is not defined" in the browser.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "")
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            genai: ['@google/genai'],
            d3: ['d3-array', 'd3-scale', 'd3-shape']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  }
})