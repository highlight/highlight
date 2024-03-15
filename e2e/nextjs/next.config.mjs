// next.config.mjs
import { withHighlightConfig } from '@highlight-run/next/config'

/** @type {import('next').NextConfig} */
const nextConfig = {
	productionBrowserSourceMaps: true,
	experimental: {
		serverComponentsExternalPackages: ['pino', 'pino-pretty'],
	},
	images: {
		remotePatterns: [{ protocol: 'https', hostname: 'i.travelapi.com' }],
	},
	webpack(config, options) {
		if (options.isServer) {
			config.ignoreWarnings = [{ module: /highlight-(run\/)?node/ }]
		}
		return config
	},
}

export default withHighlightConfig(nextConfig)
