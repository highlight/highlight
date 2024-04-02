import { Series } from '@components/Histogram/Histogram'
import { SearchResultsHistogram } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import { useGetErrorsHistogramQuery } from '@graph/hooks'
import { DEFAULT_TIME_PRESETS } from '@highlight-run/ui/components'
import { useParams } from '@util/react-router/useParams'
import { roundFeedDate } from '@util/time'
import React from 'react'
import { useQueryParam } from 'use-query-params'

import { QueryParam } from '@/components/Search/SearchForm/SearchForm'
import { DateHistogramBucketSize } from '@/graph/generated/schemas'
import { useSearchTime } from '@/hooks/useSearchTime'

export const ErrorFeedHistogram: React.FC<{
	readonly?: boolean
	histogramBucketSize: DateHistogramBucketSize
}> = React.memo(({ readonly, histogramBucketSize }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const [query] = useQueryParam('query', QueryParam)
	const { startDate, endDate, updateSearchTime } = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: DEFAULT_TIME_PRESETS[5],
	})

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
					Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
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
})
