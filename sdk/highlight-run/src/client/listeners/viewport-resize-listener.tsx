export type ViewportResizeListenerArgs = Omit<Screen, 'orientation'> & {
	orientation: number
}

export const ViewportResizeListener = (
	callback: (args: ViewportResizeListenerArgs) => void,
) => {
	let id: ReturnType<typeof setTimeout>
	const DELAY = 500

	const onResize = () => {
		clearTimeout(id)
		id = setTimeout(() => {
			callback({
				height: window.innerHeight,
				width: window.innerWidth,
				availHeight: window.screen.availHeight,
				availWidth: window.screen.availWidth,
				colorDepth: window.screen.colorDepth,
				pixelDepth: window.screen.pixelDepth,
				orientation: window.screen.orientation?.angle ?? 0,
			})
		}, DELAY)
	}
	window.addEventListener('resize', onResize)

	// call on initial listener creation
	onResize()
	return () => window.removeEventListener('resize', onResize)
}
