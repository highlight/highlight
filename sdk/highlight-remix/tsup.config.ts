import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts', 'src/highlight-init.tsx'],
	format: ['cjs', 'esm'],
	minify: 'terser',
	dts: true,
	sourcemap: true,
})
