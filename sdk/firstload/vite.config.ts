// vite.config.ts
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	envPrefix: ['REACT_APP_'],
	build: {
		lib: {
			formats: ['es', 'umd'],
			entry: resolve(__dirname, 'src/index.tsx'),
			name: 'highlight.run',
			fileName: 'index',
		},
		minify: 'terser',
		emptyOutDir: false,
		sourcemap: true,
	},
})
