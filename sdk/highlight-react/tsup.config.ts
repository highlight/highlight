import CssModulesPlugin from 'esbuild-css-modules-plugin'
import { defineConfig } from 'tsup'

export default defineConfig({
	esbuildPlugins: [CssModulesPlugin()],
})
