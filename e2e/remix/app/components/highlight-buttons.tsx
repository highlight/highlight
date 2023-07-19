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

			<ThrowerOfErrors />
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
