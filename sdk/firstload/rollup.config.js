// rollup.config.js

import commonjs from '@rollup/plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import webWorkerLoader from 'rollup-plugin-web-worker-loader'
import pkg from './package.json'
import consts from 'rollup-plugin-consts'
import replace from '@rollup/plugin-replace'

const development = process.env.ENVIRONMENT === 'dev'
const sourceMap = true
const minify = !development

const input = {
	index: './src/index.tsx',
	electron: './src/environments/electron.ts',
}
const basePlugins = [
	consts({
		publicGraphURI: process.env.PUBLIC_GRAPH_URI,
	}),
	resolve({ browser: true }),
	webWorkerLoader({
		targetPlatform: 'browser',
		inline: true,
	}),
	json(),
	replace({
		preventAssignment: true,
		'process.env.NODE_ENV': JSON.stringify(
			development ? 'development' : 'production',
		),
	}),
	commonjs({}),
	esbuild({
		minify,
		target: 'es6',
	}),
]
const rollupBuilds = []

for (const x of [
	{
		input: input.index,
		output: {
			file: pkg.main,
			format: 'umd',
			name: 'highlightLib',
		},
	},
	{
		input: {
			indexESM: input.index,
			electronESM: input.electron,
		},
		output: {
			dir: './dist',
			format: 'esm',
		},
	},
]) {
	rollupBuilds.push({
		input: x.input,
		output: {
			...x.output,
			sourcemap: sourceMap,
		},
		treeshake: development ? undefined : 'smallest',
		plugins: [...basePlugins, filesize()],
	})
}

export default rollupBuilds
