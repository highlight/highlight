// vite.config.ts
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	envPrefix: ['REACT_APP_'],
	server: {
		host: '0.0.0.0',
		port: 8888,
		strictPort: true,
		hmr: {
			clientPort: 8888,
		},
	},
	build: {
		target: 'es6',
		lib: {
			formats: ['es', 'cjs', 'umd'],
			entry: resolve(__dirname, 'src/index.tsx'),
			name: 'H',
			fileName: 'index',
		},
		minify: 'terser',
		emptyOutDir: false,
		// sourcemaps are not published to reduce package size
		sourcemap: false,
		rollupOptions: {
			output: {
				exports: 'named',
			},
		},
	},
})
