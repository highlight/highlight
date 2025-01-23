import logger from '@/highlight.logger'
import { redirect } from 'next/navigation'

type Props = {
	searchParams: Promise<{ shouldRedirect?: boolean }>
}

export default async function RedirectPage({ searchParams }: Props) {
	logger.info({}, `redirect page`)

	if ((await searchParams).shouldRedirect) {
		return redirect(`/ssr`)
	}

	return (
		<div>
			<h1>App Router: No Redirect</h1>
		</div>
	)
}
