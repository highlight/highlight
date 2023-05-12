import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	verifySnippet,
} from './shared-snippets'

import { QuickStartContent } from '../QuickstartContent'
import { siteUrl } from '../../../utils/urls'

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
				text: `
# with npm
npm install highlight.run @highlight-run/react

# with yarn
yarn add highlight.run @highlight-run/react
				`,
				language: 'bash',
			},
		},
		{
			title: 'Using the `app` dir?',
			content: `If you're using the \`app\` directory, you'll need to ensure that highlight.io gets intialized in a client-only context. See our full docs on [Next.js](${siteUrl(
				'/docs/getting-started/fullstack-frameworks/next-js',
			)}).`,
		},
		initializeSnippet,
		{
			title: 'Add the ErrorBoundary component. (optional)',
			content: `The ErrorBoundary component wraps your component tree and catches crashes/exceptions from your react app. When a crash happens, your users will be prompted with a modal to share details about what led up to the crash. Read more [here](${siteUrl(
				'/docs/getting-started/client-sdk/replay-configuration',
			)}).`,
			code: {
				text: `import { ErrorBoundary } from '@highlight-run/react';

				export default function App({ Component, pageProps }: AppProps) {
				
					// other page level logic ...
					
					return (
						<ErrorBoundary>
							<Component {...pageProps} />
						</ErrorBoundary>
					);
				}`,
				language: 'js',
			},
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(
			'/docs/getting-started/fullstack-frameworks/next-js',
		),
		{
			title: 'More Next.js features?',
			content: `With Next.js, we have an additional package (\`@highlight-run/next\`) which supports automatic sourcemap uploading, network proxying, and log destinations. Read more in our [Next.js docs](${siteUrl(
				'/docs/getting-started/fullstack-frameworks/next-js',
			)}).`,
		},
	],
}
