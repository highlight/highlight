'use client'

import { Button } from '@/app/components/button'
import { ErrorBoundary } from '@/app/components/error-boundary'

export function ErrorButtons() {
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
					Throw client-side error
				</Button>

				<hr />

				<Button
					onClick={() =>
						fetch('/api/success')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					Pages Api: Success
				</Button>

				<Button
					onClick={() =>
						fetch('/api/error')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					Pages Api: Error&nbsp;&nbsp;&nbsp;
				</Button>

				<hr />

				<Button
					onClick={() =>
						fetch('/api/app-directory-success')
							.then((res) => res.text())
							.then((data) => console.log(data))
					}
				>
					App Directory: Success
				</Button>

				<Button
					onClick={() =>
						fetch('/api/app-directory-error')
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
