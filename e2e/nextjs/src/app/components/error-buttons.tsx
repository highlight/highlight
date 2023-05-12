'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/app/components/button'
import { ErrorBoundary } from '@/app/components/error-boundary'

export function ErrorButtons() {
	const [isErrored, setIsErrored] = useState(false)

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '20rem',
				gridGap: '1rem',
				padding: '2rem',
			}}
		>
			<ErrorBoundary>
				<Button
					onClick={() => {
						throw new Error('Threw client-side Error')
					}}
				>
					Throw client-side onClick error
				</Button>

				<ThrowerOfErrors
					isErrored={isErrored}
					setIsErrored={setIsErrored}
				/>
				<Button onClick={() => setIsErrored(true)}>
					Trigger error boundary
				</Button>

				<hr />

				<Button
					onClick={() =>
						fetch('/api/test?success=true')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					Pages Api: Success
				</Button>

				<Button
					onClick={() =>
						fetch('/api/test?success=false')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					Pages Api: Error&nbsp;&nbsp;&nbsp;
				</Button>

				<hr />

				<Button
					onClick={() =>
						fetch('/api/app-directory-test?success=true')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					App Directory: Success
				</Button>

				<Button
					onClick={() =>
						fetch('/api/app-directory-test?success=false')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					App Directory: Error&nbsp;&nbsp;&nbsp;
				</Button>
			</ErrorBoundary>
		</div>
	)
}

function ThrowerOfErrors({
	isErrored,
	setIsErrored,
}: {
	isErrored: boolean
	setIsErrored: (isErrored: boolean) => void
}) {
	useEffect(() => {
		if (isErrored) {
			setIsErrored(false)
			throw new Error('Threw useEffect error')
		}
	}, [isErrored, setIsErrored])

	return null
}
