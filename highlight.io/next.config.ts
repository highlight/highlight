import { withHighlightConfig } from '@highlight-run/next/config'
import getStaticPages from './scripts/get-static-pages'
import { NextConfig } from 'next/types'

const nextConfig: Promise<NextConfig> = withHighlightConfig({
	webpack: (config, { isServer, dev }) => {
		config.resolve.fallback = {
			...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
			// by next.js will be dropped. Doesn't make much sense, but how it is
			fs: false, // the solution
		}
		// configure server-side sourcemaps
		if (!dev) {
			if (isServer) {
				config.devtool = 'source-map'
			}
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
	serverExternalPackages: [
		'pino',
		'pino-pretty',
		'@highlight-run/node',
		'require-in-the-middle',
	],
	productionBrowserSourceMaps: true,
	reactStrictMode: true,
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
			{
				source: '/docs/wordpress',
				destination: '/docs/general/integrations/wordpress-integration',
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
			{
				source: '/blog/rss.xml',
				destination: '/api/rss',
			},
		]
	},
})
export default nextConfig
