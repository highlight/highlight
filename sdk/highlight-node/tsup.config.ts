import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['cjs', 'esm'],
	target: 'esnext',
	platform: 'node',
	minify: true,
	dts: true,
	sourcemap: true,
	noExternal: [new RegExp('@opentelemetry/.*')],
})
