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

export const serializeAbsoluteTimeRange = (
	start: Date | undefined,
	end: Date | undefined,
) => {
	const startIso = moment(start).toISOString()
	const endIso = moment(end).toISOString()
	return `${startIso}_${endIso}`
}

export const roundDateToMinute = function (date: string | null) {
	return moment(moment(date || undefined).format('MM/DD/YYYY HH:mm'))
}

export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))
