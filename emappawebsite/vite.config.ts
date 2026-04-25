import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        scaffold: fileURLToPath(new URL('./nav-scaffold.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 3010,
    open: true,
  },
})
