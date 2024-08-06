import { useGetSessionsQuery } from '@graph/hooks'
import moment from 'moment'
import { useCallback, useState } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { Session } from '@/graph/generated/schemas'

const PAGE_SIZE = 50

export const useGetSessionsPaginated = ({
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

	const { data, loading, error, refetch, fetchMore } = useGetSessionsQuery({
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
			sort_desc: true,
		},
		fetchPolicy: 'cache-and-network',
		skip,
	})

	const fetchMoreForward = useCallback(async () => {
		const last = data?.sessions.sessions.at(-1)
		if (
			last === undefined ||
			data?.sessions.totalCount === undefined ||
			data?.sessions.totalCount <= PAGE_SIZE
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
						end_date: moment(last.created_at)
							.subtract(1, 'millisecond')
							.format(TIME_FORMAT),
					},
				},
			},
			updateQuery: (prevResult, { fetchMoreResult }) => {
				setLoadingAfter(false)
				return {
					sessions: {
						...prevResult.sessions,
						sessions: [
							...prevResult.sessions.sessions,
							...fetchMoreResult.sessions.sessions,
						],
						totalCount: fetchMoreResult.sessions.totalCount,
					},
				}
			},
		})
	}, [
		data?.sessions.sessions,
		data?.sessions.totalCount,
		fetchMore,
		query,
		startDate,
	])

	return {
		sessions: data?.sessions.sessions as Session[],
		loading,
		loadingAfter,
		error,
		fetchMoreForward,
		refetch,
	}
}
