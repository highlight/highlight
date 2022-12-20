export const formatNumber = (n: number, decimals = 1) => {
	if (n == 0) return '0'
	const k = 1000
	const sizes = ['', 'K', 'M', 'B', 'T']
	const i = Math.min(Math.floor(Math.log(n) / Math.log(k)), sizes.length)
	const res = n / Math.pow(k, i)
	const dm = res >= 10 || decimals < 0 ? 0 : decimals

	return parseFloat(res.toFixed(dm)) + sizes[i]
}

export const formatNumberWithDelimiters = (number?: number) => {
	if (!number) {
		return number
	}
	return number.toLocaleString(
		undefined, // leave undefined to use the visitor's browser
		// locale or a string like 'en-US' to override it.
		{ minimumFractionDigits: 0 },
	)
}

export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value))
}

export function range(start: number, end: number, step?: number) {
	const $step = step ?? 1
	const length = Math.floor((end - start) / $step)
	return Array.from({ length }, (_, idx) => idx * $step + start)
}
