import { defineConfig } from 'tsup'

export default defineConfig({
	entry: [
		'src/next-client.tsx',
		'src/config.ts',
		'src/server.edge.ts',
		'src/server.ts',
		'src/ssr.tsx',
	],
	format: ['cjs', 'esm'],
	target: 'es6',
	minify: 'terser',
	dts: true,
	sourcemap: true,
	noExternal: [],
})
