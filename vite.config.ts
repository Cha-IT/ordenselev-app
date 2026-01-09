import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      host: true,
      allowedHosts: ['domain.com', 'localhost', '127.0.0.1', '0.0.0.0'],
      proxy: {
        '/api': {
          target: 'http://api:3000',
          changeOrigin: true,
        }
      },
      fs: {
        strict: true,
        allow: [
          resolve(__dirname, 'src/client'),
          resolve(__dirname, 'node_modules'),
          resolve(__dirname, 'public'),
          resolve(__dirname, 'index.html'),
          resolve(__dirname, 'history.html'),
        ],
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          history: resolve(__dirname, 'history.html'),
        },
      },
    },
  }
})
