import {
	verifySnippet,
	identifyingUsersLink,
	sessionSearchLink,
} from './shared-snippets'
import { jsGetSnippet } from '../server/js/shared-snippets-monitoring'
import { verifyTraces } from '../server/shared-snippets-tracing'

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
		{
			title: 'Identify users.',
			content: `Identify users after the authentication flow of your web app. We recommend doing this in a \`useEffect\` call or in any asynchronous, client-side context. \n\n\nThe first argument of \`identify\` will be searchable via the property \`identifier\`, and the second property is searchable by the key of each item in the object. \n\n\nFor more details, read about [session search](${sessionSearchLink}) or how to [identify users](${identifyingUsersLink}).`,
			code: [
				{
					text: `
		import { H } from '@highlight-run/next/client';
		
		function RenderFunction() {
		
			useEffect(() => {
				// login logic...
				
				H.identify('jay@highlight.io', {
					id: 'very-secure-id',
					phone: '867-5309',
					bestFriend: 'jenny'
				});
			}, [])
		
			return null; // Or your app's rendering code.
		}
				`,
					language: 'js',
				},
			],
		},
		verifySnippet,
		{
			title: 'Wrap your Page Router endpoints',
			content:
				'The Highlight Next.js SDK supports tracing for both Page and App Routers running in the Node.js runtime.',
			code: [
				{
					text: `import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '@/app/_utils/page-router-highlight.config'
import { H } from '@highlight-run/next/server'

export default withPageRouterHighlight(async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	return new Promise<void>(async (resolve) => {
		const { span } = H.startWithHeaders('page-router-span', {})

		console.info('Here: /pages/api/page-router-trace.ts ⌚⌚⌚')

		res.send(\`Trace sent! Check out this random number: ${Math.random()}\`)
		span.end()
		resolve()
	})
})
					`,
					language: 'js',
				},
			],
		},
		{
			title: 'Wrap your App Router endpoints',
			content:
				'The Highlight Next.js SDK supports tracing for both Page and App Routers running in the Node.js runtime.',
			code: [
				{
					text: `import { NextRequest, NextResponse } from 'next/server'
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config'
import { H } from '@highlight-run/next/server'

export const GET = withAppRouterHighlight(async function GET(
	request: NextRequest,
) {
	return new Promise(async (resolve) => {
		const { span } = H.startWithHeaders('app-router-span', {})

		console.info('Here: /pages/api/app-router-trace/route.ts ⏰⏰⏰')

		span.end()

		resolve(new Response('Success: /api/app-router-trace'))
	})
})
					`,
					language: 'js',
				},
			],
		},
		verifyTraces,
		{
			title: 'More Next.js features?',
			content: `See our [fullstack Next.js guide](${GUIDE_URL}) for more information on how to use Highlight with Next.js.`,
		},
	],
}
