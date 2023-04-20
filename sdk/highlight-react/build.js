const esbuild = require('esbuild')
const cssModulesPlugin = require('esbuild-css-modules-plugin')
const isWatch = process.argv.includes('--watch')
const pkg = require('./package.json')
const config = {
	logLevel: 'info',
	entryPoints: ['src/index.tsx'],
	bundle: true,
	plugins: [cssModulesPlugin()],
	external: Object.keys(pkg.peerDependencies),
}

build({ ...config, outfile: 'dist/index.js', format: 'cjs' })
build({ ...config, outfile: 'dist/index.mjs', format: 'esm' })

async function build(config) {
	if (isWatch) {
		const context = await esbuild.context(config)

		await context.watch()
	} else {
		await esbuild.build(config)
	}
}
