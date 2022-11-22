import moment, { unitOfTime } from 'moment'

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

export const isAbsoluteTimeRange = (value?: string): boolean => {
	return !!value && value.includes('_')
}

export const getAbsoluteStartTime = (value?: string): string | null => {
	if (!value) return null
	if (!isAbsoluteTimeRange(value)) {
		// value is a relative duration such as '7 days', subtract it from current time
		const amount = parseInt(value.split(' ')[0])
		const unit = value.split(' ')[1].toLowerCase()
		return moment()
			.subtract(amount, unit as unitOfTime.DurationConstructor)
			.toISOString()
	}
	return value!.split('_')[0]
}
export const getAbsoluteEndTime = (value?: string): string | null => {
	if (!value) return null
	if (!isAbsoluteTimeRange(value)) {
		// value is a relative duration such as '7 days', use current time as end of range
		return moment().toISOString()
	}
	return value!.split('_')[1]
}

export const displayDate = (value: string): string => {
	if (!value.includes('_')) {
		// Value is a duration such as '7 days'
		return 'Last ' + value
	}
	const split = value.split('_')
	const start = split[0]
	const end = split[1]
	const startStr = moment(start).format('MMM D h:mm a')
	const endStr = moment(end).format('MMM D h:mm a')
	return `${startStr} to ${endStr}`
}

export const displayTime = (value: string): string => {
	const split = value.split('_')
	const start = Number(split[0])
	const end = Number(split[1])
	const ints = Number.isInteger(start) && Number.isInteger(end)
	return ints
		? `${start} and ${end} minutes`
		: `${start * 60} and ${end * 60} seconds`
}
