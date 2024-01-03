// next.config.mjs
import { withHighlightConfig } from '@highlight-run/next/config'

const nextConfig = {
	productionBrowserSourceMaps: true,
	images: {
		remotePatterns: [{ protocol: 'https', hostname: 'i.travelapi.com' }],
	},
}

export default withHighlightConfig(nextConfig)
