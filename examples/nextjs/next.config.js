const { withHighlightConfig } = require('@highlight-run/next')

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
	},
}

module.exports = withHighlightConfig(nextConfig)
