// vite.config.ts

import { resolve as resolvePath } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	envPrefix: ['REACT_APP_'],
	build: {
		target: 'es6',
		lib: {
			formats: ['umd'],
			entry: resolvePath(__dirname, 'src/index.tsx'),
			name: '@highlight-run/client',
			fileName: 'index',
		},
		minify: true,
		emptyOutDir: false,
		sourcemap: true,
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
