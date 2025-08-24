import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseFromEnv = env.VITE_BASE || (env.GITHUB_REPOSITORY ? `/${env.GITHUB_REPOSITORY.split('/').pop()}/` : '/')
  return {
    base: baseFromEnv,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*', 'robots.txt'],
        manifest: {
          name: 'Weather+ Pro',
          short_name: 'Weather+',
          description: 'Advanced PWA Weather app',
          theme_color: '#0ea5e9',
          background_color: '#0b1220',
          display: 'standalone',
          start_url: '.',
          icons: [
            { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
            { src: 'icons/maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webp}'],
          runtimeCaching: [
            {
              urlPattern: /https:\/\/(api|geocoding)\.open-meteo\.com\/.*|https:\/\/air-quality-api\.open-meteo\.com\/.*|https:\/\/api\.openweathermap\.org\/.*|https:\/\/tile\.openstreetmap\.org\/.*|https:\/\/\{s\}\.tile\.openstreetmap\.org\/.*|https:\/\/c\.tile\.openstreetmap\.org\/.*|https:\/\/a\.tile\.openstreetmap\.org\/.*|https:\/\/b\.tile\.openstreetmap\.org\/.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
                networkTimeoutSeconds: 6
              }
            }
          ]
        }
      })
    ],
    server: {
      proxy: {
        '/om-geo': {
          target: 'https://geocoding-api.open-meteo.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/om-geo\//, '/')
        }
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts']
    }
  }
})
