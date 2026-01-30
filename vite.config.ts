import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vercel from 'vite-plugin-vercel/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), vercel()],
  resolve: {
    alias: {
      '@components': resolve(__dirname, 'src/components'),
      '@features': resolve(__dirname, 'src/features'),
      '@store': resolve(__dirname, 'src/store'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },
})
