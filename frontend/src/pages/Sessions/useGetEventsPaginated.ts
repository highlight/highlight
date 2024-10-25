import { useGetEventSessionsQuery } from '@graph/hooks'
import moment from 'moment'
import { useCallback, useState } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { Session } from '@/graph/generated/schemas'

const PAGE_SIZE = 50

export const useGetEventsPaginated = ({
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
		useGetEventSessionsQuery({
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
		const last = data?.event_sessions.sessions.at(-1)
		if (
			last === undefined ||
			data?.event_sessions.totalCount === undefined ||
			data?.event_sessions.totalCount <= PAGE_SIZE
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
					event_sessions: {
						...prevResult.event_sessions,
						sessions: [
							...prevResult.event_sessions.sessions,
							...fetchMoreResult.event_sessions.sessions,
						],
						totalCount: fetchMoreResult.event_sessions.totalCount,
					},
				}
			},
		})
	}, [
		data?.event_sessions.sessions,
		data?.event_sessions.totalCount,
		fetchMore,
		query,
		startDate,
	])

	return {
		sessions: data?.event_sessions.sessions as Session[],
		loading,
		loadingAfter,
		error,
		fetchMoreForward,
		refetch,
	}
}
