export const PageVisibilityListener = (
	callback: (isTabHidden: boolean) => void,
) => {
	let hidden: string | undefined = undefined
	let visibilityChangeEventName: string | undefined = undefined

	if (typeof document.hidden !== 'undefined') {
		// Opera 12.10 and Firefox 18 and later support
		hidden = 'hidden'
		visibilityChangeEventName = 'visibilitychange'
		// @ts-expect-error
	} else if (typeof document.msHidden !== 'undefined') {
		hidden = 'msHidden'
		visibilityChangeEventName = 'msvisibilitychange'
		// @ts-expect-error
	} else if (typeof document.webkitHidden !== 'undefined') {
		hidden = 'webkitHidden'
		visibilityChangeEventName = 'webkitvisibilitychange'
	}

	if (visibilityChangeEventName === undefined) {
		return () => {}
	}
	if (hidden === undefined) {
		return () => {}
	}

	const hiddenPropertyName = hidden
	const listener = () => {
		// @ts-expect-error
		const tabState = document[hiddenPropertyName]

		if (tabState) {
			callback(true)
		} else {
			callback(false)
		}
	}

	document.addEventListener(visibilityChangeEventName, listener)

	const eventNameToRemove = visibilityChangeEventName

	return () => document.removeEventListener(eventNameToRemove, listener)
}
