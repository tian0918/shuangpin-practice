import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const poemApiProxy = {
  '/poem-api': {
    target: 'https://billy-unflowery-eliana.ngrok-free.dev',
    changeOrigin: true,
    headers: { 'ngrok-skip-browser-warning': 'true' },
    rewrite: path => path.replace(/^\/poem-api/, '/api/v1'),
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: poemApiProxy },
  preview: { proxy: poemApiProxy },
})
