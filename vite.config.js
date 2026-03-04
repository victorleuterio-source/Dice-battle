import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true, port: process.env.PORT || 3000 },
  preview: { host: true, port: process.env.PORT || 3000 }
})

Clicar em "Commit changes" → "Commit changes" de novo

O Railway vai fazer o deploy automaticamente! Me avisa quando terminar 🚀 Sonnet 4.6Estendido
