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
			// Blog posts migrated to LaunchDarkly tutorials
			{
				source: '/blog/3-levels-of-data-validation-in-a-full-stack-application-with-react',
				destination:
					'https://launchdarkly.com/docs/tutorials/3-levels-of-data-validation-in-a-full-stack-application-with-react',
				permanent: true,
			},
			{
				source: '/blog/application-tracing-in-dot-net',
				destination:
					'https://launchdarkly.com/docs/tutorials/application-tracing-in-dot-net',
				permanent: true,
			},
			{
				source: '/blog/aws-msk-kafka-guide',
				destination:
					'https://launchdarkly.com/docs/tutorials/aws-msk-kafka-guide',
				permanent: true,
			},
			{
				source: '/blog/clickhouse-materialized-views',
				destination:
					'https://launchdarkly.com/docs/tutorials/clickhouse-materialized-views',
				permanent: true,
			},
			{
				source: '/blog/compression',
				destination:
					'https://launchdarkly.com/docs/tutorials/compression',
				permanent: true,
			},
			{
				source: '/blog/distributed-tracing-in-nextjs',
				destination:
					'https://launchdarkly.com/docs/tutorials/distributed-tracing-in-nextjs',
				permanent: true,
			},
			{
				source: '/blog/django-monitoring-solutions',
				destination:
					'https://launchdarkly.com/docs/tutorials/django-monitoring-solutions',
				permanent: true,
			},
			{
				source: '/blog/filtering-and-sampling-ingest',
				destination:
					'https://launchdarkly.com/docs/tutorials/filtering-and-sampling-ingest',
				permanent: true,
			},
			{
				source: '/blog/how-to-instrument-your-react-native-app-with-opentelemetry',
				destination:
					'https://launchdarkly.com/docs/tutorials/how-to-instrument-your-react-native-app-with-opentelemetry',
				permanent: true,
			},
			{
				source: '/blog/how-to-use-opentelemetry-to-monitor-nextjs-apps',
				destination:
					'https://launchdarkly.com/docs/tutorials/how-to-use-opentelemetry-to-monitor-nextjs-apps',
				permanent: true,
			},
			{
				source: '/blog/how-to-use-the-chrome-inspector-debugger',
				destination:
					'https://launchdarkly.com/docs/tutorials/how-to-use-the-chrome-inspector-debugger',
				permanent: true,
			},
			{
				source: '/blog/keeping-your-frontend-and-backend-in-sync-with-a-monorepo',
				destination:
					'https://launchdarkly.com/docs/tutorials/keeping-your-frontend-and-backend-in-sync-with-a-monorepo',
				permanent: true,
			},
			{
				source: '/blog/monitoring-browser-applications-with-opentelemetry',
				destination:
					'https://launchdarkly.com/docs/tutorials/monitoring-browser-applications-with-opentelemetry',
				permanent: true,
			},
			{
				source: '/blog/observability-in-gorm',
				destination:
					'https://launchdarkly.com/docs/tutorials/observability-in-gorm',
				permanent: true,
			},
			{
				source: '/blog/publishing-private-pnpm-monorepo',
				destination:
					'https://launchdarkly.com/docs/tutorials/publishing-private-pnpm-monorepo',
				permanent: true,
			},
			{
				source: '/blog/ruby-logging-best-practices',
				destination:
					'https://launchdarkly.com/docs/tutorials/ruby-logging-best-practices',
				permanent: true,
			},
			{
				source: '/blog/the-complete-guide-to-opentelemetry-in-next-js',
				destination:
					'https://launchdarkly.com/docs/tutorials/the-complete-guide-to-opentelemetry-in-next-js',
				permanent: true,
			},
			{
				source: '/blog/the-complete-guide-to-python-and-opentelemetry',
				destination:
					'https://launchdarkly.com/docs/tutorials/the-complete-guide-to-python-and-opentelemetry',
				permanent: true,
			},
			{
				source: '/blog/tracing-distributed-systems-in-nextjs',
				destination:
					'https://launchdarkly.com/docs/tutorials/tracing-distributed-systems-in-nextjs',
				permanent: true,
			},
			{
				source: '/blog/what-is-opentelemetry',
				destination:
					'https://launchdarkly.com/docs/tutorials/what-is-opentelemetry',
				permanent: true,
			},
			{
				source: '/blog/5-best-ruby-logging-libraries',
				destination:
					'https://launchdarkly.com/docs/tutorials/5-best-ruby-logging-libraries',
				permanent: true,
			},
			{
				source: '/blog/5-strategies-monitor-health',
				destination:
					'https://launchdarkly.com/docs/tutorials/5-strategies-monitor-health',
				permanent: true,
			},
			{
				source: '/blog/ai-grouping-for-errors',
				destination:
					'https://launchdarkly.com/docs/tutorials/ai-grouping-for-errors',
				permanent: true,
			},
			{
				source: '/blog/alert-evaluations-incremental-merges-in-clickhouse',
				destination:
					'https://launchdarkly.com/docs/tutorials/alert-evaluations-incremental-merges-in-clickhouse',
				permanent: true,
			},
			{
				source: '/blog/building-our-logging-integrations',
				destination:
					'https://launchdarkly.com/docs/tutorials/building-our-logging-integrations',
				permanent: true,
			},
			{
				source: '/blog/chrome-devtools-tips',
				destination:
					'https://launchdarkly.com/docs/tutorials/chrome-devtools-tips',
				permanent: true,
			},
			{
				source: '/blog/default-privacy-mode',
				destination:
					'https://launchdarkly.com/docs/tutorials/default-privacy-mode',
				permanent: true,
			},
			{
				source: '/blog/design-tokens-at-highlight',
				destination:
					'https://launchdarkly.com/docs/tutorials/design-tokens-at-highlight',
				permanent: true,
			},
			{
				source: '/blog/github-enhanced-stacktraces',
				destination:
					'https://launchdarkly.com/docs/tutorials/github-enhanced-stacktraces',
				permanent: true,
			},
			{
				source: '/blog/injecting-metrics-with-time-series-influxdb',
				destination:
					'https://launchdarkly.com/docs/tutorials/injecting-metrics-with-time-series-influxdb',
				permanent: true,
			},
			{
				source: '/blog/interesting-sessions',
				destination:
					'https://launchdarkly.com/docs/tutorials/interesting-sessions',
				permanent: true,
			},
			{
				source: '/blog/java-sdk-open-source-contribution',
				destination:
					'https://launchdarkly.com/docs/tutorials/java-sdk-open-source-contribution',
				permanent: true,
			},
			{
				source: '/blog/lw5-clickhouse-performance-optimization',
				destination:
					'https://launchdarkly.com/docs/tutorials/lw5-clickhouse-performance-optimization',
				permanent: true,
			},
			{
				source: '/blog/make-source-maps-public',
				destination:
					'https://launchdarkly.com/docs/tutorials/make-source-maps-public',
				permanent: true,
			},
			{
				source: '/blog/migrating-opensearch-to-clickhouse',
				destination:
					'https://launchdarkly.com/docs/tutorials/migrating-opensearch-to-clickhouse',
				permanent: true,
			},
			{
				source: '/blog/network-request-panel',
				destination:
					'https://launchdarkly.com/docs/tutorials/network-request-panel',
				permanent: true,
			},
			{
				source: '/blog/nodejs-logging-libraries',
				destination:
					'https://launchdarkly.com/docs/tutorials/nodejs-logging-libraries',
				permanent: true,
			},
			{
				source: '/blog/opensearch-for-a-write-heavy-workload',
				destination:
					'https://launchdarkly.com/docs/tutorials/opensearch-for-a-write-heavy-workload',
				permanent: true,
			},
			{
				source: '/blog/opentelemetry',
				destination:
					'https://launchdarkly.com/docs/tutorials/opentelemetry',
				permanent: true,
			},
			{
				source: '/blog/rage-clicks',
				destination:
					'https://launchdarkly.com/docs/tutorials/rage-clicks',
				permanent: true,
			},
			{
				source: '/blog/row-level-security',
				destination:
					'https://launchdarkly.com/docs/tutorials/row-level-security',
				permanent: true,
			},
			{
				source: '/blog/scalable-data-processing-with-apache-kafka',
				destination:
					'https://launchdarkly.com/docs/tutorials/scalable-data-processing-with-apache-kafka',
				permanent: true,
			},
			{
				source: '/blog/session-replay-performance',
				destination:
					'https://launchdarkly.com/docs/tutorials/session-replay-performance',
				permanent: true,
			},
			{
				source: '/blog/strategies-to-monitor-the-health-of-your-web-application',
				destination:
					'https://launchdarkly.com/docs/tutorials/strategies-to-monitor-the-health-of-your-web-application',
				permanent: true,
			},
			{
				source: '/blog/supporting-opentelemetry-metrics',
				destination:
					'https://launchdarkly.com/docs/tutorials/supporting-opentelemetry-metrics',
				permanent: true,
			},
			{
				source: '/blog/the-beauty-of-contract-first-api-design',
				destination:
					'https://launchdarkly.com/docs/tutorials/the-beauty-of-contract-first-api-design',
				permanent: true,
			},
			{
				source: '/blog/the-debugging-process-and-techniques-for-web-applications-part-2-2',
				destination:
					'https://launchdarkly.com/docs/tutorials/the-debugging-process-and-techniques-for-web-applications-part-2-2',
				permanent: true,
			},
			{
				source: '/blog/using-github-as-a-headless-cms',
				destination:
					'https://launchdarkly.com/docs/tutorials/using-github-as-a-headless-cms',
				permanent: true,
			},
			{
				source: '/blog/vercel-edge-support',
				destination:
					'https://launchdarkly.com/docs/tutorials/vercel-edge-support',
				permanent: true,
			},
			{
				source: '/blog/what-is-frontend-monitoring',
				destination:
					'https://launchdarkly.com/docs/tutorials/what-is-frontend-monitoring',
				permanent: true,
			},
			{
				source: '/blog/what-is-full-stack-monitoring-and-how-does-it-work',
				destination:
					'https://launchdarkly.com/docs/tutorials/what-is-full-stack-monitoring-and-how-does-it-work',
				permanent: true,
			},
			{
				source: '/blog/worker-pools',
				destination:
					'https://launchdarkly.com/docs/tutorials/worker-pools',
				permanent: true,
			},
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
				destination:
					'https://launchdarkly.com/docs/tutorials/opensearch-for-a-write-heavy-workload',
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
