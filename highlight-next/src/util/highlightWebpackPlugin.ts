import { uploadSourcemaps } from '@highlight-run/sourcemap-uploader'

export default class HighlightWebpackPlugin {
	apiKey: string
	appVersion: string
	path: string

	constructor(apiKey: string, appVersion: string, path: string) {
		this.apiKey = apiKey
		this.appVersion = appVersion
		this.path = path
	}

	apply(compiler: any) {
		compiler.hooks.afterEmit.tap('HighlightWebpackPlugin', () => {
			uploadSourcemaps({
				apiKey: this.apiKey,
				appVersion: this.appVersion,
				path: this.path,
			})
		})
		return compiler
	}
}
