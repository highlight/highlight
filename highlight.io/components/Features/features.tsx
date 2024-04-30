export const errorMonitoringHeroKey = '/images/features/errorMonitoringHero.png'
export const loggingHeroKey = '/images/fullstack-logging.webp'
export const sessionReplayHeroKey = '/images/features/sessionReplayHero.png'
export const loggingscreenshotKey = '/images/loggingscreenshot.png'
export const monitoringscreenshotKey = '/images/monitoringscreenshot.png'
export const sessionscreenshotKey = '/images/sessionscreenshot.png'
export const tracesHeroKey = '/images/traces.png'
export const tracesscreenshotKey = '/images/tracesmobile.svg'
export const metricsMobileKey = '/images/metricsmobile.png'
export const metricsHeroKey = '/images/metricshero.webp'

const sessionReplay2 = '/images/features/sessionReplay2.png'
const sessionReplay3 = '/images/landingInfoRow1.png'
const sessionReplay4 = '/images/landingInfoRow2.png'
const errorMonitoring1 = '/images/features/errorMonitoring1.png'
const errorMonitoring2 = '/images/features/errorMonitoring2.png'
const logging1 = '/images/features/logging1.png'
const tracing1 = '/images/features/tracing1.png'
const tracing2 = '/images/features/tracing2.png'
const clickhouse = '/images/features/clickhouse.png'

const metrics1 = '/images/features/metricserrorrate.png'
const metrics2 = '/images/features/metricsengagement.png'

type InfoRow = {
	header: string
	subheader: string
	link: string
	linkText: string
	imgSrc?: string //Shows the privacy slider if null
	invert: boolean //Image on right
	code?: string
	codeFrom?: string
	privacy?: boolean
}

export interface iFeature {
	slug: string
	header: string
	subheader: string
	docsLink: string
	slantedImage: string
	regularImage: string //For mobile and 2xl screens
	header2Selection: number //GetStaticProps prevents you from passing in a component, so we pass in a number and use a switch statement to render the correct component
	subheader2: string
	infoRows?: InfoRow[]
}

const reactSnippet: string = `import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    tracingOrigins: true,
});
`

const nodeSnippet: string = `import { H } from '@highlight-run/node'

H.init({projectID: '<YOUR_PROJECT_ID>'})

const onError = (request, error) => {
  const parsed = H.parseHeaders(request.headers)
  H.consumeError(error, parsed.secureSessionId, parsed.requestId)
}

`

const pythonSnippet: string = `import highlight_io

H = highlight_io.H("<YOUR_PROJECT_ID>", instrument_logging=True)
`

const tracingSnippet: string = `H.init("<YOUR_PROJECT_ID>", {
	tracingOrigins: ['localhost', 'example.myapp.com/backend'],
    ...
});
`

export const FEATURES: { [k: string]: iFeature } = {
	'session-replay': {
		slug: 'session-replay',
		header: 'Session Replay & UX Monitoring.',
		subheader:
			'Monitor your frontend with pixel-perfect video replay & comprehensive javascript monitoring.',
		docsLink: '/docs/general/product-features/session-replay/overview',
		slantedImage: sessionReplayHeroKey,
		regularImage: sessionscreenshotKey,
		header2Selection: 0,
		subheader2:
			'Reproduce hard-to-crack issues and understand how your product is used.',
		infoRows: [
			{
				header: 'Powerful privacy controls.',
				subheader:
					'Privacy matters. Use the highlight.io SDK to obfuscate and redact data to control when and where to record.',
				link: '/docs/getting-started/client-sdk/replay-configuration/privacy',
				linkText: 'Read the Docs',
				invert: true,
				privacy: true,
			},
			{
				header: 'Reproduce the dev-tools for every session.',
				subheader:
					'Console logs, errors, network requests, and more. Get full context around the issues on your web application.',
				link: '/docs/getting-started/client-sdk/replay-configuration/overview',
				linkText: 'Read the Docs',
				imgSrc: sessionReplay2,
				invert: false,
			},
			{
				header: 'From a button click to a server-side error.',
				subheader:
					'Visualize a complete, cohesive view of your entire stack. All the way from a user clicking a button to a server-side log.',
				link: 'https://app.highlight.io/?sign_up=1',
				linkText: 'Get started for free',
				imgSrc: sessionReplay3,
				invert: true,
			},
			{
				header: 'Support for all the modern frameworks.',
				subheader:
					"Whether it's React, Angular, or even vanilla JS, we got you covered.",
				link: '/frameworks',
				linkText: 'View all frameworks',
				imgSrc: sessionReplay4,
				invert: false,
			},
			{
				header: 'A few lines of code. That’s it.',
				subheader:
					'Install highlight.io in seconds and get session replay & frontend monitoring out of the box.',
				link: '/docs/getting-started/overview',
				linkText: 'Framework Docs',
				invert: true,
				code: reactSnippet,
				codeFrom: 'React.js',
			},
		],
	},

	'error-monitoring': {
		slug: 'error-monitoring',
		header: 'Error monitoring for today’s developer.',
		subheader:
			'Error and exception monitoring built for modern web apps. Get started in seconds.',
		docsLink: '/docs/general/product-features/error-monitoring/overview',
		slantedImage: errorMonitoringHeroKey,
		regularImage: monitoringscreenshotKey,
		header2Selection: 1,
		subheader2:
			'Reproduce hard-to-crack bugs with error monitoring across your stack.',
		infoRows: [
			{
				header: 'Instant Stacktrace Enhancements.',
				subheader:
					'Enhanced stacktraces from your client and server-side errors, with optional uploading in CI.',
				link: '/docs/general/product-features/error-monitoring/sourcemaps',
				linkText: 'Read the Docs',
				imgSrc: errorMonitoring1,
				invert: true,
			},
			{
				header: 'User context from the get-go.',
				subheader:
					'Understand the actual users affected by a given error. Keep your customers happy.',
				link: '/docs/general/welcome',
				linkText: 'Read the Docs',
				imgSrc: errorMonitoring2,
				invert: false,
			},
			{
				header: 'From a “click” to a server-side error.',
				subheader:
					'Visualize a complete, cohesive view of your entire stack. All the way from a user clicking a button to a server-side error.',
				link: 'https://app.highlight.io/?sign_up=1',
				linkText: 'Get started for free',
				imgSrc: sessionReplay3,
				invert: true,
			},
			{
				header: 'Support for all the modern frameworks.',
				subheader:
					'Whether it’s React, Angular, or even vanilla JS, we got you covered. Get started with just a few lines of code.',
				link: '/frameworks',
				linkText: 'View all frameworks',
				imgSrc: sessionReplay4,
				invert: false,
			},
			{
				header: 'A few lines of code. That’s it.',
				subheader:
					'Turn on Session Replay in seconds and instantly get the visibility you need.',
				link: '/docs/getting-started/overview',
				linkText: 'Framework Docs',
				invert: true,
				code: nodeSnippet,
				codeFrom: 'Node.js',
			},
		],
	},

	logging: {
		slug: 'logging',
		header: 'Logging for modern web applications.',
		subheader:
			'Search for and query the logs across your full-stack web app. Get started in seconds.',
		docsLink: '/docs/general/product-features/logging/overview',
		slantedImage: loggingHeroKey,
		regularImage: loggingscreenshotKey,
		header2Selection: 2,
		subheader2:
			'All the tools you need to search, analyze and set alerts for your web app’s logs.',
		infoRows: [
			{
				header: 'Alerts on log patterns across your stack.',
				subheader:
					'Create log alerts by setting log patterns and thresholds for real-time logs.',
				link: '/docs/general/product-features/logging/overview',
				linkText: 'Read the Docs',
				imgSrc: logging1,
				invert: true,
			},
			{
				header: 'Powerful search. Powered by ClickHouse.',
				subheader:
					'Perform fine-grained searches across all of your logs. Powered by ClickHouse, an industry leading time-series database.',
				link: '/docs/general/product-features/logging/overview',
				linkText: 'Read the Docs',
				imgSrc: clickhouse,
				invert: false,
			},
			{
				header: 'From a “click” to a server-side error.',
				subheader:
					'Visualize a complete, cohesive view of your entire stack. All the way from a user clicking a button to a server-side error.',
				link: 'https://app.highlight.io/?sign_up=1',
				linkText: 'Get started for free',
				imgSrc: sessionReplay3,
				invert: true,
			},
			{
				header: 'Support for all the modern frameworks.',
				subheader:
					'Whether its Python, Golang, or even vanilla JS, we got you covered. Get started with just a few lines of code.',
				link: '/frameworks',
				linkText: 'View all frameworks',
				imgSrc: sessionReplay4,
				invert: false,
			},
			{
				header: 'A few lines of code. That’s it.',
				subheader:
					'Install highlight.io in seconds and get logging out of the box.',
				link: '/docs/getting-started/overview',
				linkText: 'Framework Docs',
				invert: true,
				code: pythonSnippet,
				codeFrom: 'Python',
			},
		],
	},
	traces: {
		slug: 'traces',
		header: 'Tracing for modern web applications.',
		subheader:
			'Search for and query the traces across your full-stack web app. Get started in seconds.',
		docsLink: '/docs/general/product-features/tracing/overview',
		slantedImage: tracesHeroKey,
		regularImage: tracesscreenshotKey,
		header2Selection: 3,
		subheader2:
			'Pinpoint latency across your entire codebase, all the way from the client to server.',
		infoRows: [
			{
				header: 'Dig deep into nested code execution.',
				subheader:
					'Scrutinize every layer of your codebase and identify bottlenecks, inefficiencies, and areas of optimization.',
				link: '/docs/general/product-features/tracing/overview',
				linkText: 'Read the Docs',
				imgSrc: tracing1,
				invert: true,
			},
			{
				header: 'Powerful search. Powered by ClickHouse.',
				subheader:
					'Perform fine-grained searches across all of your traces. Powered by ClickHouse, an industry leading time-series database.',
				link: '/docs/general/product-features/tracing/trace-search',
				linkText: 'Read the Docs',
				imgSrc: clickhouse,
				invert: false,
			},
			{
				header: 'From a “click” to a server-side trace.',
				subheader:
					'Visualize a complete, cohesive view of your entire stack. All the way from a user clicking a button to a server-side trace.',
				link: 'https://app.highlight.io/?sign_up=1',
				linkText: 'Get started for free',
				imgSrc: sessionReplay3,
				invert: true,
			},
			{
				header: 'Support for all the modern frameworks.',
				subheader:
					'Whether its Python, Golang, or even vanilla JS, we got you covered. Get started with just a few lines of code.',
				link: '/frameworks',
				linkText: 'View all frameworks',
				imgSrc: sessionReplay4,
				invert: false,
			},
			{
				header: 'A few lines of code. That’s it.',
				subheader:
					'Install highlight.io in seconds and get tracing out of the box.',
				link: '/docs/getting-started/overview',
				linkText: 'Framework Docs',
				invert: true,
				code: tracingSnippet,
				codeFrom: 'Python',
			},
		],
	},

	metrics: {
		slug: 'metrics',
		header: 'Metrics & APM for modern web apps',
		subheader:
			'Visualize and analyze your observability data on a single pane.',
		docsLink: '/docs/general/product-features/metrics/overview',
		slantedImage: metricsHeroKey,
		regularImage: metricsMobileKey,
		header2Selection: 4,
		subheader2:
			'A suite of tools for visualizing and manipulating data on your web application.',
		infoRows: [
			{
				header: 'From downtime to regressions.',
				subheader:
					'Understand the real reason why your web app has slow downs, increased error rates, and more.',
				link: '/docs/general/product-features/metrics/overview',
				linkText: 'Read the Docs',
				imgSrc: metrics1,
				invert: true,
			},
			{
				header: 'Understand user engagement across your application',
				subheader: 'Visualize the reason why users stay and leave.',
				link: '/docs/general/product-features/metrics/overview',
				linkText: 'Read the Docs',
				imgSrc: metrics2,
				invert: false,
			},
			{
				header: 'Insane Performance. Powered by ClickHouse.',
				subheader:
					'Perform fast queries across all of your resources. Powered by ClickHouse, an industry leading time-series database.',
				link: '/docs/general/product-features/metrics/overview',
				linkText: 'Read the Docs',
				imgSrc: clickhouse,
				invert: true,
			},
			{
				header: 'Get alerted across each resource',
				subheader:
					'Create alerts to make sure the right teams know when something goes wrong.',
				link: '/docs/general/product-features/metrics/overview',
				linkText: 'Read the Docs',
				imgSrc: logging1,
				invert: false,
			},
			{
				header: 'Support for all the modern frameworks.',
				subheader:
					"Whether it's React, Angular, or even vanilla JS, we got you covered.",
				link: '/frameworks',
				linkText: 'View all frameworks',
				imgSrc: sessionReplay4,
				invert: true,
			},
		],
	},
}
