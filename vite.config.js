import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the production build works from any folder or static host.
  base: './',
  server: { port: 5173 },
  test: { environment: 'node' },
})
