import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    server: {
      port: 5173,
      hmr: {
        clientPort: 5173,
      },
    },
    build: {
      minify: 'esbuild',
      cssMinify: 'esbuild',
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },
    plugins: [react(), crx({ manifest })],
  }
})
