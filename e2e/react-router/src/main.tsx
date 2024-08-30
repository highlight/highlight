import { ReportDialog } from '@highlight-run/react'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
	useRouteError,
} from 'react-router-dom'
import Root from './routes/root'

function rootAction() {
	const contact = { name: 'hello' }
	if (Math.random() < 0.5) {
		throw new Response('', {
			status: 404,
			statusText: 'Not Found',
		})
	}
	return { contact }
}

function rootLoader() {
	const contact = { name: 'hello' }
	if (Math.random() < 0.5) {
		throw new Response('', {
			status: 404,
			statusText: 'Not Found',
		})
	}
	return { contact }
}

export function ErrorPage() {
	const error = useRouteError() as { statusText: string; data: string }
	return (
		<ReportDialog error={new Error(`${error.statusText}: ${error.data}`)} />
	)
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
