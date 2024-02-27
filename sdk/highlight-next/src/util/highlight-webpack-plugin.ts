import { uploadSourcemaps } from '@highlight-run/sourcemap-uploader/dist/lib'

export default class HighlightWebpackPlugin {
	apiKey: string
	appVersion: string
	path: string
	basePath: string
	backendUrl?: string

	constructor(
		apiKey: string,
		appVersion: string,
		path: string,
		basePath: string,
		backendUrl?: string,
	) {
		this.apiKey = apiKey
		this.appVersion = appVersion
		this.path = path
		this.basePath = basePath
		this.backendUrl = backendUrl
	}

	apply(compiler: any) {
		compiler.hooks.afterEmit.tap('HighlightWebpackPlugin', async () => {
			try {
				await uploadSourcemaps({
					apiKey: this.apiKey,
					appVersion: this.appVersion,
					path: this.path,
					basePath: this.basePath,
					backendUrl: this.backendUrl,
					allowNoop: true,
				})
			} catch (e) {
				console.error(`Highlight Failed to upload sourcemaps: ${e}`)
			}
		})
		return compiler
	}
}
