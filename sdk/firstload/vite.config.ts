// vite.config.ts
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
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
			plugins: [
				json(),
				commonjs({
					transformMixedEsModules: true,
				}),
				resolve({
					browser: true,
				}),
				typescript({
					outputToFilesystem: true,
				}),
			],
			output: {
				exports: 'named',
			},
			cache: false,
		},
	},
})
