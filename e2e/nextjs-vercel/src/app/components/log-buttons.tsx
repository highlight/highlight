'use client'

import { Button } from '@/app/components/button'

export function LogButtons() {
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
				onClick={() =>
					console.log('You clicked the console.log button!')
				}
			>
				console.log
			</Button>

			<Button
				onClick={() =>
					console.info('You clicked the console.info button!')
				}
			>
				console.info
			</Button>

			<Button
				onClick={() =>
					console.warn('You clicked the console.warn button!')
				}
			>
				console.warn
			</Button>
		</div>
	)
}
