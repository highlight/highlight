// vite.config.ts
import { resolve as resolvePath } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	envPrefix: ['REACT_APP_'],
	server: {
		host: '0.0.0.0',
		port: 8877,
		strictPort: true,
		hmr: {
			clientPort: 8877,
		},
	},
	build: {
		target: 'es6',
		lib: {
			formats: ['es', 'umd'],
			entry: resolvePath(__dirname, 'src/index.tsx'),
			name: 'H',
			fileName: 'index',
		},
		minify: true,
		sourcemap: true,
		emptyOutDir: false,
		rollupOptions: {
			treeshake: 'smallest',
			output: {
				exports: 'named',
			},
		},
	},
	define: {
		// used by dependencies of highlight-client-worker
		'process.env.NODE_ENV': '"production"',
	},
	test: {
		environment: 'jsdom',
	},
})
