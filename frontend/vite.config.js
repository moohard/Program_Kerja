import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import laravel from 'laravel-vite-plugin';
import mkcert from 'vite-plugin-mkcert'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    laravel({
      input: ['src/main.jsx'],
      buildDirectory: 'build',
      refresh: true,
    }),
    react(),
    tailwindcss(),
    mkcert(),
  ],
  build: {
    outDir: '../backend/public/build',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    https: true,
    proxy: {
      '/api': {
        target: 'http://api.proker.test:8000',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'http://api.proker.test:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
