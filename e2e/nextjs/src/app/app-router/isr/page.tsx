type Props = {
	searchParams: { error?: string }
}

export default function IsrPage({ searchParams }: Props) {
	if (searchParams.error) {
		throw new Error('ISR Error: src/app-router/isr/page.tsx')
	}

	return (
		<div>
			<h1>App Directory ISR: Success</h1>
			<p>The random number is {Math.random()}</p>
			<p>The date is {new Date().toLocaleTimeString()}</p>
		</div>
	)
}

export const revalidate = 30 // seconds
