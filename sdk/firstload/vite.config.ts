// vite.config.ts
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	envPrefix: ['REACT_APP_'],
	build: {
		lib: {
			formats: ['es', 'cjs', 'umd'],
			entry: resolve(__dirname, 'src/index.tsx'),
			name: 'H',
			fileName: 'index',
		},
		minify: 'terser',
		emptyOutDir: false,
		// sourcemaps are not published to reduce package size
		sourcemap: false,
		rollupOptions: {
			output: {
				exports: 'named',
				entryFileNames: '[name].[format].js',
			},
		},
	},
})
