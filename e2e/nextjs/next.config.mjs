// next.config.mjs
const nextConfig = {
	experimental: {
		appDir: true,
		instrumentationHook: true,
	},
	productionBrowserSourceMaps: true,
	images: { domains: ['i.travelapi.com'] },
}

export default nextConfig
