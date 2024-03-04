// src/app/error.tsx
'use client' // Error components must be Client Components

import {
	AppRouterErrorProps,
	appRouterSsrErrorHandler,
} from '@highlight-run/next/ssr'

export default appRouterSsrErrorHandler(
	({ error, reset }: AppRouterErrorProps) => {
		console.error(error)

		return (
			<div>
				<h2>Something went wrong!</h2>
				<button
					onClick={
						() => reset() // Attempt to recover by trying to re-render the segment
					}
				>
					Try again
				</button>
			</div>
		)
	},
)
