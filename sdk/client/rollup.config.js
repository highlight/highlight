// rollup.config.js

import dev from 'rollup-plugin-dev'
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

const output = {
	file: pkg.main,
	format: 'umd',
	name: 'highlightLib',
	sourcemap: sourceMap,
	chunkFileNames: '[name].js',
	globals: {
		['web-worker:./workers/highlight-client-worker']: 'highlightWebWorker',
	},
}
const basePlugins = [
	consts({
		publicGraphURI: process.env.PUBLIC_GRAPH_URI,
	}),
	resolve({ browser: true }),
	json(),
	replace({
		preventAssignment: true,
		'process.env.NODE_ENV': JSON.stringify(
			development ? 'development' : 'production',
		),
	}),
	webWorkerLoader({
		targetPlatform: 'browser',
		inline: true,
		sourceMap,
	}),
	commonjs({}),
	esbuild({
		minify,
		target: 'es6',
	}),
]
const rollupBuilds = []

if (development) {
	rollupBuilds.push({
		input: './src/index.tsx',
		output,
		external: ['web-worker:./workers/highlight-client-worker'],
		plugins: [
			...basePlugins,
			filesize(),
			dev({
				host: '0.0.0.0',
				port: 8080,
			}),
		],
	})
} else {
	const buildSettings = {
		input: './src/index.tsx',
		external: ['web-worker:./workers/highlight-client-worker'],
		treeshake: 'smallest',
		plugins: [...basePlugins, filesize()],
	}
	for (const x of [
		{
			output: {
				file: pkg.main,
				format: 'umd',
				name: 'highlightLib',
				sourcemap: sourceMap,
			},
		},
		{
			output: {
				file: pkg.module,
				format: 'esm',
				sourcemap: sourceMap,
			},
		},
	]) {
		rollupBuilds.push({
			...buildSettings,
			...x,
		})
	}
}

export default rollupBuilds
