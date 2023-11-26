import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import dts from 'vite-plugin-dts'
import entryPoints from './entryPoints.mjs'

export default defineConfig({
	build: {
		lib: {
			entry: entryPoints,
			name: '@highlight-run/ui',
		},
		minify: 'esbuild',
		sourcemap: true,
		rollupOptions: {
			treeshake: 'smallest',
			external: ['react'],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		environment: 'happy-dom',
		globals: true,
	},
	plugins: [dts(), react(), vanillaExtractPlugin()],
})
