interface ViewportResizeListenerCallback {
	height: number
	width: number
}

/**
 * Listens to when resize events on the viewport.
 * Takes the last value after DELAY ms passes. We're doing this to avoid taking the intermediate values while the user is resizing.
 */
export const ViewportResizeListener = (
	callback: (args: ViewportResizeListenerCallback) => void,
) => {
	let id: ReturnType<typeof setTimeout>
	const DELAY = 500

	const onResize = () => {
		clearTimeout(id)
		id = setTimeout(() => {
			callback({ height: window.innerHeight, width: window.innerWidth })
		}, DELAY)
	}
	window.addEventListener('resize', onResize)

	return () => window.removeEventListener('resize', onResize)
}
