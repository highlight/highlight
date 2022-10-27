import { Series } from '@components/Histogram/Histogram'
import { SearchResultsHistogram } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import { useGetErrorsHistogramQuery } from '@graph/hooks'
import { DateHistogramBucketSize } from '@graph/schemas'
import { TIME_RANGE_FIELD } from '@pages/Error/components/ErrorQueryBuilder/ErrorQueryBuilder'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { updateQueriedTimeRange } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder'
import { useParams } from '@util/react-router/useParams'
import { serializeAbsoluteTimeRange } from '@util/time'
import { useCallback, useState } from 'react'

interface Props {
	useCachedErrors?: boolean
}
const ErrorFeedHistogram = ({ useCachedErrors }: Props) => {
	const { project_id: projectId } = useParams<{ project_id: string }>()
	const { backendSearchQuery, searchParams, setSearchParams } =
		useErrorSearchContext()
	const [histogram, setHistogram] = useState<{
		seriesList: Series[]
		bucketTimes: number[]
	}>({
		seriesList: [],
		bucketTimes: [],
	})
	const { loading } = useGetErrorsHistogramQuery({
		variables: {
			query: backendSearchQuery?.childSearchQuery as string,
			project_id: projectId,
			histogram_options: {
				bucket_size:
					backendSearchQuery?.histogramBucketSize as DateHistogramBucketSize,
				time_zone:
					Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
				bounds: {
					start_date:
						backendSearchQuery?.startDate.toISOString() as string,
					end_date:
						backendSearchQuery?.endDate.toISOString() as string,
				},
			},
		},
		onCompleted: (r) => {
			let seriesList: Series[] = []
			let bucketTimes: number[] = []
			const histogramData = r?.errors_histogram
			if (backendSearchQuery && histogramData) {
				bucketTimes = histogramData.bucket_times.map((startTime) =>
					new Date(startTime).valueOf(),
				)
				seriesList = [
					{
						label: 'Errors logged',
						color: '--color-purple',
						counts: histogramData.error_objects,
					},
				]
			}
			setHistogram({
				seriesList,
				bucketTimes,
			})
		},
		skip: !backendSearchQuery?.childSearchQuery,
		fetchPolicy: useCachedErrors ? 'cache-first' : 'no-cache',
	})

	const updateTimeRange = useCallback(
		(newStartTime: Date, newEndTime: Date) => {
			const newSearchParams = {
				...searchParams,
				query: updateQueriedTimeRange(
					searchParams.query || '',
					TIME_RANGE_FIELD,
					serializeAbsoluteTimeRange(newStartTime, newEndTime),
				),
			}
			setSearchParams(newSearchParams)
		},
		[searchParams, setSearchParams],
	)

	return (
		<SearchResultsHistogram
			seriesList={histogram.seriesList}
			bucketTimes={histogram.bucketTimes}
			bucketSize={backendSearchQuery?.histogramBucketSize}
			loading={loading}
			updateTimeRange={updateTimeRange}
		/>
	)
}

export default ErrorFeedHistogram
