'use client'

const consoleMethods = ['log', 'info', 'warn', 'error'] as (keyof Pick<
	Console,
	'log' | 'info' | 'warn' | 'error'
>)[]

export default function ConsoleButtons() {
	return (
		<div style={{ display: 'flex', gap: '4px' }}>
			{consoleMethods.map((m) => (
				<button
					key={m}
					onClick={() => console[m](`${m} message: ${Math.random()}`)}
				>
					console.{m}()
				</button>
			))}
		</div>
	)
}
