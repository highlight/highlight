import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts', 'src/check.ts'],
	format: ['esm'],
	target: 'esnext',
	dts: false,
	minify: false,
	sourcemap: false,
})
