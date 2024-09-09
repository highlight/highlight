// next.config.mjs
import { withHighlightConfig } from '@highlight-run/next/config'

/** @type {import('next').NextConfig} */
const nextConfig = {
	productionBrowserSourceMaps: false,
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
	rewrites: async () => [
		{ source: '/example', destination: 'https://www.google.com' },
	],
}

export default withHighlightConfig(nextConfig, {
	apiKey: 'abc123',
})
