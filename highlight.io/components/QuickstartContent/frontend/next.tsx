import { siteUrl } from '../../../utils/urls'
import { QuickStartContent, QuickStartStep } from '../QuickstartContent'
import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	verifySnippet,
} from './shared-snippets'

const reactErrorBoundaryLink = siteUrl(
	'/docs/getting-started/client-sdk/replay-configuration',
)

const nextJSOverviewLink = siteUrl(
	'/docs/getting-started/fullstack-frameworks/next-js/overview',
)

const next13DocsLink = siteUrl(
	'/docs/getting-started/fullstack-frameworks/next-js/next-13-considerations',
)

export const nextBackendSnippet: QuickStartStep = {
	title: 'More Next.js features?',
	content: `With Next.js, we support automatic sourcemap uploading, network proxying, and log destinations. Read more in our Next.js [overview guide](${nextJSOverviewLink}).`,
}

export const next13Snippet: QuickStartStep = {
	title: 'Using the `app` dir?',
	content: `If you're using the \`app\` directory, you'll need to ensure that highlight.io gets intialized in a client-only context. See or docs on [Next.js 13 considerations](${next13DocsLink}).`,
}

const ErrorBoundaryCodeSnippet = `import { ErrorBoundary } from '@highlight-run/react';

export default function App({ Component, pageProps }: AppProps) {

	// other page level logic ...
  
	return (
	  <ErrorBoundary>
		<Component {...pageProps} />
	  </ErrorBoundary>
	);
}`

export const NextContent: QuickStartContent = {
	title: 'Next.js',
	subtitle:
		'Learn how to set up highlight.io with your Next (frontend) application.',
	logoUrl: siteUrl('/images/quickstart/nextjs.svg'),
	entries: [
		{
			title: 'Install the npm package & SDK.',
			content:
				'Install the npm package `highlight.run` in your terminal.',
			code: {
				text: `# with npm
npm install highlight.run @highlight-run/react

# with yarn
yarn add highlight.run @highlight-run/react`,
				language: 'bash',
			},
		},
		next13Snippet,
		initializeSnippet,
		{
			title: 'Add the ErrorBoundary component. (optional)',
			content: `The ErrorBoundary component wraps your component tree and catches crashes/exceptions from your react app. When a crash happens, if \`showDialog\` is set, your users will be prompted with a modal to share details about what led up to the crash. Read more [here](${reactErrorBoundaryLink}).`,
			code: {
				text: ErrorBoundaryCodeSnippet,
				language: 'js',
			},
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(
			'/docs/getting-started/fullstack-frameworks/next-js/env-variables',
		),
		nextBackendSnippet,
	],
}
