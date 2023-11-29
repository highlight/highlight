import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin'
import esbuild from 'esbuild'
import * as fs from 'node:fs'
import * as path_ from 'node:path'

import entryPointsUi from '../../packages/ui/entryPoints.mjs'

export const run = async ({
	rootDirectory,
	rootDirectoryFrontend,
	rootDirectoryUi,
}) => {
	const args = process.argv.slice(2)
	const watch = args.includes('--watch') || args.includes('-w')

	const workingDirectory = path_.join(rootDirectoryFrontend, './src')
	const workingDirectoryUi = path_.join(rootDirectoryUi, './src')
	const outputDirectory = path_.join(workingDirectory, '__generated/')
	const outputDirectoryUi = path_.join(workingDirectoryUi, '__generated/')

	const packageJson = JSON.parse(
		fs.readFileSync(path_.join(rootDirectoryFrontend, 'package.json')),
	)

	const packageJsonUi = JSON.parse(
		fs.readFileSync(path_.join(rootDirectoryUi, 'package.json')),
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
				const cssOutput = result.outputFiles.find(
					({ path }) =>
						path === path_.join(workingDirectory, 'index.css'),
				)

				await Promise.all([
					fs.promises.writeFile(
						path_.join(outputDirectory, 'index.css'),
						// vanilla extract outputs comments that seem to depend on absolute path
						// need to strip them for consistent output between local and ci
						cssOutput.text
							.replaceAll(
								/\n\/\* vanilla-extract-css-ns\:.*\n/g,
								'',
							)
							// also remove comment in first line without leading line break
							.replace(/\/\* vanilla-extract-css-ns\:.*\n/g, ''),
					),
					...result.outputFiles
						.filter(
							({ path }) =>
								path.startsWith(workingDirectory) &&
								path.endsWith('.css.js'),
						)
						.map(async ({ path, contents }) => {
							const outputPath = path_.join(
								outputDirectory,
								've',
								path_.relative(workingDirectory, path),
							)
							await fs.promises.mkdir(path_.dirname(outputPath), {
								recursive: true,
							})
							return fs.promises.writeFile(outputPath, contents)
						}),
					...result.outputFiles
						.filter(
							({ path }) =>
								path.startsWith(workingDirectoryUi) &&
								path.endsWith('.css.js'),
						)
						.map(async ({ path, contents }) => {
							const outputPath = path_.join(
								outputDirectoryUi,
								've',
								path_.relative(workingDirectoryUi, path),
							)
							await fs.promises.mkdir(path_.dirname(outputPath), {
								recursive: true,
							})
							return fs.promises.writeFile(outputPath, contents)
						}),
				])
				console.log(new Date(), 'built css bundle', cssOutput.path)
			})
		},
	}

	const uiResolvePlugin = {
		// resolve to TS source for UI entry points
		// to make sure all styles are included
		name: 'uiResolvePlugin',
		setup: ({ onResolve }) => {
			onResolve(
				{
					filter: new RegExp(`^@highlight-run/ui/.*$`),
					namespace: 'file',
				},
				({ path }) => {
					const entryPoint = path.slice('@highlight-run/ui/'.length)

					if (entryPoint === 'styles.css') {
						return {
							external: true,
							sideEffects: false,
						}
					}
					const resolved = entryPointsUi[entryPoint]

					return {
						path: resolved,
					}
				},
			)
		},
	}

	await fs.promises.mkdir(outputDirectory, { recursive: true })

	const context = await esbuild.context({
		entryPoints: [
			path_.join(workingDirectory, 'index.tsx'),
			path_.join(workingDirectory, './**/**.css.ts'),
			path_.join(workingDirectoryUi, './**/**.css.ts'),
		],
		sourcemap: false,
		bundle: true,
		// Seems like vanilla extract outputs depends on working directory
		// Keeping it at frontend root for compatibility with Vite output
		absWorkingDir: rootDirectoryFrontend,
		format: 'esm',
		allowOverwrite: true,
		platform: 'browser',
		outdir: rootDirectory,
		outbase: rootDirectory,
		minify: false,
		splitting: false,
		target: 'esnext',
		plugins: [
			ignorePlugin,
			uiResolvePlugin,
			{
				name: 'styleIgnorePlugin',
				setup: ({ onResolve, onLoad }) => {
					// We don't need css handled by esbuild now that
					// Reflame has native css modules and tailwind support
					onLoad({ filter: /\.(css)$/ }, () => ({
						contents: '',
					}))
				},
			},
			vanillaExtractPlugin({
				identifiers: 'short',
				esbuildOptions: {
					plugins: [uiResolvePlugin],
				},
			}),
			resultPlugin,
		],
		external: [
			'consts:publicGraphURI',
			...Object.keys({
				...packageJson.dependencies,
				...packageJson.devDependencies,
				...packageJsonUi.dependencies,
				...packageJsonUi.devDependencies,
			})
				// Need to keep resolving ui package to process vanilla extract styles
				.filter((pkg) => pkg !== '@highlight-run/ui')
				.flatMap((pkg) => [pkg, `${pkg}/*`]),
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
