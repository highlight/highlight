import {
	DateHistogramBucketSize,
	OpenSearchCalendarInterval,
} from '@graph/schemas'
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
export function GetHistogramBucketSize(
	timeRange: moment.Duration,
): DateHistogramBucketSize {
	const TARGET_BUCKETS = 35 // Return as many buckets as possible, up to TARGET_BUCKETS
	const POSSIBLE_BUCKET_SIZES: DateHistogramBucketSize[] = [
		{
			calendar_interval: OpenSearchCalendarInterval.Minute,
			multiple: 1,
		},
		{
			calendar_interval: OpenSearchCalendarInterval.Minute,
			multiple: 5,
		},
		{
			calendar_interval: OpenSearchCalendarInterval.Minute,
			multiple: 10,
		},
		{
			calendar_interval: OpenSearchCalendarInterval.Minute,
			multiple: 30,
		},
		{
			calendar_interval: OpenSearchCalendarInterval.Hour,
			multiple: 1,
		},
		{
			calendar_interval: OpenSearchCalendarInterval.Hour,
			multiple: 3,
		},
		{
			calendar_interval: OpenSearchCalendarInterval.Hour,
			multiple: 12,
		},
		{
			calendar_interval: OpenSearchCalendarInterval.Day,
			multiple: 1,
		},
		{
			calendar_interval: OpenSearchCalendarInterval.Week,
			multiple: 1,
		},
		{
			calendar_interval: OpenSearchCalendarInterval.Month,
			multiple: 1,
		},
		{
			calendar_interval: OpenSearchCalendarInterval.Quarter,
			multiple: 1,
		},
	]
	for (const bucketSize of POSSIBLE_BUCKET_SIZES) {
		let numCalendarIntervals = Number.MAX_VALUE
		switch (bucketSize.calendar_interval) {
			case OpenSearchCalendarInterval.Minute:
				numCalendarIntervals = timeRange.asMinutes()
				break
			case OpenSearchCalendarInterval.Hour:
				numCalendarIntervals = timeRange.asHours()
				break
			case OpenSearchCalendarInterval.Day:
				numCalendarIntervals = timeRange.asDays()
				break
			case OpenSearchCalendarInterval.Week:
				numCalendarIntervals = timeRange.asWeeks()
				break
			case OpenSearchCalendarInterval.Month:
				numCalendarIntervals = timeRange.asMonths()
				break
			case OpenSearchCalendarInterval.Quarter:
				numCalendarIntervals = timeRange.asMonths() / 3
				break
			case OpenSearchCalendarInterval.Year:
				numCalendarIntervals = timeRange.asYears()
				break
		}
		if (numCalendarIntervals / bucketSize.multiple <= TARGET_BUCKETS) {
			return bucketSize
		}
	}
	return POSSIBLE_BUCKET_SIZES.at(-1)!
}
