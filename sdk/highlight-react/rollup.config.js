// rollup.config.js

import esbuild from 'rollup-plugin-esbuild'
import filesize from 'rollup-plugin-filesize'
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const rollupBuilds = [
	// the first build is just for exporting highlight.css.
	{
		input: './src/index.tsx',
		output: { file: pkg.main },
		external: ['react', 'react/jsx-runtime'], // peer dependencies
		plugins: [
			postcss({
				minimize: true,
				sourceMap: true,
				extract: 'highlight.css',
			}),
			esbuild(),
		],
	},
	// the second build replaces the js file produced by the first build.
	{
		input: './src/index.tsx',
		output: [
			{
				file: pkg.main,
				format: 'umd',
				name: 'highlight-react',
				sourcemap: true,
				globals: {
					react: 'React',
					'react/jsx-runtime': 'jsxRuntime',
				},
			},
			{
				file: pkg.module,
				format: 'es',
				exports: 'named',
				sourcemap: true,
				globals: {
					react: 'React',
					'react/jsx-runtime': 'jsxRuntime',
				},
			},
		],
		treeshake: 'smallest',
		external: ['react', 'react/jsx-runtime'], // peer dependencies
		plugins: [
			postcss({
				minimize: true,
				sourceMap: true,
			}),
			resolve(),
			esbuild(),
			terser({ mangle: true }),
			filesize(),
		],
	},
]

export default rollupBuilds
