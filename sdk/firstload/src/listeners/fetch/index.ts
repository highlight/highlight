import type { HighlightFetchWindow } from '@highlight-run/client/src/listeners/network-listener/utils/fetch-listener'
import type { HighlightPublicInterface } from '@highlight-run/client/src/types/types'

type HighlightWindow = Window & {
	H: HighlightPublicInterface
} & HighlightFetchWindow

declare var window: HighlightWindow

export const initializeFetchListener = () => {
	if (!(typeof window === 'undefined' || typeof document === 'undefined')) {
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
