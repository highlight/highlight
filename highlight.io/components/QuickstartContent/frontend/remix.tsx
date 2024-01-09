import {
	identifyingUsersLink,
	sessionSearchLink,
	verifySnippet,
} from './shared-snippets'

import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

const GUIDE_URL = siteUrl('/docs/getting-started/fullstack-frameworks/remix')

export const RemixContent: QuickStartContent = {
	title: 'Remix',
	subtitle: 'Learn how to set up highlight.io with your Remix application.',
	logoUrl: siteUrl('/images/quickstart/remix.png'),
	entries: [
		{
			title: 'Install the npm package & SDK.',
			content:
				'Install the `@highlight-run/remix` npm package in your terminal.',
			code: [
				{
					key: 'npm',
					text: `
# with npm
npm install @highlight-run/remix
					`,
					language: 'bash',
				},
				{
					key: 'yarn',
					text: `
# with yarn
yarn add @highlight-run/remix
				`,
					language: 'bash',
				},
				{
					key: 'pnpm',
					text: `
# with pnpm
pnpm add @highlight-run/remix
				`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Initialize the client SDK.',
			content: `Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), inject it into your client application using the \`loader\` export from your \`root.tsx\` file, and set the \`projectID\` in the \`<HighlightInit/>\` component.
			`,
			code: [
				{
					text: `
// app/root.tsx
import { useLoaderData } from '@remix-run/react'

import { HighlightInit } from '@highlight-run/remix/client'
import { json } from '@remix-run/node'


export async function loader() {
	return json({
		ENV: {
			HIGHLIGHT_PROJECT_ID: process.env.HIGHLIGHT_PROJECT_ID,
		},
	})
}

export default function App() {
	const { ENV } = useLoaderData()

	return (
		<html lang="en">
			<HighlightInit
				projectId={ENV.HIGHLIGHT_PROJECT_ID}
				serviceName="my-remix-frontend"
				tracingOrigins
				networkRecording={{ enabled: true, recordHeadersAndBody: true }}
			/>

			{/* Render head, body, <Outlet />, etc. */}
		</html>
	)
}
				`,
					language: 'js',
				},
			],
		},
		{
			title: 'Export a custom ErrorBoundary handler (optional)',
			content: `The \`ErrorBoundary\` component wraps your component tree and catches crashes/exceptions from your react app. When a crash happens, your users will be prompted with a modal to share details about what led up to the crash. Read more [here](${siteUrl(
				'/docs/getting-started/client-sdk/replay-configuration',
			)}).`,
			code: [
				{
					text: `
// app/components/error-boundary.tsx
import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import { ReportDialog } from '@highlight-run/remix/report-dialog'

export function ErrorBoundary() {
	const error = useRouteError()

	if (isRouteErrorResponse(error)) {
		return (
			<div>
				<h1>
					{error.status} {error.statusText}
				</h1>
				<p>{error.data}</p>
			</div>
		)
	} else if (error instanceof Error) {
		return (
			<div>
				<script src="https://unpkg.com/highlight.run"></script>
				<script
					dangerouslySetInnerHTML={{
						__html: \`
							H.init('\${process.env.HIGHLIGHT_PROJECT_ID}');
						\`,
					}}
				/>
				<h1>Error</h1>
				<p>{error.message}</p>
				<p>The stack trace is:</p>
				<pre>{error.stack}</pre>

				<ReportDialog />
			</div>
		)
	} else {
		return <h1>Unknown Error</h1>
	}
}
			`,
					language: 'js',
				},
				{
					text: `
// app/root.tsx
export { ErrorBoundary } from '~/components/error-boundary'
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
import { H } from '@highlight-run/remix/client';

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
		{
			title: 'Initialize the server SDK.',
			content: `Send errors to Highlight from your Remix server using the \`entry.server.tsx\` file.`,
			code: [
				{
					text: `
// app/entry.server.tsx
import { H, HandleError } from '@highlight-run/remix/server'

const nodeOptions = { projectID: process.env.HIGHLIGHT_PROJECT_ID }

export const handleError = HandleError(nodeOptions)

// Handle server requests				
				`,
					language: 'js',
				},
			],
		},
		verifySnippet,
		{
			title: 'More Remix features?',
			content: `See our [fullstack Remix guide](${GUIDE_URL}) for more information on how to use Highlight with Remix.`,
		},
	],
}
