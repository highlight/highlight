import {
	configureSourcemapsCI,
	identifySnippet,
	verifySnippet,
} from './shared-snippets'

import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

const GUIDE_URL = siteUrl('/docs/getting-started/fullstack-frameworks/next-js')

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
			code: [
				{
					key: 'npm',
					text: `
# with npm
npm install @highlight-run/next highlight.run @highlight-run/react
					`,
					language: 'bash',
				},
				{
					key: 'yarn',
					text: `
# with yarn
yarn add @highlight-run/next highlight.run @highlight-run/react
				`,
					language: 'bash',
				},
				{
					key: 'pnpm',
					text: `
# with pnpm
pnpm add @highlight-run/next highlight.run @highlight-run/react
				`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Initialize the client SDK.',
			content: `Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and set it as the \`projectID\` in the \`<HighlightInit/>\` component.
			
If you're using the original Next.js Page router, drop \`<HighlightInit />\` in your \`_app.tsx\` file. For the App Router, add it to your top-level \`layout.tsx\` file.`,
			code: [
				{
					text: `
// src/app/layout.tsx
import { HighlightInit } from '@highlight-run/next/client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<HighlightInit
				projectId={'<YOUR_PROJECT_ID>'}
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true,
					urlBlocklist: [],
				}}
			/>

			<html lang="en">
				<body>{children}</body>
			</html>
		</>
	)
}
				`,
					language: 'js',
				},
			],
		},
		{
			title: 'Add the ErrorBoundary component. (optional)',
			content: `The ErrorBoundary component wraps your component tree and catches crashes/exceptions from your react app. When a crash happens, your users will be prompted with a modal to share details about what led up to the crash. Read more [here](${siteUrl(
				'/docs/getting-started/client-sdk/replay-configuration',
			)}).`,
			code: [
				{
					text: `
import { ErrorBoundary } from '@highlight-run/react';

export default function App({ Component, pageProps }: AppProps) {

	// other page level logic ...
	
	return (
		<ErrorBoundary>
			<Component {...pageProps} />
		</ErrorBoundary>
	);
}
			`,
					language: 'js',
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(`${GUIDE_URL}#test-source-maps`),
		{
			title: 'More Next.js features?',
			content: `See our [fullstack Next.js guide](${GUIDE_URL}) for more information on how to use Highlight with Next.js.`,
		},
	],
}
