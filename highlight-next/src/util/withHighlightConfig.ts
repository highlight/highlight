import next, {
	NextApiHandler,
	NextApiRequest,
	NextApiResponse,
	NextConfig,
} from 'next'
import { H, HIGHLIGHT_REQUEST_HEADER, NodeOptions } from '@highlight-run/node'
import { instrumentServer } from './instrumentServer'
import { Rewrite } from 'next/dist/lib/load-custom-routes'
import HighlightWebpackPlugin from './highlightWebpackPlugin'
import { WebpackConfigContext } from 'next/dist/server/config-shared'

export interface HighlightConfigOptions {
	apiKey?: string
	appVersion?: string
	path?: string
}

export const withHighlightConfig = (
	config: NextConfig,
	highlightOpts?: HighlightConfigOptions,
): NextConfig => {
	const newRewrites = async () => {
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
				beforeFiles: [sourcemapRewrite],
				afterFiles: re.concat(highlightRewrite),
				fallback: [],
			}
		} else {
			return {
				beforeFiles: re.beforeFiles.concat(sourcemapRewrite),
				afterFiles: re.afterFiles.concat(highlightRewrite),
				fallback: re.fallback,
			}
		}
	}

	const newWebpack = (webpackConfig: any, opts: WebpackConfigContext) => {
		let originalConfig = webpackConfig
		if (config.webpack) {
			originalConfig = config.webpack(webpackConfig, opts)
		}

		originalConfig.plugins.push(
			new HighlightWebpackPlugin(
				highlightOpts?.apiKey ?? '',
				highlightOpts?.appVersion ?? '',
				highlightOpts?.path ?? '',
			),
		)

		return originalConfig
	}

	return {
		...config,
		productionBrowserSourceMaps: true,
		rewrites: newRewrites,
		webpack: newWebpack,
	}
}
