import * as css from './build-css-bundle.mjs'
import * as rrweb from './build-rrweb.mjs'
import * as scss from './build-scss-modules.mjs'
import * as svgr from './build-svgr.mjs'
import * as vanilla from './build-vanilla-extract.mjs'

await Promise.all([
	css.run(),
	vanilla.run(),
	rrweb.run(),
	svgr.run(),
	scss.run(),
])
