// vite.config.js
import { resolve } from 'path'
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
		lib: {
			formats: ['umd'],
			entry: resolve(__dirname, 'src/index.tsx'),
			name: '@highlight-run/client',
			fileName: 'index',
		},
		rollupOptions: {
			output: {
				entryFileNames: `[name].js`,
			},
		},
		minify: 'terser',
		emptyOutDir: false,
		sourcemap: true,
	},
	define: {
		// used by dependencies of highlight-client-worker
		'process.env.NODE_ENV': '"production"',
	},
})
