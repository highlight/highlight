const { withHighlightConfig } = require('@highlight-run/next/config')
const getStaticPages = require('./scripts/get-static-pages')

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		config.resolve.fallback = {
			...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
			// by next.js will be dropped. Doesn't make much sense, but how it is
			fs: false, // the solution
		}

		return config
	},
	compress: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'www.highlight.io',
			},
			{
				protocol: 'https',
				hostname: 'media.graphassets.com',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'picsum.photos',
			},
			{
				protocol: 'https',
				hostname: 'firebasestorage.googleapis.com',
			},
			{
				protocol: 'https',
				hostname: 'ca.slack-edge.com',
			},
			{
				protocol: 'https',
				hostname: 'tamuhack.org',
			},
		],
	},
	experimental: {
		serverComponentsExternalPackages: ['pino', 'pino-pretty'],
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
