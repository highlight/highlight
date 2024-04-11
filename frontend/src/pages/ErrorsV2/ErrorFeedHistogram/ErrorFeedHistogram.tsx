import { Series } from '@components/Histogram/Histogram'
import { SearchResultsHistogram } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import { useGetErrorsHistogramQuery } from '@graph/hooks'
import { useParams } from '@util/react-router/useParams'
import { roundFeedDate } from '@util/time'
import React from 'react'

import { DateHistogramBucketSize } from '@/graph/generated/schemas'

export const ErrorFeedHistogram: React.FC<{
	query: string
	readonly?: boolean
	histogramBucketSize: DateHistogramBucketSize
	startDate: Date
	endDate: Date
	updateSearchTime: (start: Date, end: Date) => void
}> = React.memo(
	({
		query,
		readonly,
		histogramBucketSize,
		startDate,
		endDate,
		updateSearchTime,
	}) => {
		const { project_id } = useParams<{ project_id: string }>()

		const { loading, data } = useGetErrorsHistogramQuery({
			variables: {
				params: {
					query,
					date_range: {
						start_date: roundFeedDate(
							startDate.toISOString() ?? null,
						).format(),
						end_date: roundFeedDate(
							endDate.toISOString() ?? null,
						).format(),
					},
				},
				project_id: project_id!,
				histogram_options: {
					bucket_size: histogramBucketSize,
					time_zone:
						Intl.DateTimeFormat().resolvedOptions().timeZone ??
						'UTC',
					bounds: {
						start_date: roundFeedDate(
							startDate.toISOString() ?? null,
						).format(),
						end_date: roundFeedDate(
							endDate.toISOString() ?? null,
						).format(),
					},
				},
			},
			skip: !histogramBucketSize || !project_id,
			fetchPolicy: 'network-only',
		})

		const histogram: {
			seriesList: Series[]
			bucketTimes: number[]
		} = {
			seriesList: [],
			bucketTimes: [],
		}
		if (data?.errors_histogram) {
			histogram.bucketTimes = data?.errors_histogram.bucket_times.map(
				(startTime) => new Date(startTime).valueOf(),
			)
			histogram.seriesList = [
				{
					label: 'errors',
					color: 'n9',
					counts: data?.errors_histogram.error_objects,
				},
			]
		}

		return (
			<SearchResultsHistogram
				seriesList={histogram.seriesList}
				bucketTimes={histogram.bucketTimes}
				bucketSize={histogramBucketSize}
				loading={loading}
				updateTimeRange={updateSearchTime}
				barGap={2.4}
				readonly={readonly}
			/>
		)
	},
)
