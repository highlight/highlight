export default function IsrPage() {
	return (
		<div>
			<h1>ISR Error</h1>
			<p>If you see this, the error failed to throw.</p>
		</div>
	)
}

export async function getStaticProps() {
	throw new Error('ISR Error: pages/isr/error.tsx')
}
