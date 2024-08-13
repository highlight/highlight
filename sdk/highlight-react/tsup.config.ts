import { defineConfig } from 'tsup'
import CssModulesPlugin from 'esbuild-css-modules-plugin'

export default defineConfig({
	clean: true,
	dts: true,
	esbuildPlugins: [CssModulesPlugin()],
	minify: true,
	sourcemap: false,
	splitting: false,
	bundle: true,
})
