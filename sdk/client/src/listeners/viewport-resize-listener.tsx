export const ViewportResizeListener = (callback: (args: Screen) => void) => {
	let id: ReturnType<typeof setTimeout>
	const DELAY = 500

	const onResize = () => {
		clearTimeout(id)
		id = setTimeout(() => {
			callback({
				...window.screen,
				height: window.innerHeight,
				width: window.innerWidth,
			})
		}, DELAY)
	}
	window.addEventListener('resize', onResize)

	// call on initial listener creation
	onResize()
	return () => window.removeEventListener('resize', onResize)
}
