import { Series } from '@components/Histogram/Histogram'
import { SearchResultsHistogram } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import { useGetErrorsHistogramClickhouseQuery } from '@graph/hooks'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { useParams } from '@util/react-router/useParams'
import { roundFeedDate } from '@util/time'
import React from 'react'

const ErrorFeedHistogram: React.FC<{ readonly?: boolean }> = React.memo(
	({ readonly }) => {
		const { project_id } = useParams<{ project_id: string }>()
		const {
			searchQuery,
			startDate,
			endDate,
			histogramBucketSize,
			setSearchTime,
		} = useErrorSearchContext()
		const { loading, data } = useGetErrorsHistogramClickhouseQuery({
			variables: {
				query: JSON.parse(searchQuery),
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
		if (data?.errors_histogram_clickhouse) {
			histogram.bucketTimes =
				data?.errors_histogram_clickhouse.bucket_times.map(
					(startTime) => new Date(startTime).valueOf(),
				)
			histogram.seriesList = [
				{
					label: 'errors',
					color: 'n9',
					counts: data?.errors_histogram_clickhouse.error_objects,
				},
			]
		}

		return (
			<SearchResultsHistogram
				seriesList={histogram.seriesList}
				bucketTimes={histogram.bucketTimes}
				bucketSize={histogramBucketSize}
				loading={loading}
				updateTimeRange={setSearchTime}
				barGap={2.4}
				readonly={readonly}
			/>
		)
	},
)

export default ErrorFeedHistogram
