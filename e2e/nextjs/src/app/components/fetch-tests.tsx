'use client'

import { Button } from '@/app/components/button'
import ky from 'ky'

export function FetchTests() {
	return (
		<div style={{ padding: '2rem' }}>
			<Button onClick={fireKy}>Test KY</Button>
		</div>
	)
}

function fireKy() {
	ky.post('/api/app-router-test?success=true', {
		headers: {
			Accept: 'application/json',
			'Content-type': 'application/json',
		},
	})
		.then((res) => res.json())
		.then((data) => console.info(data))
}
