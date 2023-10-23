import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'

const config = {
	input: 'src/index.ts',
	plugins: [
		json(),
		commonjs({
			strictRequires: true,
			transformMixedEsModules: true,
			esmExternals: true,
		}),
		resolve({
			browser: false,
			preferBuiltins: true,
		}),
		typescript(),
		terser(),
	],
	output: [
		{
			file: 'dist/index.mjs',
			format: 'es',
			sourcemap: true,
		},
		{
			file: 'dist/index.js',
			format: 'cjs',
			sourcemap: true,
		},
	],
}

export default config
