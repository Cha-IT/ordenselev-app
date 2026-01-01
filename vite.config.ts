import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
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
})
