// vite.config.ts
import { resolve as resolvePath } from 'path'
import { defineConfig } from 'vite'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'

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
			formats: ['es', 'cjs', 'umd'],
			entry: resolvePath(__dirname, 'src/index.tsx'),
			name: 'H',
			fileName: 'index',
		},
		minify: 'terser',
		emptyOutDir: false,
		// sourcemaps are not published to reduce package size
		sourcemap: false,
		rollupOptions: {
			treeshake: 'smallest',
			plugins: [
				json(),
				commonjs(),
				resolve({
					browser: true,
				}),
				typescript({
					outputToFilesystem: true,
				}),
				terser(),
			],
			output: {
				exports: 'named',
			},
		},
	},
})
