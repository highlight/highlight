import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.edge.ts', 'src/index.ts', 'src/HighlightInit.tsx'],
	format: ['cjs', 'esm'],
	minify: 'terser',
	dts: true,
	sourcemap: true,
})
