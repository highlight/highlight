import { uploadSourcemaps } from '@highlight-run/sourcemap-uploader/dist/lib'

export default class HighlightWebpackPlugin {
	apiKey: string
	appVersion: string
	path: string
	basePath: string

	constructor(
		apiKey: string,
		appVersion: string,
		path: string,
		basePath: string,
	) {
		this.apiKey = apiKey
		this.appVersion = appVersion
		this.path = path
		this.basePath = basePath
	}

	apply(compiler: any) {
		compiler.hooks.afterEmit.tap('HighlightWebpackPlugin', () => {
			uploadSourcemaps({
				apiKey: this.apiKey,
				appVersion: this.appVersion,
				path: this.path,
				basePath: this.basePath,
				allowNoop: true,
			})
		})
		return compiler
	}
}
