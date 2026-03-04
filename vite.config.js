import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true, port: process.env.PORT || 3000 },
  preview: { host: true, port: process.env.PORT || 3000 }
})
