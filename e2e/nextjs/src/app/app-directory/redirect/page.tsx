import { redirect } from 'next/navigation'

type Props = {
	searchParams: { shouldRedirect?: boolean }
}

export default function RedirectPage({ searchParams }: Props) {
	if (searchParams.shouldRedirect) {
		return redirect(`/isr`)
	}

	return (
		<div>
			<h1>App Directory: No Redirect</h1>
		</div>
	)
}
