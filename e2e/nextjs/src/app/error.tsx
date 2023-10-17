// src/app/error.tsx
'use client' // Error components must be Client Components

import { H } from '@highlight-run/next/client'
import { useEffect } from 'react'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		H.consumeError(error) // Log the error to Highlight
	}, [error])

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
}
