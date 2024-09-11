import { ReportDialog } from '@highlight-run/remix/report-dialog'
import { isRouteErrorResponse, useRouteError } from '@remix-run/react'

import { CONSTANTS } from '~/constants'

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
						__html: `
							H.init('${CONSTANTS.HIGHLIGHT_PROJECT_ID}');
						`,
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
