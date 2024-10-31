const { withHighlightConfig } = require('@highlight-run/next/config')
const getStaticPages = require('./scripts/get-static-pages')

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer }) => {
		config.resolve.fallback = {
			...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
			// by next.js will be dropped. Doesn't make much sense, but how it is
			fs: false, // the solution
		}
		// configure server-side sourcemaps
		if (isServer) {
			config.devtool = 'source-map'
		}
		return config
	},
	compress: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '*',
			},
		],
	},
	experimental: {
		serverComponentsExternalPackages: [
			'pino',
			'pino-pretty',
			'@highlight-run/node',
			'require-in-the-middle',
		],
		instrumentationHook: true,
	},
	productionBrowserSourceMaps: true,
	reactStrictMode: true,
	swcMinify: true,
	env: {
		staticPages: getStaticPages(),
	},
	async redirects() {
		return [
			{
				source: '/docs',
				destination: '/docs/general/welcome',
				permanent: false,
			},
			{
				source: '/docs/getting-started',
				destination: '/docs/getting-started/overview',
				permanent: false,
			},
			{
				source: '/docs/general',
				destination: '/docs/general/welcome',
				permanent: false,
			},
			{
				source: '/careers/:slug*',
				destination: 'https://careers.highlight.io',
				permanent: false,
			},
			{
				source: '/community/:slug*',
				destination: 'https://discord.com/invite/yxaXEAqgwN',
				permanent: false,
			},
			{
				source: '/github/:slug*',
				destination: 'https://github.com/highlight/highlight',
				permanent: false,
			},
			{
				source: '/docs/product-features/comments',
				destination:
					'/docs/general/product-features/general-features/comments',
				permanent: true,
			},
			{
				source: '/docs/general/company/product-philosphy',
				destination: '/docs/general/company/product-philosophy',
				permanent: true,
			},
			{
				source: '/docs/general/product-features/session-replay/privacy',
				destination:
					'/docs/getting-started/client-sdk/replay-configuration/privacy',
				permanent: true,
			},
			{
				source: '/docs/reference',
				destination: '/docs',
				permanent: true,
			},
			{
				source: '/blog/post/opensearch-for-a-write-heavy-workload',
				destination: '/blog/opensearch-for-a-write-heavy-workload',
				permanent: true,
			},
			{
				source: '/docs/general/getting-started/backend-sdk/cloudflare',
				destination:
					'/docs/getting-started/backend-logging/js/cloudflare',
				permanent: true,
			},
			{
				source: '/docs/general/getting-started/backend-sdk/python',
				destination:
					'/docs/getting-started/backend-logging/python/other',
				permanent: true,
			},
		]
	},
	async headers() {
		return [
			{
				source: '/images/:path*',
				headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
			},
		]
	},
	async rewrites() {
		return [
			{
				source: '/sitemap.xml',
				destination: '/api/sitemap',
			},
		]
	},
}

module.exports = withHighlightConfig(nextConfig)
