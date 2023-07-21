import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.tsx', 'src/handle-error.ts', 'src/highlight-init.tsx'],
	format: ['cjs', 'esm'],
	minify: 'terser',
	dts: true,
	sourcemap: true,
})
