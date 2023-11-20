// next.config.mjs
import { withHighlightConfig } from '@highlight-run/next/config'

const nextConfig = {
	productionBrowserSourceMaps: true,
	images: { domains: ['i.travelapi.com'] },
}

export default withHighlightConfig(nextConfig)
