import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
  plugins: [
    react(),
    tailwindcss(),
    mkcert(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['/icons/icon-192x192.png', '/icons/icon-512x512.png'],
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        importScripts: ['/firebase-messaging-sw-in-sw.js'],
        // Ensure the service worker is generated in the root.
        swDest: 'dist/sw.js'
      },
      manifest: {
        name: 'Program Kerja PA Penajam',
        short_name: 'Proker PA',
        description: 'Aplikasi untuk memonitor program kerja Pengadilan Agama Penajam.',
        theme_color: '#0275d8',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
  ]
})