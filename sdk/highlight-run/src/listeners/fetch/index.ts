import type { HighlightFetchWindow } from '../../client'
import type { HighlightPublicInterface } from '../../client'

type HighlightWindow = Window & {
	H: HighlightPublicInterface
} & HighlightFetchWindow

declare var window: HighlightWindow

export const initializeFetchListener = () => {
	if (typeof window !== 'undefined') {
		// avoid initializing fetch listener more than once.
		if (typeof window._highlightFetchPatch !== 'undefined') {
			return
		}
		window._originalFetch = window.fetch
		window._fetchProxy = (
			input: RequestInfo,
			init: RequestInit | undefined,
		) => {
			return window._originalFetch(input, init)
		}

		window._highlightFetchPatch = (
			input: RequestInfo,
			init: RequestInit | undefined,
		) => {
			return window._fetchProxy.call(window || global, input, init)
		}

		window.fetch = window._highlightFetchPatch
	}
}
