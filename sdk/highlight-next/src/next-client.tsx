import { useEffect } from 'react'
import { H, HighlightOptions } from 'highlight.run'

export { H } from 'highlight.run'
export { ErrorBoundary } from '@highlight-run/react'

export interface Props extends HighlightOptions {
	excludedHostnames?: string[]
	projectId?: string
}

export function HighlightInit({
	excludedHostnames = [],
	projectId,
	...highlightOptions
}: Props) {
	useEffect(() => {
		const shouldRender =
			projectId &&
			excludedHostnames.every(
				(hostname) => !window.location.hostname.includes(hostname),
			)

		shouldRender && H.init(projectId, highlightOptions)
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return null
}
