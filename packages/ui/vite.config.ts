import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

export default defineConfig({
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, './src/components'),
		},
	},
	test: {
		environment: 'happy-dom',
		globals: true,
	},
	plugins: [react(), vanillaExtractPlugin()],
})
