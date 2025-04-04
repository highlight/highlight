import * as path from 'node:path'

import * as firstloadVersion from '../../sdk/highlight-run/scripts/version.mjs'
import * as css from './build-css-bundle.mjs'
import * as rrweb from './build-rrweb.mjs'

const args = process.argv.slice(2)
const excludeRrweb = args.includes('--exclude-rrweb')

const rootDirectoryFrontend = process.cwd()
const rootDirectory = path.join(rootDirectoryFrontend, '../')

await Promise.all([
	css.run({
		rootDirectory,
		rootDirectoryFrontend,
		rootDirectoryUi: path.join(rootDirectory, 'packages/ui'),
	}),
	excludeRrweb
		? Promise.resolve()
		: rrweb.run({ rootDirectory: rootDirectoryFrontend }),
	firstloadVersion.run({
		rootDirectory: path.join(rootDirectory, 'sdk/highlight-run'),
	}),
])
