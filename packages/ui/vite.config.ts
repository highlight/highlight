import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

import entryPoints from './entryPoints.mjs'

export default defineConfig({
	build: {
		emptyOutDir: false,
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
		setupFiles: ['./src/setupTests.ts'],
	},
	plugins: [dts(), react(), vanillaExtractPlugin()],
})
