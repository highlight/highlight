// vite.config.ts

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
	envPrefix: ['REACT_APP_'],
	server: {
		host: '0.0.0.0',
		port: 8080,
		strictPort: true,
		hmr: {
			clientPort: 8080,
		},
	},
	build: {
		target: 'es6',
		lib: {
			formats: ['umd'],
			entry: resolve(__dirname, 'src/index.tsx'),
			name: '@highlight-run/client',
			fileName: 'index',
		},
		rollupOptions: {
			treeshake: 'smallest',
			output: {
				entryFileNames: `[name].js`,
			},
		},
		minify: 'terser',
		emptyOutDir: false,
		sourcemap: false,
	},
	define: {
		// used by dependencies of highlight-client-worker
		'process.env.NODE_ENV': '"production"',
	},
})
