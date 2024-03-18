import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'

import { CONSTANTS } from './constants.js'
import { HighlightInit } from '@highlight-run/remix/client'
import type { LinksFunction } from '@remix-run/node'
import { cssBundleHref } from '@remix-run/css-bundle'
import { json } from '@remix-run/node'

export { ErrorBoundary } from './components/error-boundary.js'

export const links: LinksFunction = () => [
	...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

export async function loader() {
	return json({
		ENV: {
			HIGHLIGHT_PROJECT_ID: CONSTANTS.HIGHLIGHT_PROJECT_ID,
		},
	})
}

export default function App() {
	const { ENV } = useLoaderData()

	return (
		<html lang="en">
			<HighlightInit
				projectId={ENV.HIGHLIGHT_PROJECT_ID}
				backendUrl="http://localhost:8082/public"
				serviceName="my-remix-frontend"
				environment="e2e-test"
				tracingOrigins
				networkRecording={{ enabled: true, recordHeadersAndBody: true }}
				scriptUrl="http://localhost:8080/dist/index.js"
			/>

			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width,initial-scale=1"
				/>
				<Meta />
				<Links />
			</head>
			<body>
				<Outlet />
				<ScrollRestoration />
				<script
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(ENV)}`,
					}}
				/>
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}
