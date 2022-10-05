import { uploadSourcemaps } from '@highlight-run/sourcemap-uploader'

export default class HighlightWebpackPlugin {
	apply(compiler: any) {
		compiler.hooks.afterEmit.tap('HighlightWebpackPlugin', () => {
			uploadSourcemaps({
				apiKey: '',
				appVersion: '',
				path: '',
			})
		})
		return compiler
	}
}
