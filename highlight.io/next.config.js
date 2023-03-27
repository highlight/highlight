const { withAxiom } = require('next-axiom')
const { withHighlightConfig } = require('@highlight-run/next')
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
    domains: ['media.graphassets.com', 'lh3.googleusercontent.com', 'picsum.photos'],
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
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ]
  },
}

module.exports = withHighlightConfig(withAxiom(nextConfig))
