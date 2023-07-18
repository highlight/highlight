import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs'],
	dts: false,
	minify: false,
	sourcemap: false,
})
