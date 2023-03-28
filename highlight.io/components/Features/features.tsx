import errorMonitoringHero from '../../public/images/features/errorMonitoringHero.png'
import loggingHero from '../../public/images/features/loggingHero.png'
import sessionReplayHero from '../../public/images/features/sessionReplayHero.png'
import loggingscreenshot from '../../public/images/loggingscreenshot.png'
import monitoringscreenshot from '../../public/images/monitoringscreenshot.png'
import sessionscreenshot from '../../public/images/sessionscreenshot.png'

const sessionReplay2 = '/images/features/sessionReplay2.png'
const sessionReplay3 = '/images/landingInfoRow1.png'
const sessionReplay4 = '/images/landingInfoRow2.png'
const errorMonitoring1 = '/images/features/errorMonitoring1.png'
const errorMonitoring2 = '/images/features/errorMonitoring2.png'
const logging1 = '/images/features/logging1.png'
const logging2 = '/images/features/logging2.png'

import { StaticImageData } from 'next/image'

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
	slantedImage: StaticImageData
	regularImage: StaticImageData //For mobile and 2xl screens
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

H.init({projectID: 'YOUR_PROJECT_ID'})

const onError = (request, error) => {
  const parsed = H.parseHeaders(request.headers)
  H.consumeError(error, parsed.secureSessionId, parsed.requestId)
}

`

const pythonSnippet: string = `import highlight_io

H = highlight_io.H("YOUR_PROJECT_ID", record_logs=True)
`

export const FEATURES: { [k: string]: iFeature } = {
	'session-replay': {
		slug: 'session-replay',
		header: 'Session Replay & UX Monitoring.',
		subheader:
			'The only tool you need to monitor your frontend. Pixel-perfect video replay & comprehensive javascript monitoring.',
		docsLink: '/docs/general/product-features/session-replay/overview',
		slantedImage: sessionReplayHero,
		regularImage: sessionscreenshot,
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
				link: '/docs/getting-started/overview',
				linkText: 'Read the docs',
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
		subheader: 'Error and exception monitoring built for modern web apps.',
		docsLink: '/docs/general/product-features/error-monitoring/overview',
		slantedImage: errorMonitoringHero,
		regularImage: monitoringscreenshot,
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
				link: '/docs/getting-started/overview',
				linkText: 'Read the docs',
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
			'Search for and query the logs across your full-stack web app.',
		docsLink: '/docs/general/product-features/error-monitoring/overview',
		slantedImage: loggingHero,
		regularImage: loggingscreenshot,
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
				imgSrc: logging2,
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
				link: '/docs/getting-started/overview',
				linkText: 'Read the docs',
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
}
