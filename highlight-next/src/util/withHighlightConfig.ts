import next, {
	NextApiHandler,
	NextApiRequest,
	NextApiResponse,
	NextConfig,
} from 'next'
import { H, HIGHLIGHT_REQUEST_HEADER, NodeOptions } from '@highlight-run/node'
import { instrumentServer } from './instrumentServer'

export const withHighlightConfig = (config: NextConfig): NextConfig => {
	let newRewrites = config.rewrites
	if (newRewrites) {
		newRewrites = async () => {
			const re = await config.rewrites!()

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
	}

	let newWebpack = config.webpack
	if (newWebpack) {
		newWebpack = undefined
	}

	return { ...config, rewrites: newRewrites, webpack: newWebpack }
}
