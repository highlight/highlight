'use client'

import { Button } from '@/app/components/button'
import { H } from 'highlight.run'

export function HighlightButtons() {
	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '20rem',
				gridGap: '1rem',
				padding: '2rem',
			}}
		>
			<Butto
				onClick={() => {
					H.identify('vadim@highlight.io', { foo: 'bar' })
				}}
			>
				Identify
			</Butto>
			<Button
				onClick={() => {
					H.track('clicked track event', { random: Math.random() })
				}}
			>
				Track
			</Button>
		</div>
	)
}
