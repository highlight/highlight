export function isInsideElement(
	event: MouseEvent,
	element: HTMLElement | null,
) {
	if (!element) return false
	const { top, left, bottom, right } = element.getBoundingClientRect()
	const { clientX, clientY } = event
	return (
		clientX >= left &&
		clientX <= right &&
		clientY >= top &&
		clientY <= bottom
	)
}
