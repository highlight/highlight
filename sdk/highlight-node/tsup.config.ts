import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'],
	splitting: true,
	minify: 'terser',
	dts: true,
	sourcemap: true,
})
