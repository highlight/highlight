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
	'backend-sdk': '/docs/getting-started/4_backend-sdk',
	'clearbit-integration': '/docs/integrations/clearbit-integration',
	'client-sdk': '/docs/getting-started/client-sdk',
	'console-messages': '/docs/session-replay/console-messages',
	'content-security-policy': '/docs/tips/content-security-policy',
	'electron-integration': '/docs/integrations/electron-integration',
	'error-monitoring/sourcemaps':
		'/docs/general/product-features/error-monitoring/sourcemaps',
	'express-backend': '/docs/getting-started/4_backend-sdk/nextjs',
	'front-plugin': '/docs/integrations/front-plugin',
	'frontend-observability':
		'/docs/getting-started/overview#For-your-Frontend',
	'general/getting-started/client-sdk/nextjs':
		'/docs/getting-started/client-sdk/nextjs',
	'general/product-features/frontend-observability':
		'/docs/getting-started/overview#For-your-Frontend',
	'general/product-features/session-replay/canvas':
		'/docs/getting-started/client-sdk/replay-configuration/canvas',
	'go-backend': '/docs/getting-started/4_backend-sdk/go',
	'grouping-errors': '/docs/error-monitoring/grouping-errors',
	'html-iframe-recording': '/docs/session-replay/html-iframe-recording',
	'identifying-users': '/docs/session-replay/identifying-sessions',
	'integrations/amplitude-integration':
		'/docs/general/integrations/amplitude-integration',
	'integrations/mixpanel-integration':
		'/docs/general/integrations/mixpanel-integration',
	'integrations/reactjs-integration':
		'/docs/getting-started/client-sdk/replay-configuration/react-error-boundary',
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
	'nextjs-backend': '/docs/getting-started/4_backend-sdk/express',
	'nextjs-sdk': '/docs/getting-started/4_backend-sdk/nextjs',
	'nodejs-backend': '/docs/getting-started/4_backend-sdk/nodejs',
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
		'/docs/getting-started/client-sdk/replay-configuration/proxying-highlight',
	'rage-clicks': '/docs/session-replay/rage-clicks',
	'reactjs-integration':
		'/docs/getting-started/client-sdk/replay-configuration/react-error-boundary',
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
		'/docs/getting-started/client-sdk/replay-configuration/proxying-highlight',
	'tracking-events': '/docs/session-replay/tracking-events',
	'upgrading-highlight': '/docs/tips/upgrading-highlight',
	'user-feedback': '/docs/product-features/user-feedback',
	'vercel-integration': '/docs/integrations/vercel-integration',
	'versioning-errors': '/docs/error-monitoring/versioning-errors',
	'versioning-sessions': '/docs/session-replay/versioning-sessions',
	'web-vitals': '/docs/product-features/web-vitals',
	alerts: '/docs/product-features/alerts',
	analytics: '/docs/product-features/analytics',
	angular: '/docs/getting-started/client-sdk/angular',
	api: '/docs/sdk/client#Hinit',
	canvas: '/docs/getting-started/client-sdk/replay-configuration/canvas',
	comments: '/docs/product-features/comments',
	environments: '/docs/product-features/environments',
	gatsbyjs: '/docs/getting-started/client-sdk/gatsbyjs',
	html: '/docs/getting-started/client-sdk/html',
	metrics:
		'/docs/getting-started/fullstack-frameworks/next-js/metrics-overview',
	nextjs: '/docs/getting-started/client-sdk/nextjs',
	other: '/docs/getting-started/client-sdk/other',
	privacy: '/docs/session-replay/privacy',
	segments: '/docs/product-features/segments',
	shopify: '/docs/getting-started/client-sdk/shopify',
	sourcemaps: '/docs/error-monitoring/sourcemaps',
	squarespace: '/docs/getting-started/client-sdk/squarespace',
	sveltekit: '/docs/getting-started/client-sdk/sveltekit',
	troubleshooting: '/docs/tips/troubleshooting',
	vuejs: '/docs/getting-started/client-sdk/vuejs',
	webflow: '/docs/getting-started/client-sdk/webflow',
	webgl: '/docs/product-features/webgl',
	wordpress: '/docs/getting-started/client-sdk/wordpress',
}

export default function middleware(req: NextRequest) {
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

	highlightMiddleware(req)
	return NextResponse.next()
}
