import * as esbuild from 'esbuild'
import * as fs from 'node:fs'
import * as path from 'node:path'

export const run = async ({ rootDirectory }) => {
	const args = process.argv.slice(2)
	const watch = args.includes('--watch') || args.includes('-w')

	const packageDirectory = path.join(rootDirectory, '../node_modules/rrweb')
	const packageDirectoryTypes = path.join(
		rootDirectory,
		'../node_modules/@rrweb/types',
	)
	const packageJson = JSON.parse(
		fs.readFileSync(path.join(packageDirectory, 'package.json')),
	)
	const packageJsonTypes = JSON.parse(
		fs.readFileSync(path.join(packageDirectoryTypes, 'package.json')),
	)

	const context = await esbuild.context({
		entryPoints: [
			{
				in: path.join(packageDirectory, packageJson.module),
				out: 'rrweb/rr',
			},
			{
				in: path.join(packageDirectoryTypes, packageJsonTypes.module),
				out: 'rrweb-types/rrTypes',
			},
			{
				in: path.join(packageDirectory, 'dist/style.min.css'),
				out: 'rrweb/rr.min',
			},
		],
		bundle: true,
		sourcemap: false,
		format: 'esm',
		platform: 'browser',
		outdir: path.join(rootDirectory, '../__generated/rr'),
		minify: false,
		target: 'esnext',
		// external: Object.keys(packageJson.dependencies).concat(
		//   Object.keys(packageJson.peerDependencies),
		// ),
		logLevel: 'info',
	})

	if (watch) {
		console.log('watching')
		await context.watch()
		console.log('watched')
	} else {
		await context.rebuild()
		await context.dispose()
	}
}
