// This is in a separate file to ensure we have a single source of truth
// between vite and reflame build scripts (which can't import TS yet)
import * as path from 'node:path'
import * as url from 'node:url'

const directory = url.fileURLToPath(new URL('.', import.meta.url))

export default {
	components: path.resolve(directory, 'src/components/index.ts'),
	css: path.resolve(directory, 'src/css.ts'),
	keyframes: path.resolve(directory, 'src/keyframes.ts'),
	sprinkles: path.resolve(directory, 'src/sprinkles.ts'),
	vars: path.resolve(directory, 'src/vars.ts'),
	theme: path.resolve(directory, 'src/theme.ts'),
	colors: path.resolve(directory, 'src/colors.ts'),
	borders: path.resolve(directory, 'src/borders.ts'),
}
