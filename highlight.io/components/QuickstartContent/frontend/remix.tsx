import { identifySnippet, verifySnippet } from './shared-snippets'

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
				'Install the following npm packages in your terminal: `highlight.run`,`@highlight-run/remix` and `@highlight-run/node`.',
			code: [
				{
					key: 'npm',
					text: `
# with npm
npm install @highlight-run/remix @highlight-run/node highlight.run
					`,
					language: 'bash',
				},
				{
					key: 'yarn',
					text: `
# with yarn
yarn add @highlight-run/remix @highlight-run/node highlight.run
				`,
					language: 'bash',
				},
				{
					key: 'pnpm',
					text: `
# with pnpm
pnpm add @highlight-run/remix @highlight-run/node highlight.run
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
// ./app/root.tsx
import { useLoaderData } from '@remix-run/react'

import { HighlightInit } from '@highlight-run/remix/highlight-init'
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
			title: 'Export a custom `ErrorBoundary` handler from `./app/root.tsx` (optional)',
			content: `The ErrorBoundary component wraps your component tree and catches crashes/exceptions from your react app. When a crash happens, your users will be prompted with a modal to share details about what led up to the crash. Read more [here](${siteUrl(
				'/docs/getting-started/client-sdk/replay-configuration',
			)}).`,
			code: [
				{
					text: `
// ./app/components/error-boundary.tsx
import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import { ReportDialog } from '@highlight-run/remix'

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
// ./app/root.tsx
export { ErrorBoundary } from '~/components/error-boundary'
}
			`,
					language: 'js',
				},
			],
		},
		identifySnippet,
		verifySnippet,
		{
			title: 'More Remix features?',
			content: `See our [fullstack Remix guide](${GUIDE_URL}) for more information on how to use Highlight with Remix.`,
		},
	],
}
