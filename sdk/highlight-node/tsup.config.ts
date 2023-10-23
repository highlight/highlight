import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'],
	target: 'esnext',
	minify: false,
	dts: true,
	sourcemap: true,
	noExternal: [new RegExp('@opentelemetry/.*')],
})
