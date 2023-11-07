type Props = {
	searchParams: { error?: string }
}

export default function SsrPage({ searchParams }: Props) {
	if (searchParams.error) {
		throw new Error('🎉 SSR Error: src/app-router/ssr/page.tsx')
	}

	return (
		<div>
			<h1>App Router SSR: Success</h1>
			<p>The random number is {Math.random()}</p>
			<p>The date is {new Date().toLocaleTimeString()}</p>
		</div>
	)
}

export const revalidate = 30 // seconds
