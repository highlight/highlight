import * as svgr from '@svgr/core'
import chokidar from 'chokidar'
import * as fs from 'node:fs'
import * as path_ from 'node:path'
import readdirp from 'readdirp'

export const run = async ({ rootDirectory }) => {
	const args = process.argv.slice(2)
	const watch = args.includes('--watch') || args.includes('-w')

	const watchedFiles = ['**/**.svg']

	const workingDirectory = path_.join(rootDirectory, './src')
	const outputDirectory = path_.join(workingDirectory, '__generated/svgr')

	// uncomment for cleanup
	// await fs.promises.rm(outputDirectory, { recursive: true, force: true })

	const build = async (path) => {
		console.log(new Date(), 'building svgr module', path)
		const code = await fs.promises.readFile(
			path_.join(workingDirectory, path),
			'utf-8',
		)
		const output = await svgr.transform(
			code,
			{
				plugins: ['@svgr/plugin-jsx'],
				jsxRuntime: 'automatic',
				exportType: 'named',
			},
			{ componentName: 'ReactComponent' },
		)
		const pathOutput = path_.join(outputDirectory, path + '.js')
		await fs.promises.mkdir(path_.dirname(pathOutput), { recursive: true })
		await fs.promises.writeFile(pathOutput, output)
		console.log(new Date(), 'built svgr module', path)
		return
	}

	const removeBuildOutput = async (path) => {
		console.log(new Date(), 'removing svgr module', path)
		await fs.promises.rm(path_.join(outputDirectory, path + '.js'), {
			force: true,
		})
	}

	if (watch) {
		chokidar
			.watch(watchedFiles, {
				cwd: workingDirectory,
				ignored: ['**/__generated/**'],
			})
			.on('add', build)
			.on('change', build)
			.on('unlink', removeBuildOutput)
			.on('ready', () => console.log(new Date(), 'svgr ready'))
	} else {
		await Promise.all(
			(
				await readdirp.promise(workingDirectory, {
					fileFilter: watchedFiles,
					directoryFilter: ['!__generated'],
				})
			).map(({ path }) => build(path)),
		)
	}
}
