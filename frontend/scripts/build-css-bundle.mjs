import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'
import esbuild from 'esbuild'
import stylePlugin from 'esbuild-style-plugin'
import * as fs from 'node:fs'
import * as path_ from 'node:path'
import tailwindcss from 'tailwindcss'

export const run = async ({ rootDirectory }) => {
	const args = process.argv.slice(2)
	const watch = args.includes('--watch') || args.includes('-w')

	const workingDirectory = path_.join(rootDirectory, './src')
	const outputDirectory = path_.join(workingDirectory, '__generated/')

	const packageJson = JSON.parse(
		fs.readFileSync(path_.join(rootDirectory, 'package.json')),
	)

	const ignorePlugin = {
		name: 'ignore-imports',
		setup(build) {
			build.onLoad({ filter: /\.(svg|png|gif|jpeg)$/ }, () => ({
				contents: '',
			}))
		},
	}

	const resultPlugin = {
		name: 'result-plugin',
		setup(build) {
			build.onStart(() => {
				console.log(new Date(), 'building css bundle')
			})
			build.onEnd(async (result) => {
				const cssOutput = result.outputFiles.find(({ path }) =>
					path.endsWith('index.css'),
				)

				await fs.promises.writeFile(
					path_.join(outputDirectory, 'index.css'),
					cssOutput.contents,
				)
				console.log(new Date(), 'built css bundle', cssOutput.path)
			})
		},
	}

	await fs.promises.mkdir(outputDirectory, { recursive: true })

	const context = await esbuild.context({
		entryPoints: [path_.join(workingDirectory, 'index.tsx')],
		sourcemap: false,
		bundle: true,
		absWorkingDir: rootDirectory,
		format: 'esm',
		allowOverwrite: true,
		platform: 'browser',
		outdir: outputDirectory,
		outbase: workingDirectory,
		minify: false, // Makes diffs smaller and more readable. Reflame will minify server-side.
		splitting: false,
		target: 'esnext',
		plugins: [
			// Style plugin doesn't respect esbuild externals
			// FIXME: follow https://github.com/g45t345rt/esbuild-style-plugin/pull/18
			{
				name: 'styleIgnorePlugin',
				setup: ({ onResolve }) => {
					Object.keys(packageJson.dependencies).forEach((pkg) => {
						onResolve(
							{
								filter: new RegExp(`^${pkg}/.*$`),
								namespace: 'file',
							},
							() => ({
								external: true,
								sideEffects: false,
							}),
						)
					})
				},
			},
			stylePlugin({
				cssModulesOptions: {
					localsConvention: 'camelCaseOnly',
				},
				postcss: {
					plugins: [tailwindcss()],
				},
			}),
			ignorePlugin,
			vanillaExtractPlugin({ identifiers: 'short' }),
			resultPlugin,
		],
		external: [
			'consts:publicGraphURI',
			...Object.keys(packageJson.dependencies).flatMap((pkg) => [
				pkg,
				`${pkg}/*`,
			]),
			...Object.keys(packageJson.devDependencies).flatMap((pkg) => [
				pkg,
				`${pkg}/*`,
			]),
		],
		write: false,
		logLevel: 'error',
	})

	if (watch) {
		// esbuild watch is actually polling based, some latency
		// could be optimized away with a custom watcher
		// https://esbuild.github.io/api/#watch
		await context.watch()
	} else {
		await context.rebuild()
		await context.dispose()
	}
}
