import * as path from 'node:path'

import * as vanillaUi from '../../packages/ui/scripts/build-vanilla-extract.mjs'
import * as firstloadVersion from '../../sdk/firstload/scripts/version.mjs'
import * as css from './build-css-bundle.mjs'
import * as rrweb from './build-rrweb.mjs'
import * as scss from './build-scss-modules.mjs'
import * as svgr from './build-svgr.mjs'
import * as vanilla from './build-vanilla-extract.mjs'

const rootDirectoryFrontend = process.cwd()

const args = process.argv.slice(2)
const excludeRrweb = args.includes('--exclude-rrweb')

await Promise.all([
	css.run({ rootDirectory: rootDirectoryFrontend }),
	vanilla.run({ rootDirectory: rootDirectoryFrontend }),
	excludeRrweb
		? Promise.resolve()
		: rrweb.run({ rootDirectory: rootDirectoryFrontend }),
	svgr.run({ rootDirectory: rootDirectoryFrontend }),
	scss.run({ rootDirectory: rootDirectoryFrontend }),
	vanillaUi.run({
		rootDirectory: path.join(rootDirectoryFrontend, '../packages/ui'),
		rootDirectoryFrontend,
	}),
	firstloadVersion.run({
		rootDirectory: path.join(rootDirectoryFrontend, '../sdk/firstload'),
	}),
])
