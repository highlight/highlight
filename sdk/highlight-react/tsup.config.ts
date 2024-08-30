import CssModulesPlugin from 'esbuild-css-modules-plugin'
import { defineConfig } from 'tsup'

export default defineConfig({
	clean: true,
	dts: true,
	esbuildPlugins: [CssModulesPlugin()],
	minify: true,
	sourcemap: false,
	splitting: false,
	bundle: true,
})
