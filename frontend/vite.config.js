import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    https: {
      key: './192.168.10.10+2-key.pem',
      cert: './192.168.10.10+2.pem',
    },
    // --- TAMBAHKAN BLOK PROXY DI BAWAH INI ---
    proxy: {
      // String shorthand: `/api` -> `http://127.0.0.1:8000/api`
      '/api': {
        target: 'http://127.0.0.1:8000', // Alamat server backend Laravel Anda
        changeOrigin: true, // Diperlukan untuk virtual hosts
      },
    }
    // --- AKHIR DARI BLOK PROXY ---
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Aplikasi Program Kerja',
        short_name: 'ProKer',
        description: 'Aplikasi untuk memonitor program kerja.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
  ]
})

