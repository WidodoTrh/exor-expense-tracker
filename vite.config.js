import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: '/app/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    server: command === 'serve' ? {
        middlewareMode: false,
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                res.setHeader('Access-Control-Allow-Origin', '*')
                next()
            })
        },
        proxy: {
            '/getmaster-v2': {
                target: 'https://api.jalaera.com',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/getmaster-v2/, '/elibrary/master'),
            },
            '/getarticles-v2': {
                target: 'https://api.jalaera.com',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/getarticles-v2/, '/elibrary/articles'),
            },
        },
        host: env.VITE_APP_ALLOWED_HOSTS,
        port: 443,
        https: {
            key: fs.readFileSync('./cert/elibrary-dev.id-key.pem'),
            cert: fs.readFileSync('./cert/elibrary-dev.id.pem'),
        },
        hmr: {
            protocol: 'wss',
            host: env.VITE_APP_ALLOWED_HOSTS,
            clientPort: 443,
        },
        cors: { origin: '*' },
            strictPort: true,
        } : undefined,
    }
})