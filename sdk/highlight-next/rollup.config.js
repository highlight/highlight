import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'

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
	plugins: [json(), commonjs(), resolve(), typescript(), terser()],
	output: [
		{
			dir: 'dist',
			format: 'cjs',
			sourcemap: true,
			entryFileNames: '[name].cjs',
			exports: 'named',
		},
		{
			dir: 'dist',
			format: 'es',
			sourcemap: true,
			entryFileNames: '[name].js',
			exports: 'named',
		},
	],
	treeshake: 'smallest',
}

export default config
