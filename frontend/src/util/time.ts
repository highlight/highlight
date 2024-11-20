import moment from 'moment'

export function MillisToMinutesAndSeconds(millis: number) {
	const minutes = Math.floor(millis / 60000)
	const seconds = Math.floor((millis % 60000) / 1000)
	return minutes + ':' + seconds.toString().padStart(2, '0')
}

export function MillisToMinutesAndSecondsVerbose(millis: number) {
	if (millis < 1000) {
		return `${millis} milliseconds`
	}
	const minutes = Math.floor(millis / 60000)
	const seconds = Math.floor((millis % 60000) / 1000)
	let str = ''
	if (minutes) {
		str += minutes + ' min '
	}
	return str + seconds + ' seconds'
}

export function convertMillisToHMS(millis: number) {
	let seconds = Math.floor(millis / 1000)
	let minutes = Math.floor((seconds - (seconds % 60)) / 60)
	const hours = Math.floor((minutes - (minutes % 60)) / 60)
	seconds %= 60
	minutes %= 60
	return { s: seconds, m: minutes, h: hours }
}

function padTo2Digits(num: number) {
	return num.toString().padStart(2, '0')
}

export function formatTimeAsHMS(millis: number) {
	const parts = convertMillisToHMS(millis)
	const secondsStr = padTo2Digits(parts.s)
	const minutesStr = padTo2Digits(parts.m)

	return !parts.h
		? `${parts.m}:${secondsStr}`
		: `${parts.h}:${minutesStr}:${secondsStr}`
}

export function msToHours(ms: number) {
	const h = ms / 1000 / 60 / 60
	return h < 10 / 60 ? Math.round(h * 1_000) / 1_000 : Math.round(h * 10) / 10
}

interface TimeAsAplhanumOptions {
	showDetails?: boolean
	zeroUnit?: string
}
export function formatTimeAsAlphanum(
	millis: number,
	options?: TimeAsAplhanumOptions,
) {
	const parts = convertMillisToHMS(millis)

	if (!options) {
		options = {}
	}
	const { showDetails, zeroUnit } = options

	if (parts.h && parts.m === 30 && !parts.s) {
		return `${parts.h}.5h`
	}
	return [
		parts.h && ((!parts.m && !parts.s) || !!showDetails)
			? `${parts.h}h`
			: '',
		parts.m && (!parts.s || !!showDetails) ? `${parts.m}m` : '',
		parts.s ? `${parts.s}s` : !parts.h && !parts.m ? `0${zeroUnit}` : '',
	]
		.join(' ')
		.trim()
}

export const roundFeedDate = function (date: string | null) {
	// nearest 15 seconds
	const factor = 15
	const m = moment(date || undefined)
	return moment(m.startOf('minute')).add(
		Math.round(m.seconds() / factor) * factor,
		'seconds',
	)
}

export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

/**
 * Formats milliseconds to human readable format.
 * @param {number} time in milliseconds
 **/
export const formatTime = (time: number) => {
	if (time < 1000) {
		return `${Math.round(time)} ms`
	}
	if (time < 60000) {
		return `${Math.ceil(time / 10) / 100} s`
	}
	return `${(Math.ceil(time / 60000) * 100) / 100} m`
}
