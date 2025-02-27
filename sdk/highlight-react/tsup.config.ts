import CssModulesPlugin from 'esbuild-css-modules-plugin'
import { defineConfig } from 'tsup'

export default defineConfig({
	clean: false,
	dts: true,
	esbuildPlugins: [CssModulesPlugin()],
	minify: true,
	sourcemap: true,
	splitting: true,
	bundle: true,
	treeshake: 'smallest',
})
