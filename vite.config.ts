/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      // a new version waits until the person taps Reload (see src/lib/pwa.ts), so an open tab never mixes old and new code
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,woff}', 'icon-*.png', 'apple-touch-icon.png'],
        clientsClaim: true,
        // card art and foil maps are big: cache each on first use instead of up front
        runtimeCaching: [
          {
            // the card list changes with a release: always look for the fresh one first
            urlPattern: ({ url }) => url.pathname.endsWith('/foil/manifest.json'),
            handler: 'NetworkFirst',
            options: { cacheName: 'card-manifest', networkTimeoutSeconds: 4 },
          },
          {
            urlPattern: ({ url }) => /\/(foil|cards)\//.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'card-art', expiration: { maxEntries: 600 }, cacheableResponse: { statuses: [200] } },
          },
        ],
      },
      manifest: {
        name: 'Tarot Twin',
        short_name: 'Tarot Twin',
        description: 'A daily card, and a twin reading for two.',
        theme_color: '#170a24',
        background_color: '#170a24',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] },
})
