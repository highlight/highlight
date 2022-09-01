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

// Returns a calendar interval as described in
// https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#calendar_intervals
// If multiples of these units are desired, we can have the client manually combine buckets
export function GetHistogramBucketSize(timeRange: moment.Duration): string {
	if (timeRange.asHours() < 3) {
		return 'minute'
	} else if (timeRange.asDays() < 5) {
		return 'hour'
	} else if (timeRange.asDays() < 70) {
		return 'day'
	} else if (timeRange.asDays() < 180) {
		return 'week'
	} else if (timeRange.asDays() < 365) {
		return 'month'
	} else {
		return 'quarter'
	}
}
