import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/svg_ascii_generator/',
  worker: {
    format: 'es'
  }
})
