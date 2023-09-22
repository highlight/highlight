'use client'

import { Button } from '@/app/components/button'
import { H } from '@highlight-run/next/client'

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
			<Button
				onClick={() => {
					H.identify('vadim@highlight.io', {
						foo: 'bar',
						host: window.location.host,
					})
				}}
			>
				Identify As Vadim
			</Button>
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
