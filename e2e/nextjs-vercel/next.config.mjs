// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		instrumentationHook: true,
	},
	images: {
		remotePatterns: [{ protocol: 'https', hostname: 'i.travelapi.com' }],
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
}

export default nextConfig
