export default function IsrPage({
	date,
	random,
}: {
	date: string
	random: number
}) {
	return (
		<div>
			<h1>ISR Lives</h1>
			<p>The random number is {random}</p>
			<p>The date is {date}</p>
		</div>
	)
}

export async function getStaticProps() {
	console.info('getStaticProps /isr/success')

	return {
		props: {
			random: Math.random(),
			date: new Date().toISOString(),
		},
		revalidate: 10, // seconds
	}
}
