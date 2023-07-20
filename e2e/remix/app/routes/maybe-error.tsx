import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { initHighlight } from '~/utils/init-highlight'

export async function loader({ request }: LoaderArgs) {
	initHighlight()

	const url = new URL(request.url)
	let error = url.searchParams.get('error')

	if (error === 'loader') {
		console.error('throwing loader error')
		throw new Error('loader error')
	} else {
		console.info('maybe-error success')
		return json({ error })
	}
}

export default function MaybeError() {
	const { error } = useLoaderData()

	if (error === 'render') {
		console.error('throwing render error')
		throw new Error('render error')
	}

	return (
		<div
			style={{
				fontFamily: 'system-ui, sans-serif',
				lineHeight: '1.8',
				display: 'flex',
				flexDirection: 'column',
				gap: '2rem',
			}}
		>
			<h1>Maybe Error</h1>

			<a href="/">Back</a>

			<h2>Success!</h2>
		</div>
	)
}
