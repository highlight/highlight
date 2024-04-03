import check from 'check-dependencies'

const IGNORED_DEPENDENCIES = new Set(['highlight.run', 'typescript'])

const output = await check()

const badDependencies = output.error.slice(0, -1).filter((err) => {
	const [dep, rest] = err.split(':', 1)
	return !IGNORED_DEPENDENCIES.has(dep)
})

if (badDependencies.length > 0) {
	console.error('Some dependencies are not installed correctly.')
	for (const err of badDependencies) {
		console.error(err)
	}
	process.exit(1)
} else {
	console.log('All dependencies are installed correctly.')
}
