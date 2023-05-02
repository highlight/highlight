export default function IsrPage() {
	throw new Error(
		'App Directory ISR Error: app/app-directory/isr/error/page.tsx',
	)

	return (
		<div>
			<h1>ISR Error</h1>
			<p>If you see this, the error failed to throw.</p>
		</div>
	)
}

export const revalidate = 30 // seconds
