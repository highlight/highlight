import Link from 'next/link'

export default function AnotherPage({ params }: { params: { slug: string } }) {
	return (
		<div>
			<h1>This is a route group slug page</h1>
			<p>Slug: {params?.slug}</p>
			<Link href="/">Go To Your Home</Link>
			<button
				onClick={() => {
					throw new Error('route group error')
				}}
			></button>
		</div>
	)
}
