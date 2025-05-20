import { defineConfig, Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { IncomingMessage, ServerResponse } from 'http';

const spaFallbackPlugin: Plugin = {
  name: 'spa-fallback',
  configurePreviewServer(server) {
    return () => {
      server.middlewares.use(
        (req: IncomingMessage, _res: ServerResponse, next) => {
          if (
            req.url === '/manifest.json' ||
            req.url === '/sw.js' ||
            req.url?.match(/\.(ico|png|jpg|svg|json|webp)$/)
          ) {
            return next();
          }
          req.url = '/index.html';
          next();
        }
      );
    };
  }

};

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png',
        'images/car-icon.png',
      ],
      manifest: {
        name: 'OwnCars',
        short_name: 'OwnCars',
        description: 'Rent cars easily with the OwnCars Progressive Web App',
        theme_color: '#1e3a8a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      manifestFilename: 'manifest.json',
      devOptions: {
        enabled: true,
      },
      strategies: 'generateSW', // ✅ use this instead of injectManifest
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico,webp}'],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }: { request: Request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60,
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: ({ url }: { url: URL }) => url.pathname === '/manifest.json',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'manifest-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60,
              },
            },
          },
        ],
      },
    }),
    spaFallbackPlugin,
  ],
  base: '/',
  server: {
    fs: {
      allow: ['.'],
    },
  },
});