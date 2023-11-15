import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'

/** @type {import('rollup').RollupOptions} */
const config = {
	input: 'src/index.tsx',
	context: 'global',
	plugins: [
		json(),
		commonjs(),
		resolve({
			browser: true,
		}),
		typescript(),
		terser(),
	],
	output: [
		{
			file: 'dist/index.js',
			format: 'es',
			sourcemap: true,
			exports: 'named',
		},
		{
			file: 'dist/index.cjs',
			format: 'cjs',
			sourcemap: true,
			exports: 'named',
		},
		{
			file: 'dist/index.umd.js',
			format: 'umd',
			sourcemap: true,
			exports: 'named',
			name: 'H',
		},
	],
	treeshake: 'smallest',
}

export default config
