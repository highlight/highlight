export const LAUNCHDARKLY_HOME = 'https://launchdarkly.com/'

const LAUNCHDARKLY_DOCS = 'https://launchdarkly.com/docs/'

export type LandingRedirect = {
	source: string
	destination: string
	permanent: boolean
	has?: { type: 'host'; value: string }[]
}

/**
 * Highlight docs slug -> the LaunchDarkly docs page that replaced it. A `/*`
 * suffix covers the path itself plus everything nested under it.
 *
 * Slugs are omitted on purpose when LaunchDarkly has no equivalent page (OSS
 * self-hosting, company pages, SDKs with no observability plugin). Those fall
 * through to LAUNCHDARKLY_HOME.
 */
const DOCS_TO_LAUNCHDARKLY: Record<string, string> = {
	// Docs roots
	general: 'home/observability',
	'general/welcome': 'home/observability',
	'general/getting-started': 'sdk/observability',
	'general/changelog/*': 'home/changelog',

	// Product features
	'general/product-features': 'home/observability',
	'general/product-features/session-replay/*':
		'home/observability/session-replay',
	'general/product-features/session-replay/session-search':
		'home/observability/search',
	'general/product-features/session-replay/sessions-search-deep-linking':
		'home/observability/search',
	'general/product-features/session-replay/filtering-sessions':
		'home/observability/search',
	'general/product-features/session-replay/events-and-users':
		'home/observability/product-analytics',
	'general/product-features/session-replay/canvas-iframe':
		'sdk/features/session-replay-config',
	'general/product-features/session-replay/shadow-dom-web-components':
		'sdk/features/session-replay-config',
	'general/product-features/session-replay/player-session-caching':
		'sdk/features/session-replay-config',
	'general/product-features/session-replay/performance-impact':
		'sdk/features/session-replay-config',
	'general/product-features/session-replay/request-proxying':
		'sdk/features/session-replay-config',
	'general/product-features/error-monitoring/*': 'home/observability/errors',
	'general/product-features/error-monitoring/error-search':
		'home/observability/search',
	'general/product-features/error-monitoring/filtering-errors':
		'home/observability/search',
	'general/product-features/error-monitoring/sourcemaps':
		'sdk/features/observability-errors',
	'general/product-features/error-monitoring/manually-send-errors':
		'sdk/features/observability-errors',
	'general/product-features/logging/*': 'home/observability/logs',
	'general/product-features/logging/log-alerts': 'home/observability/alerts',
	'general/product-features/logging/log-search': 'home/observability/search',
	'general/product-features/tracing/*': 'home/observability/traces',
	'general/product-features/tracing/trace-search':
		'home/observability/search',
	'general/product-features/metrics/*':
		'home/observability/observability-metrics',
	'general/product-features/dashboards/*': 'home/observability/dashboards',
	'general/product-features/dashboards/event-search':
		'home/observability/product-analytics',
	'general/product-features/general-features': 'home/observability',
	'general/product-features/general-features/overview': 'home/observability',
	'general/product-features/general-features/alerts':
		'home/observability/alerts',
	'general/product-features/general-features/webhooks':
		'home/observability/alerts',
	'general/product-features/general-features/search':
		'home/observability/search',
	'general/product-features/general-features/services':
		'home/observability/service-map',
	'general/product-features/general-features/environments':
		'home/observability/settings',

	// Integrations
	'general/integrations': 'home/observability/integrations',
	'general/integrations/overview': 'home/observability/integrations',
	'general/integrations/grafana-integration/*': 'integrations/grafana',
	'general/integrations/jira-integration': 'integrations/jira',
	'general/integrations/slack-integration': 'integrations/slack',
	'general/integrations/vercel-integration': 'home/observability/vercel',
	'general/integrations/github-integration': 'home/observability/errors',
	'general/integrations/launchdarkly-integration': 'home/observability',
	'general/integrations/electron-integration': 'sdk/observability/javascript',
	'general/integrations/nuxt-integration': 'sdk/observability/vue',

	// Getting started
	'getting-started': 'sdk/observability',
	'getting-started/overview': 'sdk/observability',
	'getting-started/frontend-backend-mapping':
		'sdk/features/observability-traces',

	// Browser SDKs
	'getting-started/browser': 'sdk/observability/javascript',
	'getting-started/browser/angular': 'sdk/observability/javascript',
	'getting-started/browser/electron': 'sdk/observability/javascript',
	'getting-started/browser/other': 'sdk/observability/javascript',
	'getting-started/browser/sveltekit': 'sdk/observability/javascript',
	'getting-started/browser/gatsbyjs': 'sdk/observability/react-web',
	'getting-started/browser/nextjs': 'sdk/observability/react-web',
	'getting-started/browser/reactjs': 'sdk/observability/react-web',
	'getting-started/browser/remix': 'sdk/observability/react-web',
	'getting-started/browser/react-native': 'sdk/observability/react-native',
	'getting-started/browser/vuejs': 'sdk/observability/vue',

	// Session replay configuration
	'getting-started/browser/replay-configuration/*':
		'sdk/features/session-replay-config',
	'getting-started/browser/replay-configuration/console-messages':
		'sdk/features/observability-logs',
	'getting-started/browser/replay-configuration/identifying-sessions':
		'home/observability/session-replay',
	'getting-started/browser/replay-configuration/opentelemetry':
		'sdk/features/opentelemetry-client-side',
	'getting-started/browser/replay-configuration/proxying-highlight':
		'sdk/features/observability-config-client-side',
	'getting-started/browser/replay-configuration/versioning-sessions-and-errors':
		'sdk/features/observability-config-client-side',
	'getting-started/browser/replay-configuration/react-error-boundary':
		'sdk/observability/react-web',
	'getting-started/browser/replay-configuration/sourcemaps':
		'sdk/features/observability-errors',
	'getting-started/browser/replay-configuration/troubleshooting':
		'sdk/features/observability-sdk-behavior',
	'getting-started/browser/replay-configuration/upgrading-highlight':
		'sdk/observability',

	// Fullstack frameworks
	'getting-started/fullstack-frameworks': 'sdk/observability',
	'getting-started/fullstack-frameworks/next-js/*':
		'sdk/observability/react-web',
	'getting-started/fullstack-frameworks/remix': 'sdk/observability/react-web',

	// Native OpenTelemetry
	'getting-started/native-opentelemetry':
		'sdk/features/opentelemetry-server-side',
	'getting-started/native-opentelemetry/overview':
		'sdk/features/opentelemetry-server-side',
	'getting-started/native-opentelemetry/browser':
		'sdk/features/opentelemetry-client-side',
	'getting-started/native-opentelemetry/error-monitoring':
		'sdk/features/observability-errors',
	'getting-started/native-opentelemetry/logging':
		'sdk/features/observability-logs',
	'getting-started/native-opentelemetry/metrics':
		'sdk/features/observability-metrics',
	'getting-started/native-opentelemetry/tracing':
		'sdk/features/observability-traces',

	// Server SDKs
	'getting-started/server': 'sdk/observability',
	'getting-started/server/go/*': 'sdk/observability/go',
	'getting-started/server/js/*': 'sdk/observability/node-js',
	'getting-started/server/python/*': 'sdk/observability/python',
	'getting-started/server/ruby/*': 'sdk/observability/ruby',
	'getting-started/server/dotnet': 'sdk/observability/dotnet',
	'getting-started/server/dotnet-4': 'sdk/observability/dotnet',

	// Log and metric ingestion
	'getting-started/server/otlp': 'sdk/features/opentelemetry-server-side',
	'getting-started/server/syslog': 'home/observability/syslog',
	'getting-started/server/fluentforward': 'home/observability/fluentbit',
	'getting-started/server/docker': 'home/observability/integrations',
	'getting-started/server/file': 'home/observability/integrations',
	'getting-started/server/http': 'home/observability/integrations',
	'getting-started/server/systemd': 'home/observability/integrations',
	'getting-started/server/hosting/*': 'home/observability/integrations',
	'getting-started/server/hosting/aws':
		'home/observability/aws-cloudwatch-metrics',
	'getting-started/server/hosting/aws-metrics':
		'home/observability/aws-cloudwatch-metrics',
	'getting-started/server/hosting/azure': 'home/observability/azure-monitor',
	'getting-started/server/hosting/vercel': 'home/observability/vercel',

	// SDK reference
	sdk: 'sdk/observability',
	'sdk/client': 'sdk/observability/javascript',
	'sdk/nextjs': 'sdk/observability/react-web',
	'sdk/cloudflare': 'sdk/observability/node-js',
	'sdk/hono': 'sdk/observability/node-js',
	'sdk/nodejs': 'sdk/observability/node-js',
	'sdk/go': 'sdk/observability/go',
	'sdk/python': 'sdk/observability/python',
	'sdk/ruby': 'sdk/observability/ruby',
}

/**
 * Legacy Highlight docs URLs -> the docs path that superseded them. Values may
 * point at another legacy path; chains are followed when composing redirects.
 */
const LEGACY_DOCS_ALIASES: Record<string, string> = {
	'amplitude-integration': '/docs/general/integrations/amplitude-integration',
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
	'general/getting-started/backend-sdk/cloudflare':
		'/docs/getting-started/backend-logging/js/cloudflare',
	'general/getting-started/backend-sdk/python':
		'/docs/getting-started/backend-logging/python/other',
	'general/product-features/frontend-observability':
		'/docs/getting-started/overview#For-your-Frontend',
	'general/product-features/session-replay/canvas':
		'/docs/getting-started/browser/replay-configuration/canvas',
	'general/product-features/session-replay/privacy':
		'/docs/getting-started/client-sdk/replay-configuration/privacy',
	'general/company/product-philosphy':
		'/docs/general/company/product-philosophy',
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
	'product-features/comments':
		'/docs/general/product-features/general-features/comments',
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
	reference: '/docs/general/welcome',
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
	wordpress: '/docs/general/integrations/wordpress-integration',
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
		'/docs/getting-started/browser/replay-configuration/overview',
	'getting-started/client-sdk/replay-configuration/canvas':
		'/docs/getting-started/browser/replay-configuration/canvas',
	'getting-started/client-sdk/replay-configuration/console-messages':
		'/docs/getting-started/browser/replay-configuration/console-messages',
	'getting-started/client-sdk/replay-configuration/content-security-policy':
		'/docs/getting-started/browser/replay-configuration/content-security-policy',
	'getting-started/client-sdk/replay-configuration/identifying-sessions':
		'/docs/getting-started/browser/replay-configuration/identifying-sessions',
	'getting-started/client-sdk/replay-configuration/iframes':
		'/docs/getting-started/browser/replay-configuration/iframes',
	'getting-started/client-sdk/replay-configuration/monkey-patches':
		'/docs/getting-started/browser/replay-configuration/monkey-patches',
	'getting-started/client-sdk/replay-configuration/opentelemetry':
		'/docs/getting-started/browser/replay-configuration/opentelemetry',
	'getting-started/client-sdk/replay-configuration/persistent-assets':
		'/docs/getting-started/browser/replay-configuration/persistent-assets',
	'getting-started/client-sdk/replay-configuration/privacy':
		'/docs/getting-started/browser/replay-configuration/privacy',
	'getting-started/client-sdk/replay-configuration/proxying-highlight':
		'/docs/getting-started/browser/replay-configuration/proxying-highlight',
	'getting-started/client-sdk/replay-configuration/react-error-boundary':
		'/docs/getting-started/browser/replay-configuration/react-error-boundary',
	'getting-started/client-sdk/replay-configuration/recording-network-requests-and-responses':
		'/docs/getting-started/browser/replay-configuration/recording-network-requests-and-responses',
	'getting-started/client-sdk/replay-configuration/recording-web-socket-events':
		'/docs/getting-started/browser/replay-configuration/recording-web-socket-events',
	'getting-started/client-sdk/replay-configuration/salesforce-lwc':
		'/docs/getting-started/browser/replay-configuration/salesforce-lwc',
	'getting-started/client-sdk/replay-configuration/session-data-export':
		'/docs/getting-started/browser/replay-configuration/session-data-export',
	'getting-started/client-sdk/replay-configuration/sourcemaps':
		'/docs/getting-started/browser/replay-configuration/sourcemaps',
	'getting-started/client-sdk/replay-configuration/tracking-events':
		'/docs/getting-started/browser/replay-configuration/tracking-events',
	'getting-started/client-sdk/replay-configuration/troubleshooting':
		'/docs/getting-started/browser/replay-configuration/troubleshooting',
	'getting-started/client-sdk/replay-configuration/upgrading-highlight':
		'/docs/getting-started/browser/replay-configuration/upgrading-highlight',
	'getting-started/client-sdk/replay-configuration/versioning-sessions-and-errors':
		'/docs/getting-started/browser/replay-configuration/versioning-sessions-and-errors',
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

const toDocsSlug = (docsPath: string) =>
	docsPath
		.split('#')[0]
		.replace(/^\/docs\/?/, '')
		.replace(/\/+$/, '')

/** Walks up the slug looking for an exact entry, then for a `/*` subtree entry. */
const matchDocsSlug = (slug: string): string | undefined => {
	if (!slug) {
		return DOCS_TO_LAUNCHDARKLY.general
	}
	if (DOCS_TO_LAUNCHDARKLY[slug]) {
		return DOCS_TO_LAUNCHDARKLY[slug]
	}
	const parts = slug.split('/')
	for (let i = parts.length; i > 0; i--) {
		const subtree = DOCS_TO_LAUNCHDARKLY[`${parts.slice(0, i).join('/')}/*`]
		if (subtree) {
			return subtree
		}
	}
	return undefined
}

/** Resolves a docs path to a LaunchDarkly docs page, following legacy aliases. */
const resolveDocsPath = (
	docsPath: string,
	seen = new Set<string>(),
): string | undefined => {
	const slug = toDocsSlug(docsPath)
	const matched = matchDocsSlug(slug)
	if (matched) {
		return matched
	}
	const alias = LEGACY_DOCS_ALIASES[slug]
	if (alias && !seen.has(slug)) {
		seen.add(slug)
		return resolveDocsPath(alias, seen)
	}
	return undefined
}

const byDepthDescending = (a: LandingRedirect, b: LandingRedirect) =>
	b.source.split('/').length - a.source.split('/').length

/**
 * Docs redirects, ordered so the most specific source wins: legacy aliases,
 * then exact slugs, then `:path*` subtrees deepest-first.
 */
const docsRedirects = (): LandingRedirect[] => {
	const exact: LandingRedirect[] = []
	const subtrees: LandingRedirect[] = []

	for (const [key, ldPath] of Object.entries(DOCS_TO_LAUNCHDARKLY)) {
		const isSubtree = key.endsWith('/*')
		const slug = isSubtree ? key.slice(0, -2) : key
		const destination = `${LAUNCHDARKLY_DOCS}${ldPath}`
		exact.push({ source: `/docs/${slug}`, destination, permanent: true })
		if (isSubtree) {
			subtrees.push({
				source: `/docs/${slug}/:path*`,
				destination,
				permanent: true,
			})
		}
	}

	const legacy = Object.keys(LEGACY_DOCS_ALIASES).flatMap((key) => {
		const ldPath = resolveDocsPath(`/docs/${key}`)
		return ldPath
			? [
					{
						source: `/docs/${key}`,
						destination: `${LAUNCHDARKLY_DOCS}${ldPath}`,
						permanent: true,
					},
				]
			: []
	})

	return [
		...legacy.sort(byDepthDescending),
		{
			source: '/docs',
			destination: `${LAUNCHDARKLY_DOCS}home/observability`,
			permanent: true,
		},
		...exact.sort(byDepthDescending),
		...subtrees.sort(byDepthDescending),
	]
}

// Public assets, API routes and Next internals must keep serving so that
// sitemap.xml and /blog/rss.xml still advertise the redirects to crawlers.
const CATCH_ALL_EXCLUDED = [
	'_next/',
	'api/',
	'images/',
	'videos/',
	'styles/',
	'favicon\\.ico',
	'robots\\.txt',
	'sitemap\\.xml',
	'blog/rss\\.xml',
].join('|')

/**
 * Every landing page redirect to LaunchDarkly, in match order. Blog and docs
 * pages go to their mapped LaunchDarkly page; everything else falls through to
 * the catch-all and lands on launchdarkly.com.
 */
export const launchDarklyRedirects = (): LandingRedirect[] => [
	...docsRedirects(),
	{
		source: '/',
		destination: `${LAUNCHDARKLY_DOCS}home/observability`,
		permanent: true,
		has: [{ type: 'host', value: 'docs.highlight.io' }],
	},
	{ source: '/', destination: LAUNCHDARKLY_HOME, permanent: true },
	{
		source: `/:path((?!${CATCH_ALL_EXCLUDED}).*)`,
		destination: LAUNCHDARKLY_HOME,
		permanent: true,
	},
]
