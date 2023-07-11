import * as React from 'react'
import { useEffect } from 'react'
import * as ReactDOM from 'react-dom/client'
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
	useRouteError,
} from 'react-router-dom'
import { H } from 'highlight.run'
import { ReportDialog } from '@highlight-run/react'
import Root from './routes/root'

export async function rootAction() {
	const contact = { name: 'hello' }
	if (Math.random() < 0.5) {
		throw new Response('', {
			status: 404,
			statusText: 'Not Found',
		})
	}
	return { contact }
}

export async function rootLoader({ params }) {
	const contact = { name: 'hello' }
	if (Math.random() < 0.5) {
		throw new Response('', {
			status: 404,
			statusText: 'Not Found',
		})
	}
	return { contact }
}

export default function ErrorPage() {
	const error = useRouteError()
	console.error(error)

	useEffect(() => {
		H.consumeError(new Error(error))
	}, [error])

	return <ReportDialog />
}

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route
			path="/"
			element={<Root />}
			loader={rootLoader}
			action={rootAction}
			ErrorBoundary={ErrorPage}
		>
			<Route>
				<Route index element={<Root />} />
			</Route>
		</Route>,
	),
)

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
)
