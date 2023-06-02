'use client'

import { Button } from '@/app/components/button'
import { H } from 'highlight.run'
import ky from 'ky'

export function FetchTests() {
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '20rem',
				gridGap: '1rem',
				padding: '2rem',
			}}
		>
			<Button onClick={fireKy}>Test KY</Button>

			<Button
				onClick={() => {
					console.log('identifying', { H })
					H.identify('asdf')
				}}
			>
				H.identify
			</Button>
		</div>
	)
}

function fireKy() {
	ky.post('/api/app-directory-test?success=true', {
		headers: {
			Accept: 'application/json',
			'Content-type': 'application/json',
		},
	})
		.then((res) => res.json())
		.then((data) => console.info(data))
}
