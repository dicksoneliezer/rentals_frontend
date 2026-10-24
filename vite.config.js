import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_TARGET = env.VITE_API_TARGET || 'http://127.0.0.1:8000'
  const DEV_PORT = Number(env.VITE_DEV_PORT) || 5173

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: [
          'favicon.svg',
          'icons/pwa-192x192.png',
          'icons/pwa-512x512.png',
          'icons/pwa-maskable-512x512.png',
        ],
        manifest: {
          name: 'Nipangishe — Makazi yako, hatua moja karibu',
          short_name: 'Nipangishe',
          description:
            'Jukwaa la kusimamia nyumba na vyumba vya kupangisha: wamiliki husimamia mali zao, wapangaji hupata nyumba, mikataba, malipo na risiti.',
          theme_color: '#0a2a4d',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          lang: 'sw',
          categories: ['business', 'productivity'],
          icons: [
            { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          navigateFallback: '/index.html',
          // Don't serve the SPA shell for API / branding / storage routes
          navigateFallbackDenylist: [/^\/api\//, /^\/branding\//, /^\/storage\//],
          // Anything under /api is network-only — no cache, no fallback
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
              handler: 'NetworkOnly',
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/branding/'),
              handler: 'NetworkOnly',
            },
          ],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
        },
        devOptions: {
          enabled: false, // keep SW out of dev unless you're testing PWA behavior
        },
      }),
    ],
    server: {
      port: DEV_PORT,
      strictPort: false,
      host: true, // lets you test from your phone on the LAN
      proxy: {
        '/api': {
          target: API_TARGET,
          changeOrigin: true,
        },
        '/branding': {
          target: API_TARGET,
          changeOrigin: true,
        },
        // Laravel's storage symlink (receipts, uploads) — add if you serve from there
        '/storage': {
          target: API_TARGET,
          changeOrigin: true,
        },
      },
    },
    build: {
      sourcemap: mode !== 'production',
      target: 'es2020',
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react'
              }
              if (id.includes('antd') || id.includes('@ant-design')) {
                return 'antd'
              }
            }
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  }
})