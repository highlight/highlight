import Histogram, { Series } from '@components/Histogram/Histogram'
import {
	DateHistogramBucketSize,
	OpenSearchCalendarInterval,
} from '@graph/schemas'
import moment from 'moment'
import React, { useCallback } from 'react'
import Skeleton from 'react-loading-skeleton'

import styles from './SearchResultsHistogram.module.css'

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

export const SearchResultsHistogram = ({
	seriesList,
	bucketTimes,
	bucketSize,
	loading,
	updateTimeRange,
}: {
	seriesList: Series[]
	bucketTimes: number[]
	bucketSize?: DateHistogramBucketSize
	loading: boolean
	updateTimeRange: (startTime: Date, endTime: Date) => void
}) => {
	const onAreaChanged = useCallback(
		(left: number, right: number) => {
			// bucketTimes should always be one longer than the number of buckets
			if (bucketTimes.length <= right + 1) return
			const newStartTime = new Date(bucketTimes[left])
			const newEndTime = new Date(bucketTimes[right + 1])
			updateTimeRange(newStartTime, newEndTime)
		},
		[bucketTimes, updateTimeRange],
	)
	const onBucketClicked = useCallback(
		(bucketIndex: number) => {
			// Only update the search query if the count is non-zero
			if (
				seriesList.find(
					(series) =>
						bucketIndex < series.counts.length &&
						series.counts[bucketIndex] > 0,
				)
			) {
				onAreaChanged(bucketIndex, bucketIndex)
			}
		},
		[onAreaChanged, seriesList],
	)
	const timeFormatter = useCallback(
		(t: number) => {
			if (
				bucketTimes.length > 0 &&
				(t === bucketTimes[bucketTimes.length - 1] ||
					t === bucketTimes[0])
			) {
				return moment(t).format('MMM D h:mm a')
			}
			switch (bucketSize?.calendar_interval) {
				case 'minute':
				case 'hour':
					return moment(t).format('MMM D h:mm a')
				case 'day':
				case 'week':
					return moment(t).format('MMMM D')
				case 'month':
				case 'quarter':
					return moment(t).format('MMMM')
				default:
					return moment(t).format('MMMM D h:mm a')
			}
		},
		[bucketTimes, bucketSize],
	)
	const tooltipContent = useCallback(
		(bucketIndex: number) => {
			const seriesTooltips = seriesList
				.filter((series: Series) => series.counts[bucketIndex] > 0)
				.map((series: Series, index: number) => (
					<div key={index} className={styles.histogramSeriesTooltip}>
						<span
							className={styles.histogramSeriesIcon}
							style={{
								background: `var(${series.color})`,
							}}
						></span>
						{series.label} x {series.counts[bucketIndex]}
					</div>
				))
			return (
				<div className={styles.histogramTooltip}>
					{seriesTooltips.length > 0 ? seriesTooltips : 'No results'}
				</div>
			)
		},
		[seriesList],
	)
	return loading ? (
		<Skeleton style={{ height: '36px', lineHeight: 'inherit' }} />
	) : (
		<Histogram
			onAreaChanged={onAreaChanged}
			onBucketClicked={onBucketClicked}
			seriesList={seriesList}
			timeFormatter={timeFormatter}
			bucketTimes={bucketTimes}
			tooltipContent={tooltipContent}
			tooltipDelayMs={500}
		/>
	)
}
