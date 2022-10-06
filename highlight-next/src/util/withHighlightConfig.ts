import next, {
	NextApiHandler,
	NextApiRequest,
	NextApiResponse,
	NextConfig,
} from 'next'
import { H, HIGHLIGHT_REQUEST_HEADER, NodeOptions } from '@highlight-run/node'
import { instrumentServer } from './instrumentServer'
import { Rewrite } from 'next/dist/lib/load-custom-routes'
import HighlightWebpackPlugin from './highlightWebpackPlugin.js'
import { WebpackConfigContext } from 'next/dist/server/config-shared'

interface HighlightConfigOptionsDefault {
	uploadSourceMaps: boolean
	configureHighlightProxy: boolean
	apiKey: string
	appVersion: string
	sourceMapsPath: string
}

export interface HighlightConfigOptions {
	uploadSourceMaps?: boolean
	configureHighlightProxy?: boolean
	apiKey?: string
	appVersion?: string
	sourceMapsPath?: string
}

const getDefaultOpts = (
	config: NextConfig,
	highlightOpts?: HighlightConfigOptions,
): HighlightConfigOptionsDefault => {
	const isProdBuild = process.env.NODE_ENV === 'production'

	return {
		uploadSourceMaps:
			isProdBuild &&
			(highlightOpts?.uploadSourceMaps ??
				!config.productionBrowserSourceMaps ??
				true),
		configureHighlightProxy: highlightOpts?.configureHighlightProxy ?? true,
		apiKey: highlightOpts?.apiKey ?? '',
		appVersion: highlightOpts?.appVersion ?? '',
		sourceMapsPath: highlightOpts?.sourceMapsPath ?? '.next/',
	}
}

export const withHighlightConfig = (
	config: NextConfig,
	highlightOpts?: HighlightConfigOptions,
): NextConfig => {
	const defaultOpts = getDefaultOpts(config, highlightOpts)

	let newRewrites = config.rewrites
	if (defaultOpts.uploadSourceMaps || defaultOpts.configureHighlightProxy) {
		newRewrites = async () => {
			let re
			if (!config.rewrites) {
				re = new Array<Rewrite>()
			} else {
				re = await config.rewrites()
			}

			const sourcemapRewrite = {
				source: '/:path*.map',
				destination: '/404',
			}

			const highlightRewrite = {
				source: '/highlight-events',
				destination: 'https://pub.highlight.run',
			}

			if (Array.isArray(re)) {
				return {
					beforeFiles: defaultOpts.uploadSourceMaps
						? [sourcemapRewrite]
						: [],
					afterFiles: defaultOpts.configureHighlightProxy
						? re.concat(highlightRewrite)
						: [],
					fallback: [],
				}
			} else {
				return {
					beforeFiles: defaultOpts.uploadSourceMaps
						? re.beforeFiles.concat(sourcemapRewrite)
						: re.beforeFiles,
					afterFiles: defaultOpts.configureHighlightProxy
						? re.afterFiles.concat(highlightRewrite)
						: re.afterFiles,
					fallback: re.fallback,
				}
			}
		}
	}

	let newWebpack = config.webpack
	if (defaultOpts.uploadSourceMaps) {
		newWebpack = (webpackConfig: any, opts: WebpackConfigContext) => {
			let originalConfig = webpackConfig
			if (config.webpack) {
				originalConfig = config.webpack(webpackConfig, opts)
			}

			originalConfig.plugins.push(
				new HighlightWebpackPlugin(
					defaultOpts.apiKey,
					defaultOpts.appVersion,
					defaultOpts.sourceMapsPath ?? '.next/',
				),
			)

			return originalConfig
		}
	}

	return {
		...config,
		productionBrowserSourceMaps:
			defaultOpts.uploadSourceMaps || config.productionBrowserSourceMaps,
		rewrites: newRewrites,
		webpack: newWebpack,
	}
}
