import { Series } from '@components/Histogram/Histogram'
import { SearchResultsHistogram } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import { useGetErrorsHistogramQuery } from '@graph/hooks'
import { DateHistogramBucketSize } from '@graph/schemas'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { useParams } from '@util/react-router/useParams'
import { roundFeedDate, serializeAbsoluteTimeRange } from '@util/time'
import React, { useCallback } from 'react'

import { updateQueriedTimeRange } from '@/components/QueryBuilder/QueryBuilder'

import { TIME_RANGE_FIELD } from '../ErrorQueryBuilder/ErrorQueryBuilder'

const ErrorFeedHistogram = React.memo(() => {
	const { project_id } = useParams<{ project_id: string }>()
	const { searchQuery, backendSearchQuery, setSearchQuery } =
		useErrorSearchContext()
	const { loading, data } = useGetErrorsHistogramQuery({
		variables: {
			query: backendSearchQuery?.childSearchQuery as string,
			clickhouse_query: JSON.parse(searchQuery),
			project_id: project_id!,
			histogram_options: {
				bucket_size:
					backendSearchQuery?.histogramBucketSize as DateHistogramBucketSize,
				time_zone:
					Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
				bounds: {
					start_date: roundFeedDate(
						backendSearchQuery?.startDate.toISOString() ?? null,
					).format(),
					end_date: roundFeedDate(
						backendSearchQuery?.endDate.toISOString() ?? null,
					).format(),
				},
			},
		},
		skip: !backendSearchQuery?.childSearchQuery || !project_id,
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

	const updateTimeRange = useCallback(
		(newStartTime: Date, newEndTime: Date) => {
			setSearchQuery((query) =>
				updateQueriedTimeRange(
					query || '',
					TIME_RANGE_FIELD,
					serializeAbsoluteTimeRange(newStartTime, newEndTime),
				),
			)
		},
		[setSearchQuery],
	)

	return (
		<SearchResultsHistogram
			seriesList={histogram.seriesList}
			bucketTimes={histogram.bucketTimes}
			bucketSize={backendSearchQuery?.histogramBucketSize}
			loading={loading}
			updateTimeRange={updateTimeRange}
			barGap={2.4}
		/>
	)
})

export default ErrorFeedHistogram
