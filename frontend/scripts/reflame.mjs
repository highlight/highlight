import * as css from './build-css-bundle.mjs'
import * as rrweb from './build-rrweb.mjs'
import * as scss from './build-scss-modules.mjs'
import * as svgr from './build-svgr.mjs'
import * as vanilla from './build-vanilla-extract.mjs'
import * as vanillaUi from '../../packages/ui/scripts/build-vanilla-extract.mjs'

import * as path from 'node:path'

const rootDirectoryFrontend = process.cwd()

await Promise.all([
	css.run({ rootDirectory: rootDirectoryFrontend }),
	vanilla.run({ rootDirectory: rootDirectoryFrontend }),
	rrweb.run({ rootDirectory: rootDirectoryFrontend }),
	svgr.run({ rootDirectory: rootDirectoryFrontend }),
	scss.run({ rootDirectory: rootDirectoryFrontend }),
	vanillaUi.run({ rootDirectory: path.join(rootDirectoryFrontend, '../packages/ui'), rootDirectoryFrontend})
])
