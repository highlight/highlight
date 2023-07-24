import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/client.tsx', 'src/report-dialog.tsx', 'src/server.ts'],
	format: ['cjs', 'esm'],
	minify: 'terser',
	dts: true,
	sourcemap: true,
})
