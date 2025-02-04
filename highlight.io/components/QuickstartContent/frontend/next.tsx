import { verifySnippet } from './shared-snippets'

import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

const GUIDE_URL = siteUrl('/docs/getting-started/fullstack-frameworks/next-js')

export const NextContent: QuickStartContent = {
	title: 'Next.js',
	subtitle:
		'Learn how to set up highlight.io with your Next (frontend) application.',
	logoKey: 'nextjs',
	products: ['Sessions', 'Errors', 'Logs', 'Traces'],
	entries: [
		{
			title: 'Install the npm package & SDK.',
			content:
				'Install the npm package `@highlight-run/next` in your terminal.',
			code: [
				{
					key: 'npm',
					text: `
# with npm
npm install @highlight-run/next
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
				serviceName="my-nextjs-frontend"
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

		verifySnippet,

		{
			title: 'More Next.js features?',
			content: `See our [fullstack Next.js guide](${GUIDE_URL}) for more information on how to use Highlight with Next.js.`,
		},
	],
}
