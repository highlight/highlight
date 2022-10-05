import { uploadSourcemaps } from '@highlight-run/sourcemap-uploader'

export default class HighlightWebpackPlugin {
	apply(compiler: any) {
		console.log('hi')
		compiler.hooks.afterEmit.tap('HighlightWebpackPlugin', () => {
			uploadSourcemaps({
				apiKey: '',
				appVersion: '',
				path: './.next/static/chunks/',
			})
		})
		return compiler
	}
}
