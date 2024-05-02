import { PAGE_SIZE } from '@components/SearchPagination/SearchPagination'
import { useGetSessionsLazyQuery, useGetSessionsQuery } from '@graph/hooks'
import { usePollQuery } from '@util/search'
import moment from 'moment'
import { useCallback } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { GetHistogramBucketSize } from '@/components/SearchResultsHistogram/SearchResultsHistogram'
import {
	GetSessionsQuery,
	GetSessionsQueryVariables,
} from '@/graph/generated/operations'

export const useGetSessions = ({
	query,
	project_id,
	startDate,
	endDate,
	page = 1,
	disablePolling,
	sortDesc,
}: {
	query: string
	project_id: string | undefined
	startDate: Date
	endDate: Date
	page?: number
	disablePolling?: boolean
	sortDesc: boolean
}) => {
	const { data, loading, error, refetch } = useGetSessionsQuery({
		variables: {
			project_id: project_id!,
			count: PAGE_SIZE,
			page,
			params: {
				query,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
			},
			sort_desc: sortDesc,
		},
		fetchPolicy: 'cache-and-network',
	})

	const [moreDataQuery] = useGetSessionsLazyQuery({
		fetchPolicy: 'network-only',
	})

	const { numMore: moreSessions, reset: resetMoreSessions } = usePollQuery<
		GetSessionsQuery,
		GetSessionsQueryVariables
	>({
		variableFn: useCallback(() => {
			return {
				params: {
					query,
					date_range: {
						start_date: moment(endDate).format(TIME_FORMAT),
						end_date: moment().format(TIME_FORMAT),
					},
				},
				count: PAGE_SIZE,
				page: 1,
				project_id: project_id!,
				sort_desc: true,
			}
		}, [endDate, project_id, query]),
		moreDataQuery,
		getResultCount: useCallback(
			(result) => result?.data?.sessions.totalCount,
			[],
		),
		skip: disablePolling || !sortDesc,
		maxResults: PAGE_SIZE,
	})

	return {
		sessions: data?.sessions?.sessions || [],
		sessionSes: data?.sessions?.sessions.map((eg) => eg.secure_id) || [],
		moreSessions,
		resetMoreSessions,
		loading,
		error,
		refetch,
		totalCount: data?.sessions?.totalCount || 0,
		histogramBucketSize: determineHistogramBucketSize(startDate, endDate),
	}
}

const determineHistogramBucketSize = (startDate: Date, endDate: Date) => {
	const duration = moment.duration(moment(endDate).diff(moment(startDate)))
	return GetHistogramBucketSize(duration)
}
