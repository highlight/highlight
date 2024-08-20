import type { V2_MetaFunction } from '@remix-run/node'
import { HighlightButtons } from '~/components/highlight-buttons'

export { ErrorBoundary } from '~/components/error-boundary'

export const meta: V2_MetaFunction = () => {
	return [
		{ title: 'New Remix App' },
		{ name: 'description', content: 'Welcome to Remix!' },
	]
}

export default function Index() {
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
			<h1>Welcome to Remix</h1>

			<a
				href="https://remix.run/docs/"
				target="__blank"
				rel="noopener noreferrer"
			>
				Remix Docs
			</a>

			<HighlightButtons />

			<a href="/maybe-error?error=false">Success Route</a>
			<a href="/maybe-error?error=loader">Loader Error Route</a>
			<a href="/maybe-error?error=render">Render Error Route</a>
		</div>
	)
}
