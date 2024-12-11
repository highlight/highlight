import { HighlightOptions, H as localH } from 'highlight.run'
import Cookies from 'js-cookie'
import { useEffect } from 'react'
import getConfig from 'next/config'

export { ErrorBoundary } from '@highlight-run/react'
export { localH as H }

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

		if (shouldRender) {
			let highlightInitOptions = { ...highlightOptions }

			const { configureHighlightProxy } = getConfig()
			if (configureHighlightProxy) {
				highlightInitOptions = {
					...highlightOptions,
					backendUrl: '/highlight-events',
				}
			}

			const { sessionSecureID } = localH.init(
				projectId,
				highlightInitOptions,
			) || { sessionSecureID: '' }

			if (sessionSecureID) {
				Cookies.set('sessionSecureID', sessionSecureID)
			}
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	return null
}
