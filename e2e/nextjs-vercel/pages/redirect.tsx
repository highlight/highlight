import { redirect } from 'next/navigation'

type Props = {
	shouldRedirect?: boolean
}
export default function RedirectPage({ shouldRedirect }: Props) {
	if (shouldRedirect) {
		return redirect(`/ssr`)
	}

	return (
		<div>
			<h1>Pages Directory: No Redirect</h1>
		</div>
	)
}

export async function getStaticProps() {
	console.info('getStaticProps pages/redirect')

	return {
		props: {
			shouldRedirect: false,
		},
		revalidate: 10, // seconds
	}
}
