import { isRouteErrorResponse, useRouteError } from '@remix-run/react'

import type { ErrorBoundaryProps } from '@highlight-run/react'

import { ReportDialog } from '@highlight-run/react'

export function ErrorBoundary({
	children,
}: Pick<ErrorBoundaryProps, 'children'>) {
	const error = useRouteError()
	const isRouteError = isRouteErrorResponse(error)

	console.log({ error, isRouteError })

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
		// TODO: This is broken. It's not compiling into Remix correctly.
		return <ReportDialog />
	} else {
		return <h1>Unknown Error</h1>
	}
}
