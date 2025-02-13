// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { highlightMiddleware } from '@highlight-run/next/server'

// this will redirect the domain landing page to the following page component
const SUBDOMAIN_LANDING_PAGES = {
	docs: '/docs',
	observability: '/blog/frontend-observability',
	monitor: '/blog/frontend-observability',
	nextjs: '/blog/feature-nextjs-integration',
	nodejs: '/blog/feature-nodejs-integration',
	errors: '/blog/new-error-management-ui',
}

export const DOCS_REDIRECTS = {
	'amplitude-integration': '/docs/general/integrations/amplitude-integration',
	'api/changelog': '/changelogs',
	'api/haddsessionfeedback': '/docs/sdk/client#Hadd-session-feedback',
	'api/hconsumeerror': '/docs/sdk/nodejs#Hconsume-error',
	'api/hgetsessiondetails': '/docs/sdk/client#Hget-session-details',
	'api/hgetsessionurl': '/docs/sdk/client#Hget-session-url',
	'api/hidentify': '/docs/sdk/client#Hidentify',
	'api/highlight': '/docs/sdk/nextjs#Highlight',
	'api/hinit': '/docs/sdk/nodejs#Hinit',
	'api/hisinitialized': '/docs/sdk/nodejs#His-initialized',
	'api/hmetrics': '/docs/sdk/client#Hmetrics',
	'api/hparseheaders': '/docs/sdk/nodejs#Hparse-headers',
	'api/hrecordmetric': '/docs/sdk/nodejs#Hrecord-metric',
	'api/hstart': '/docs/sdk/client#Hstart',
	'api/hstop': '/docs/sdk/client#Hstop',
	'api/htrack': '/docs/sdk/client#Htrack',
	'api/ljQK-hconsumeerror': '/docs/sdk/client#Hconsume-error',
	'api/metrics': '/docs/sdk/client#Hmetrics',
	'api/networkrecordingoptions': '/docs/sdk/client#Hinit',
	'api/nodejs/h-init': '/docs/sdk/nodejs#Hinit',
	'api/withhighlightconfig': '/docs/sdk/nextjs#withHighlightConfig',
	server: '/docs/getting-started/server',
	'clearbit-integration': '/docs/integrations/clearbit-integration',
	browser: '/docs/getting-started/browser',
	'console-messages': '/docs/session-replay/console-messages',
	'content-security-policy': '/docs/tips/content-security-policy',
	'electron-integration': '/docs/integrations/electron-integration',
	'error-monitoring/sourcemaps':
		'/docs/general/product-features/error-monitoring/sourcemaps',
	'express-backend': '/docs/getting-started/server/nextjs',
	'front-plugin': '/docs/integrations/front-plugin',
	'frontend-observability':
		'/docs/getting-started/overview#For-your-Frontend',
	'general/getting-started/browser/nextjs':
		'/docs/getting-started/browser/nextjs',
	'general/product-features/frontend-observability':
		'/docs/getting-started/overview#For-your-Frontend',
	'general/product-features/session-replay/canvas':
		'/docs/getting-started/browser/replay-configuration/canvas',
	'go-backend': '/docs/getting-started/server/go',
	'grouping-errors': '/docs/error-monitoring/grouping-errors',
	'html-iframe-recording': '/docs/session-replay/html-iframe-recording',
	'identifying-users': '/docs/session-replay/identifying-sessions',
	'integrations/amplitude-integration':
		'/docs/general/integrations/amplitude-integration',
	'integrations/mixpanel-integration':
		'/docs/general/integrations/mixpanel-integration',
	'integrations/reactjs-integration':
		'/docs/getting-started/browser/replay-configuration/react-error-boundary',
	'integrations/sentry-integration':
		'/docs/general/product-features/error-monitoring/overview',
	'intercom-integration': '/docs/integrations/intercom-integration',
	'keyboard-shortcuts': '/docs/product-features/keyboard-shortcuts',
	'linear-integration': '/docs/integrations/linear-integration',
	'live-mode': '/docs/session-replay/live-mode',
	'local-development': '/docs/tips/local-development',
	'mixpanel-integration': '/docs/general/integrations/mixpanel-integration',
	'monkey-patches': '/docs/tips/monkey-patches',
	'network-devtools': '/docs/session-replay/network-devtools',
	'nextjs-backend': '/docs/getting-started/server/js/express',
	'nextjs-sdk': '/docs/getting-started/server/js/nextjs',
	'nodejs-backend': '/docs/getting-started/server/js/nodejs',
	'performance-data': '/docs/product-features/performance-data',
	'performance-impact': '/docs/tips/performance-impact',
	'product-features/canvas':
		'/docs/general/product-features/session-replay/canvas',
	'product-features/console-messages':
		'/docs/general/product-features/session-replay/console-messages',
	'product-features/cross-origin-iframes':
		'/docs/general/product-features/session-replay/cross-origin-iframes',
	'product-features/frontend-observability':
		'/docs/general/product-features/session-replay/overview',
	'product-features/html-iframe-recording':
		'/docs/general/product-features/session-replay/html-iframe-recording',
	'product-features/live-mode':
		'/docs/general/product-features/session-replay/live-mode',
	'product-features/session-search':
		'/docs/general/product-features/session-replay/session-search',
	'product-features/user-feedback':
		'/docs/general/product-features/session-replay/overview',
	'product-features/versioning-sessions':
		'/docs/general/product-features/session-replay/versioning-sessions',
	'product-features/web-vitals': '/docs/general/tips/performance-impact',
	'proxying-highlight':
		'/docs/getting-started/browser/replay-configuration/proxying-highlight',
	'rage-clicks': '/docs/session-replay/rage-clicks',
	'reactjs-integration':
		'/docs/getting-started/browser/replay-configuration/react-error-boundary',
	'recording-network-requests-and-responses':
		'/docs/session-replay/recording-network-requests-and-responses',
	'segment-integration': '/docs/integrations/segment-integration',
	'sentry-integration': '/docs/integrations/sentry-integration',
	'session-replay/identifying-sessions':
		'/docs/general/product-features/session-replay/identifying-sessions',
	'session-replay/privacy':
		'/docs/general/product-features/session-replay/privacy',
	'session-replay/rage-clicks':
		'/docs/general/product-features/session-replay/rage-clicks',
	'session-replay/recording-network-requests-and-responses':
		'/docs/general/product-features/session-replay/recording-network-requests-and-responses',
	'session-replay/tracking-events':
		'/docs/general/product-features/session-replay/tracking-events',
	'session-search': '/docs/product-features/session-search',
	'session-search-deep-linking': '/docs/tips/sessions-search-deep-linking',
	'session-sharing': '/docs/session-replay/session-sharing',
	'session-shortcut': '/docs/session-replay/session-shortcut',
	'slack-integration': '/docs/integrations/slack-integration',
	'team-management': '/docs/product-features/team-management',
	'tips/proxying-highlight':
		'/docs/getting-started/browser/replay-configuration/proxying-highlight',
	'tracking-events': '/docs/session-replay/tracking-events',
	'upgrading-highlight': '/docs/tips/upgrading-highlight',
	'user-feedback': '/docs/product-features/user-feedback',
	'vercel-integration': '/docs/integrations/vercel-integration',
	'versioning-errors': '/docs/error-monitoring/versioning-errors',
	'versioning-sessions': '/docs/session-replay/versioning-sessions',
	'web-vitals': '/docs/product-features/web-vitals',
	alerts: '/docs/product-features/alerts',
	analytics: '/docs/product-features/analytics',
	angular: '/docs/getting-started/browser/angular',
	api: '/docs/sdk/client#Hinit',
	canvas: '/docs/getting-started/browser/replay-configuration/canvas',
	comments: '/docs/product-features/comments',
	environments: '/docs/product-features/environments',
	gatsbyjs: '/docs/getting-started/browser/gatsbyjs',
	html: '/docs/getting-started/browser/html',
	metrics:
		'/docs/getting-started/fullstack-frameworks/next-js/metrics-overview',
	nextjs: '/docs/getting-started/browser/nextjs',
	other: '/docs/getting-started/browser/other',
	privacy: '/docs/session-replay/privacy',
	segments: '/docs/product-features/segments',
	shopify: '/docs/getting-started/browser/shopify',
	sourcemaps: '/docs/error-monitoring/sourcemaps',
	squarespace: '/docs/getting-started/browser/squarespace',
	sveltekit: '/docs/getting-started/browser/sveltekit',
	troubleshooting: '/docs/tips/troubleshooting',
	vuejs: '/docs/getting-started/browser/vuejs',
	webflow: '/docs/getting-started/browser/webflow',
	webgl: '/docs/product-features/webgl',
	wordpress: '/docs/getting-started/browser/wordpress',
	'getting-started/backend-sdk/java/overview':
		'/docs/getting-started/server/java-other',
	'getting-started/backend-sdk/java/other':
		'/docs/getting-started/server/java-other',
	'getting-started/backend-sdk/php/overview':
		'/docs/getting-started/server/php-other',
	'getting-started/backend-sdk/php/other':
		'/docs/getting-started/server/php-other',
	'getting-started/backend-logging/java/overview':
		'/docs/getting-started/server/java-other',
	'getting-started/backend-logging/java/other':
		'/docs/getting-started/server/java-other',
	'getting-started/backend-logging/php':
		'/docs/getting-started/server/php-other',
	'getting-started/backend-tracing/php':
		'/docs/getting-started/server/php-other',
	'getting-started/backend-tracing/node-js/manual':
		'/docs/getting-started/server/js/nodejs',
	'getting-started/backend-tracing/node-js/nextjs':
		'/docs/getting-started/server/js/nextjs',
	'getting-started/client-sdk/reactjs':
		'/docs/getting-started/browser/reactjs',
	'getting-started/client-sdk/nextjs': '/docs/getting-started/browser/nextjs',
	'getting-started/client-sdk/remix': '/docs/getting-started/browser/remix',
	'getting-started/client-sdk/vuejs': '/docs/getting-started/browser/vuejs',
	'getting-started/client-sdk/angular':
		'/docs/getting-started/browser/angular',
	'getting-started/client-sdk/gatsbyjs':
		'/docs/getting-started/browser/gatsbyjs',
	'getting-started/client-sdk/sveltekit':
		'/docs/getting-started/browser/sveltekit',
	'getting-started/client-sdk/electron':
		'/docs/getting-started/browser/electron',
	'getting-started/client-sdk/other': '/docs/getting-started/browser/other',
	'getting-started/client-sdk/react-native':
		'/docs/getting-started/browser/react-native',
	'getting-started/client-sdk/replay-configuration/overview':
		'/docs/getting-started/client-sdk/replay-configuration/overview',
	'getting-started/client-sdk/replay-configuration/canvas':
		'/docs/getting-started/client-sdk/replay-configuration/canvas',
	'getting-started/client-sdk/replay-configuration/console-messages':
		'/docs/getting-started/client-sdk/replay-configuration/console-messages',
	'getting-started/client-sdk/replay-configuration/content-security-policy':
		'/docs/getting-started/client-sdk/replay-configuration/content-security-policy',
	'getting-started/client-sdk/replay-configuration/identifying-sessions':
		'/docs/getting-started/client-sdk/replay-configuration/identifying-sessions',
	'getting-started/client-sdk/replay-configuration/iframes':
		'/docs/getting-started/client-sdk/replay-configuration/iframes',
	'getting-started/client-sdk/replay-configuration/monkey-patches':
		'/docs/getting-started/client-sdk/replay-configuration/monkey-patches',
	'getting-started/client-sdk/replay-configuration/opentelemetry':
		'/docs/getting-started/client-sdk/replay-configuration/opentelemetry',
	'getting-started/client-sdk/replay-configuration/persistent-assets':
		'/docs/getting-started/client-sdk/replay-configuration/persistent-assets',
	'getting-started/client-sdk/replay-configuration/privacy':
		'/docs/getting-started/client-sdk/replay-configuration/privacy',
	'getting-started/client-sdk/replay-configuration/proxying-highlight':
		'/docs/getting-started/client-sdk/replay-configuration/proxying-highlight',
	'getting-started/client-sdk/replay-configuration/react-error-boundary':
		'/docs/getting-started/client-sdk/replay-configuration/react-error-boundary',
	'getting-started/client-sdk/replay-configuration/recording-network-requests-and-responses':
		'/docs/getting-started/client-sdk/replay-configuration/recording-network-requests-and-responses',
	'getting-started/client-sdk/replay-configuration/recording-web-socket-events':
		'/docs/getting-started/client-sdk/replay-configuration/recording-web-socket-events',
	'getting-started/client-sdk/replay-configuration/salesforce-lwc':
		'/docs/getting-started/client-sdk/replay-configuration/salesforce-lwc',
	'getting-started/client-sdk/replay-configuration/session-data-export':
		'/docs/getting-started/client-sdk/replay-configuration/session-data-export',
	'getting-started/client-sdk/replay-configuration/sourcemaps':
		'/docs/getting-started/client-sdk/replay-configuration/sourcemaps',
	'getting-started/client-sdk/replay-configuration/tracking-events':
		'/docs/getting-started/client-sdk/replay-configuration/tracking-events',
	'getting-started/client-sdk/replay-configuration/troubleshooting':
		'/docs/getting-started/client-sdk/replay-configuration/troubleshooting',
	'getting-started/client-sdk/replay-configuration/upgrading-highlight':
		'/docs/getting-started/client-sdk/replay-configuration/upgrading-highlight',
	'getting-started/client-sdk/replay-configuration/versioning-sessions-and-errors':
		'/docs/getting-started/client-sdk/replay-configuration/versioning-sessions-and-errors',
	'getting-started/backend-sdk/go': '/docs/getting-started/server/go',
	'getting-started/backend-logging/go': '/docs/getting-started/server/go',
	'getting-started/backend-tracing/go': '/docs/getting-started/server/go',
	'getting-started/backend-sdk/go/overview':
		'/docs/getting-started/server/go/overview',
	'getting-started/backend-logging/go/overview':
		'/docs/getting-started/server/go/overview',
	'getting-started/backend-tracing/go/overview':
		'/docs/getting-started/server/go/overview',
	'getting-started/backend-sdk/go/chi': '/docs/getting-started/server/go/chi',
	'getting-started/backend-sdk/go/echo':
		'/docs/getting-started/server/go/echo',
	'getting-started/backend-sdk/go/gin': '/docs/getting-started/server/go/gin',
	'getting-started/backend-sdk/go/mux': '/docs/getting-started/server/go/mux',
	'getting-started/backend-sdk/go/fiber':
		'/docs/getting-started/server/go/fiber',
	'getting-started/backend-logging/go/fiber':
		'/docs/getting-started/server/go/fiber',
	'getting-started/backend-tracing/go/gorm':
		'/docs/getting-started/server/go/gorm',
	'getting-started/backend-sdk/go/gqlgen':
		'/docs/getting-started/server/go/gqlgen',
	'getting-started/backend-logging/go/logrus':
		'/docs/getting-started/server/go/logrus',
	'getting-started/backend-tracing/go/manual':
		'/docs/getting-started/server/go/manual',
	'getting-started/backend-sdk/js': '/docs/getting-started/server/js',
	'getting-started/backend-logging/js': '/docs/getting-started/server/js',
	'getting-started/backend-sdk/js/overview':
		'/docs/getting-started/server/js/overview',
	'getting-started/backend-logging/js/overview':
		'/docs/getting-started/server/js/overview',
	'getting-started/backend-sdk/js/apollo':
		'/docs/getting-started/server/js/apollo',
	'getting-started/backend-sdk/js/aws-lambda':
		'/docs/getting-started/server/js/aws-lambda',
	'getting-started/backend-sdk/js/cloudflare':
		'/docs/getting-started/server/js/cloudflare',
	'getting-started/backend-logging/js/cloudflare':
		'/docs/getting-started/server/js/cloudflare',
	'getting-started/backend-sdk/js/express':
		'/docs/getting-started/server/js/express',
	'getting-started/backend-sdk/js/firebase':
		'/docs/getting-started/server/js/firebase',
	'getting-started/backend-sdk/js/hono':
		'/docs/getting-started/server/js/hono',
	'getting-started/backend-sdk/js/nestjs':
		'/docs/getting-started/server/js/nestjs',
	'getting-started/backend-logging/js/nestjs':
		'/docs/getting-started/server/js/nestjs',
	'getting-started/backend-sdk/js/nextjs':
		'/docs/getting-started/server/js/nextjs',
	'getting-started/backend-sdk/js/nodejs':
		'/docs/getting-started/server/js/nodejs',
	'getting-started/backend-logging/js/nodejs':
		'/docs/getting-started/server/js/nodejs',
	'getting-started/backend-logging/js/pino':
		'/docs/getting-started/server/js/pino',
	'getting-started/backend-sdk/js/trpc':
		'/docs/getting-started/server/js/trpc',
	'getting-started/backend-logging/js/winston':
		'/docs/getting-started/server/js/winston',
	'getting-started/backend-sdk/python': '/docs/getting-started/server/python',
	'getting-started/backend-logging/python':
		'/docs/getting-started/server/python',
	'getting-started/backend-tracing/python':
		'/docs/getting-started/server/python',
	'getting-started/backend-sdk/python/overview':
		'/docs/getting-started/server/python/overview',
	'getting-started/backend-logging/python/overview':
		'/docs/getting-started/server/python/overview',
	'getting-started/backend-tracing/python/overview':
		'/docs/getting-started/server/python/overview',
	'getting-started/backend-sdk/python/aws-lambda':
		'/docs/getting-started/server/python/aws-lambda',
	'getting-started/backend-tracing/python/aws-lambda':
		'/docs/getting-started/server/python/aws-lambda',
	'getting-started/backend-sdk/python/azure-functions':
		'/docs/getting-started/server/python/azure-functions',
	'getting-started/backend-tracing/python/azure-functions':
		'/docs/getting-started/server/python/azure-functions',
	'getting-started/backend-sdk/python/django':
		'/docs/getting-started/server/python/django',
	'getting-started/backend-tracing/python/django':
		'/docs/getting-started/server/python/django',
	'getting-started/backend-sdk/python/fastapi':
		'/docs/getting-started/server/python/fastapi',
	'getting-started/backend-tracing/python/fastapi':
		'/docs/getting-started/server/python/fastapi',
	'getting-started/backend-sdk/python/flask':
		'/docs/getting-started/server/python/flask',
	'getting-started/backend-tracing/python/flask':
		'/docs/getting-started/server/python/flask',
	'getting-started/backend-sdk/python/google-cloud-functions':
		'/docs/getting-started/server/python/google-cloud-functions',
	'getting-started/backend-tracing/python/google-cloud-functions':
		'/docs/getting-started/server/python/google-cloud-functions',
	'getting-started/backend-logging/python/loguru':
		'/docs/getting-started/server/python/loguru',
	'getting-started/backend-sdk/python/other':
		'/docs/getting-started/server/python/other',
	'getting-started/backend-logging/python/other':
		'/docs/getting-started/server/python/other',
	'getting-started/backend-tracing/python/python-ai':
		'/docs/getting-started/server/python/python-ai',
	'getting-started/backend-tracing/python/python-libraries':
		'/docs/getting-started/server/python/python-libraries',
	'getting-started/backend-sdk/ruby': '/docs/getting-started/server/ruby',
	'getting-started/backend-logging/ruby': '/docs/getting-started/server/ruby',
	'getting-started/backend-tracing/ruby': '/docs/getting-started/server/ruby',
	'getting-started/backend-sdk/ruby/overview':
		'/docs/getting-started/server/ruby/overview',
	'getting-started/backend-logging/ruby/overview':
		'/docs/getting-started/server/ruby/overview',
	'getting-started/backend-tracing/ruby/overview':
		'/docs/getting-started/server/ruby/overview',
	'getting-started/backend-sdk/ruby/other':
		'/docs/getting-started/server/ruby/other',
	'getting-started/backend-logging/ruby/other':
		'/docs/getting-started/server/ruby/other',
	'getting-started/backend-tracing/ruby/other':
		'/docs/getting-started/server/ruby/other',
	'getting-started/backend-sdk/ruby/rails':
		'/docs/getting-started/server/ruby/rails',
	'getting-started/backend-logging/ruby/rails':
		'/docs/getting-started/server/ruby/rails',
	'getting-started/backend-tracing/ruby/rails':
		'/docs/getting-started/server/ruby/rails',
	'getting-started/backend-sdk/rust': '/docs/getting-started/server/rust',
	'getting-started/backend-logging/rust': '/docs/getting-started/server/rust',
	'getting-started/backend-tracing/rust': '/docs/getting-started/server/rust',
	'getting-started/backend-sdk/rust/overview':
		'/docs/getting-started/server/rust/overview',
	'getting-started/backend-logging/rust/overview':
		'/docs/getting-started/server/rust/overview',
	'getting-started/backend-tracing/rust/overview':
		'/docs/getting-started/server/rust/overview',
	'getting-started/backend-sdk/rust/actix':
		'/docs/getting-started/server/rust/actix',
	'getting-started/backend-logging/rust/actix':
		'/docs/getting-started/server/rust/actix',
	'getting-started/backend-tracing/rust/actix':
		'/docs/getting-started/server/rust/actix',
	'getting-started/backend-sdk/rust/other':
		'/docs/getting-started/server/rust/other',
	'getting-started/backend-logging/rust/other':
		'/docs/getting-started/server/rust/other',
	'getting-started/backend-tracing/rust/other':
		'/docs/getting-started/server/rust/other',
	'getting-started/backend-logging/hosting':
		'/docs/getting-started/server/hosting',
	'getting-started/backend-logging/hosting/overview':
		'/docs/getting-started/server/hosting/overview',
	'getting-started/backend-logging/hosting/aws-metrics':
		'/docs/getting-started/server/hosting/aws-metrics',
	'getting-started/backend-logging/hosting/aws':
		'/docs/getting-started/server/hosting/aws',
	'getting-started/backend-logging/hosting/azure':
		'/docs/getting-started/server/hosting/azure',
	'getting-started/backend-logging/hosting/fly-io':
		'/docs/getting-started/server/hosting/fly-io',
	'getting-started/backend-logging/hosting/gcp':
		'/docs/getting-started/server/hosting/gcp',
	'getting-started/backend-logging/hosting/heroku':
		'/docs/getting-started/server/hosting/heroku',
	'getting-started/backend-logging/hosting/render':
		'/docs/getting-started/server/hosting/render',
	'getting-started/backend-logging/hosting/trigger':
		'/docs/getting-started/server/hosting/trigger',
	'getting-started/backend-logging/hosting/vercel':
		'/docs/getting-started/server/hosting/vercel',
	'getting-started/backend-sdk/elixir': '/docs/getting-started/server/elixir',
	'getting-started/backend-logging/elixir':
		'/docs/getting-started/server/elixir',
	'getting-started/backend-sdk/elixir/overview':
		'/docs/getting-started/server/elixir/overview',
	'getting-started/backend-logging/elixir/overview':
		'/docs/getting-started/server/elixir/overview',
	'getting-started/backend-sdk/elixir/other':
		'/docs/getting-started/server/elixir/other',
	'getting-started/backend-logging/elixir/other':
		'/docs/getting-started/server/elixir/other',
	'getting-started/backend-tracing/serverless/aws-lambda':
		'/docs/getting-started/server/serverless/aws-lambda',
	'getting-started/backend-sdk/dotnet': '/docs/getting-started/server/dotnet',
	'getting-started/backend-logging/dotnet':
		'/docs/getting-started/server/dotnet',
	'getting-started/backend-tracing/dotnet':
		'/docs/getting-started/server/dotnet',
	'getting-started/backend-sdk/dotnet-4':
		'/docs/getting-started/server/dotnet-4',
	'getting-started/backend-logging/dotnet-4':
		'/docs/getting-started/server/dotnet-4',
	'getting-started/backend-tracing/dotnet-4':
		'/docs/getting-started/server/dotnet-4',
	'getting-started/backend-logging/docker':
		'/docs/getting-started/server/docker',
	'getting-started/backend-logging/file': '/docs/getting-started/server/file',
	'getting-started/backend-logging/fluent-forward':
		'/docs/getting-started/server/fluent-forward',
	'getting-started/backend-logging/http': '/docs/getting-started/server/http',
	'getting-started/backend-logging/otlp': '/docs/getting-started/server/otlp',
	'getting-started/backend-logging/syslog':
		'/docs/getting-started/server/syslog',
	'getting-started/backend-logging/systemd':
		'/docs/getting-started/server/systemd',
}

export default async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl
	const hostname = req.headers.get('host')
	for (const [k, v] of Object.entries(SUBDOMAIN_LANDING_PAGES)) {
		if (hostname?.startsWith(`${k}.`)) {
			if (pathname === '/') {
				let url = req.nextUrl.origin || 'https://highlight.io/'
				url = url.replace(/\/+$/, '')
				return NextResponse.rewrite(`${url}${v}`)
			}
		}
	}
	if (pathname.startsWith('/docs/')) {
		for (const [k, v] of Object.entries(DOCS_REDIRECTS)) {
			if (pathname === `/docs/${k}`) {
				let url = req.nextUrl.origin || 'https://highlight.io/'
				url = url.replace(/\/+$/, '')
				return NextResponse.redirect(`${url}${v}`, { status: 302 })
			}
		}
	}

	await highlightMiddleware(req)
	return NextResponse.next()
}
