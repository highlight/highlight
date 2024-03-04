import { H } from '@highlight-run/remix/client'
import { useEffect, useState } from 'react'

export function HighlightButtons() {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '2rem',
				width: '15rem',
			}}
		>
			<button
				onClick={() => {
					throw new Error('client-side error')
				}}
			>
				Throw client-side error
			</button>

			<button
				onClick={() => {
					console.log('Remix console.log test')
				}}
			>
				Test console.log
			</button>

			<ThrowerOfErrors />

			<hr />

			<button
				onClick={() => {
					H.identify('chris.esplin@highlight.io', { userId: 1 })
				}}
			>
				Identify
			</button>

			<button
				onClick={() => {
					H.track('test H.track', { attribute: 'hello world' })
				}}
			>
				Track
			</button>
		</div>
	)
}

function ThrowerOfErrors() {
	const [isErrored, setIsErrored] = useState(false)

	useEffect(() => {
		if (isErrored) {
			setIsErrored(false)
			throw new Error('Threw useEffect error')
		}
	}, [isErrored, setIsErrored])

	return (
		<button onClick={() => setIsErrored(true)}>
			Trigger error boundary
		</button>
	)
}
