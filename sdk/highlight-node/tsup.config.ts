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
	// https://github.com/evanw/esbuild/issues/1921
	banner: {
		js: `const require = (await import("node:module")).createRequire(import.meta.url);`,
	},
})
