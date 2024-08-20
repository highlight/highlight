import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

/** @type {import('rollup').RollupOptions} */
const config = {
	input: [
		'src/next-client.tsx',
		'src/config.ts',
		'src/server.edge.ts',
		'src/server.ts',
		'src/ssr.tsx',
	],
	external: ['next', 'react'],
	plugins: [typescript(), terser()],
	output: [
		{
			dir: 'dist',
			format: 'cjs',
			sourcemap: true,
			entryFileNames: '[name].cjs',
			exports: 'auto',
		},
		{
			dir: 'dist',
			format: 'es',
			sourcemap: true,
			entryFileNames: '[name].js',
			exports: 'auto',
		},
	],
	treeshake: 'smallest',
}

export default config
