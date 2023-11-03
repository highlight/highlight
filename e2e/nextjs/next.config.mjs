// next.config.mjs
import { withHighlightConfig } from '@highlight-run/next/config'

const nextConfig = {
	experimental: {
		instrumentationHook: false,
	},
	productionBrowserSourceMaps: true,
	images: { domains: ['i.travelapi.com'] },
}

export default withHighlightConfig(nextConfig)
