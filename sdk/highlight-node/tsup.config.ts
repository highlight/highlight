import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs'],
	target: 'esnext',
	minify: true,
	dts: true,
	sourcemap: true,
	noExternal: [new RegExp('@opentelemetry/.*')],
})
