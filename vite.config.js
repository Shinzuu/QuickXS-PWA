import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon_io/*.png', 'favicon_io/*.ico', 'widgets/*.html'],
      devOptions: {
        enabled: false
      },
      manifest: {
        name: 'QuickXS - Student Schedule Manager',
        short_name: 'QuickXS',
        description: 'A modern PWA for managing your class schedule with real-time updates',
        theme_color: '#00ADB5',
        background_color: '#222831',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/favicon_io/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/favicon_io/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        // Widget definitions for Android Chrome (experimental)
        widgets: [
          {
            name: 'Current Class',
            short_name: 'Class',
            description: 'Shows your current or next class',
            tag: 'current-class',
            template: 'current-class',
            ms_ac_template: 'widgets/current-class.html',
            data: 'widget-data.json',
            type: 'application/json',
            screenshots: [
              {
                src: '/favicon_io/android-chrome-512x512.png',
                sizes: '512x512',
                label: 'Current Class Widget'
              }
            ],
            update: 60
          },
          {
            name: 'Daily Progress',
            short_name: 'Progress',
            description: 'Shows your daily class completion progress',
            tag: 'daily-progress',
            template: 'daily-progress',
            ms_ac_template: 'widgets/daily-progress.html',
            data: 'widget-data.json',
            type: 'application/json',
            screenshots: [
              {
                src: '/favicon_io/android-chrome-512x512.png',
                sizes: '512x512',
                label: 'Daily Progress Widget'
              }
            ],
            update: 60
          },
          {
            name: 'Next Event',
            short_name: 'Event',
            description: 'Shows your next upcoming event',
            tag: 'next-event',
            template: 'next-event',
            ms_ac_template: 'widgets/next-event.html',
            data: 'widget-data.json',
            type: 'application/json',
            screenshots: [
              {
                src: '/favicon_io/android-chrome-512x512.png',
                sizes: '512x512',
                label: 'Next Event Widget'
              }
            ],
            update: 60
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/gymdfwvseuhsusyfsnpb\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/widget-data\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'widget-data-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 // 1 minute
              }
            }
          }
        ]
      }
    })
  ],
})
