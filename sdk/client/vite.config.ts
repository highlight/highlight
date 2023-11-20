// vite.config.ts

import { resolve as resolvePath } from 'path'
import { defineConfig } from 'vite'

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
			entry: resolvePath(__dirname, 'src/index.tsx'),
			name: '@highlight-run/client',
			fileName: 'index',
		},
		minify: 'terser',
		emptyOutDir: false,
		sourcemap: false,
		rollupOptions: {
			treeshake: 'smallest',
			output: {
				entryFileNames: `[name].js`,
			},
		},
	},
	define: {
		// used by dependencies of highlight-client-worker
		'process.env.NODE_ENV': '"production"',
	},
})
