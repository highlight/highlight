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
				<Button
					onClick={async () => {
						throw new Error('an async error occurred')
					}}
				>
					Trigger promise error
				</Button>

				<hr />

				<Button
					onClick={() =>
						fetch('/api/page-router-trace')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					Page Router: Trigger Trace
				</Button>
				<Button
					onClick={() =>
						fetch('/api/app-router-trace')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					App Router: Trigger Trace
				</Button>

				<hr />

				<Button
					onClick={() =>
						fetch('/api/page-router-test?success=true')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					Pages Api (Node.js): Success
				</Button>
				<Button
					onClick={() =>
						fetch('/api/page-router-test?success=false')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					Pages Api (Node.js): Error&nbsp;&nbsp;&nbsp;
				</Button>
				<Button
					onClick={() =>
						fetch('/api/page-router-edge-test?success=true')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					Pages Api (Edge): Success
				</Button>
				<Button
					onClick={() =>
						fetch('/api/page-router-edge-test?success=false')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					Pages Api (Edge): Error&nbsp;&nbsp;&nbsp;
				</Button>

				<hr />

				<Button
					onClick={() =>
						fetch('/api/app-router-test?success=true&sql=true')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					App Router (Node.js): Success
				</Button>
				<Button
					onClick={() =>
						fetch('/api/app-router-test?success=false&sql=false')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					App Router (Node.js): Error&nbsp;&nbsp;&nbsp;
				</Button>
				<Button
					onClick={() =>
						fetch('/api/edge-test?success=true')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					App Router (Edge): Success
				</Button>
				<Button
					onClick={() =>
						fetch('/api/edge-test?success=false')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					App Router (Edge): Error&nbsp;&nbsp;&nbsp;
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
