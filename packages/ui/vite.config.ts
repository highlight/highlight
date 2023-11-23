import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: {
				components: path.resolve(__dirname, 'src/components/index.ts'),
				css: path.resolve(__dirname, 'src/css.ts'),
				keyframes: path.resolve(__dirname, 'src/keyframes.ts'),
				sprinkles: path.resolve(__dirname, 'src/sprinkles.ts'),
				vars: path.resolve(__dirname, 'src/vars.ts'),
				theme: path.resolve(__dirname, 'src/theme.ts'),
				colors: path.resolve(__dirname, 'src/colors.ts'),
				borders: path.resolve(__dirname, 'src/borders.ts'),
			},
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
