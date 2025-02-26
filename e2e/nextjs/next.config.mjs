// next.config.mjs
import { withHighlightConfig } from '@highlight-run/next/config'

/** @type {import('next').NextConfig} */
const nextConfig = {
	productionBrowserSourceMaps: false,
	serverExternalPackages: ['pino', 'pino-pretty'],
	images: {
		remotePatterns: [{ protocol: 'https', hostname: 'i.travelapi.com' }],
	},
	rewrites: async () => [
		{ source: '/example', destination: 'https://www.google.com' },
	],
}

export default withHighlightConfig(nextConfig, {
	apiKey: 'abc123',
})
