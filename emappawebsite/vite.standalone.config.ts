import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

/** One self-contained HTML file (file:// friendly) for sharing the main landing page. */
export default defineConfig({
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    outDir: 'standalone-dist',
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: {
      input: fileURLToPath(new URL('./index.html', import.meta.url)),
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
})
