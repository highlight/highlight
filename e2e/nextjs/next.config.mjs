// next.config.mjs
import { withHighlightConfig } from '@highlight-run/next/config'

const nextConfig = {
	experimental: {
		appDir: true,
		instrumentationHook: true,
	},
	productionBrowserSourceMaps: true,
	images: { domains: ['i.travelapi.com'] },
}

export default withHighlightConfig(nextConfig)
