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
}

export default withHighlightConfig(nextConfig)
