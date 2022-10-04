import next, {
	NextApiHandler,
	NextApiRequest,
	NextApiResponse,
	NextConfig,
} from 'next'
import { H, HIGHLIGHT_REQUEST_HEADER, NodeOptions } from '@highlight-run/node'
import { instrumentServer } from './instrumentServer'

export const withHighlightConfig = (config: NextConfig): NextConfig => {
	const newRewrites = async () => {
		let re
		if (!config.rewrites) {
			re = []
		} else {
			re = await config.rewrites()
		}

		if (Array.isArray(re)) {
			return {
				beforeFiles: [
					{
						source: '/:path*.map',
						destination: '/404',
					},
				],
				afterFiles: re,
				fallback: [],
			}
		} else {
			return {
				beforeFiles: re.beforeFiles,
				afterFiles: re.afterFiles,
				fallback: re.fallback,
			}
		}
	}

	let newWebpack = config.webpack
	if (newWebpack) {
		newWebpack = (config, opts) => {
			const originalConfig = config.webpack(config, opts)
			originalConfig.plugins
				.push
				// new CopyPlugin([
				// 	{
				// 		from: './node_modules/@pdftron/webviewer/public',
				// 		to: './public/webviewer',
				// 	},
				// ]),
				()
			return originalConfig
		}
	}

	return { ...config, rewrites: newRewrites, webpack: newWebpack }
}
