import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.jpg'],
      manifest: {
        name: 'Haarlemmermeer Voor Elkaar',
        short_name: 'HvE',
        description: 'Vrijwilligerswerk in de gemeente Haarlemmermeer',
        theme_color: '#6DC82A',
        background_color: '#F7F7F7',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        lang: 'nl',
        dir: 'ltr',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/listings/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'listings-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@hve/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
