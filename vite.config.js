import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import viteBasicSslPlugin from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

  ],
  server: {
    // host: '192.168.200.23',
    host: 'localhost', // Use this if you want to access the app on localhost
    // host: 'localhost', // Use this if you want to access the app on localhost
    // If you want to access the app from other devices on the same network, use your local IP address
    // For example, if your local IP is 192.168.200.23
    port: 5173,

    proxy: {
      '/api': 'http://localhost:4000',
      '/slides': 'http://localhost:4000'
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
