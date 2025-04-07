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
					// @ts-ignore
					const flag = window.ldClient.variation(
						'my-boolean-flag',
						true,
					)
					console.log('flag', flag)
				}}
			>
				Variation
			</Button>
			<Button
				onClick={() => {
					// @ts-ignore
					window.ldClient.identify({
						kind: 'multi',
						user: { key: 'vadim' },
						org: { key: 'tester' },
					})
				}}
			>
				Identify
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
