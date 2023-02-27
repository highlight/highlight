const nextBuildId = require('next-build-id')
const { withHighlightConfig } = require('@highlight-run/next')

/** @type {import('next').NextConfig} */
const nextConfig = {
	generateBuildId: () => nextBuildId({ dir: __dirname }),
	experimental: {
		appDir: true,
	},
}

module.exports = withHighlightConfig(nextConfig, { uploadSourceMaps: true })
