function parseTime(val: number) {
	const days = ~~(val / 86400)
	const hours = ~~(val / 3600) - days * 24
	const minutes = ~~(val / 60) - days * 1440 - hours * 60
	const seconds = ~~val - days * 86400 - hours * 3600 - minutes * 60
	const ms = (val - ~~val) * 1000

	return {
		days,
		hours,
		minutes,
		seconds,
		ms,
	}
}

export function formatShortTime(
	timeSeconds: number,
	formats = ['d', 'h', 'm', 's'],
	space = '',
	toFixedValue?: number,
	single?: boolean,
) {
	const { days, hours, minutes, seconds, ms } = parseTime(timeSeconds)
	let t = ''

	for (const { unit, format } of [
		{ unit: days, format: 'd' },
		{ unit: hours, format: 'h' },
		{ unit: minutes, format: 'm' },
		{ unit: seconds, format: 's' },
		{ unit: ms, format: 'ms' },
	]) {
		let u = unit.toString()
		if (format === 'ms') {
			u = unit.toFixed(toFixedValue)
		}
		if (unit > 0 && formats.indexOf(format) !== -1) {
			t += `${u}${format}${space}`
			if (single) {
				break
			}
		}
	}

	if (!t) {
		return `0${formats[formats.length - 1]}`
	}
	return t
}

function formatNumber(n: number) {
	return Number(n).toFixed(0)
}

export function formatLongNumber(value: number) {
	const n = Number(value)

	if (n >= 1000000) {
		return `${(n / 1000000).toFixed(1)}m`
	}
	if (n >= 100000) {
		return `${(n / 1000).toFixed(0)}k`
	}
	if (n >= 10000) {
		return `${(n / 1000).toFixed(1)}k`
	}
	if (n >= 1000) {
		return `${(n / 1000).toFixed(2)}k`
	}

	return formatNumber(n)
}
