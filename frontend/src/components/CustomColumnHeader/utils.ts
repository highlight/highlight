export const convertToPixels = (size: string, rowWidth?: number): string => {
	if (!!rowWidth && size.includes('%')) {
		return `${(parseFloat(size) / 100) * rowWidth}px`
	}
	// px and fr
	return size
}
