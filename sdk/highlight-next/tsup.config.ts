import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/server.edge.ts', 'src/server.ts', 'src/next-client.tsx'],
	format: ['cjs', 'esm'],
	minify: 'terser',
	dts: true,
	sourcemap: true,
})
