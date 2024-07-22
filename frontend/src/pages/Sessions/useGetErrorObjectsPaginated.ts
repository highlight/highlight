import moment from 'moment'
import { useCallback, useState } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { useGetErrorObjectsQuery } from '@/graph/generated/hooks'
import { ErrorObjectNode } from '@/graph/generated/schemas'

const PAGE_SIZE = 50

export const useGetErrorObjectsPaginated = ({
	query,
	projectId,
	startDate,
	endDate,
	skip,
}: {
	query: string
	projectId: string
	startDate: Date
	endDate: Date
	skip?: boolean
}) => {
	const [loadingAfter, setLoadingAfter] = useState(false)

	const { data, loading, error, refetch, fetchMore } =
		useGetErrorObjectsQuery({
			variables: {
				project_id: projectId,
				params: {
					query,
					date_range: {
						start_date: moment(startDate).format(TIME_FORMAT),
						end_date: moment(endDate).format(TIME_FORMAT),
					},
				},
				count: PAGE_SIZE,
			},
			fetchPolicy: 'cache-and-network',
			skip,
		})

	const fetchMoreForward = useCallback(async () => {
		const last = data?.error_objects.error_objects.at(-1)
		if (
			last === undefined ||
			data?.error_objects.totalCount === undefined ||
			data?.error_objects.totalCount <= PAGE_SIZE
		) {
			return
		}

		setLoadingAfter(true)

		await fetchMore({
			variables: {
				params: {
					query,
					date_range: {
						start_date: moment(startDate).format(TIME_FORMAT),
						end_date: moment(last.timestamp)
							.subtract(1, 'millisecond')
							.format(TIME_FORMAT),
					},
				},
			},
			updateQuery: (prevResult, { fetchMoreResult }) => {
				setLoadingAfter(false)
				return {
					error_objects: {
						...prevResult.error_objects,
						error_objects: [
							...prevResult.error_objects.error_objects,
							...fetchMoreResult.error_objects.error_objects,
						],
						totalCount: fetchMoreResult.error_objects.totalCount,
					},
				}
			},
		})
	}, [
		data?.error_objects.error_objects,
		data?.error_objects.totalCount,
		fetchMore,
		query,
		startDate,
	])

	return {
		errorObjects: data?.error_objects.error_objects as ErrorObjectNode[],
		loading,
		loadingAfter,
		error,
		fetchMoreForward,
		refetch,
	}
}
