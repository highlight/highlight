import {
	PAGE_PARAM,
	PAGE_SIZE,
} from '@components/SearchPagination/SearchPagination'
import { useGetSessionsLazyQuery, useGetSessionsQuery } from '@graph/hooks'
import { usePollQuery } from '@util/search'
import moment from 'moment'
import { useCallback, useMemo } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { GetHistogramBucketSize } from '@/components/SearchResultsHistogram/SearchResultsHistogram'
import {
	GetSessionsQuery,
	GetSessionsQueryVariables,
} from '@/graph/generated/operations'
import { useQueryParam } from 'use-query-params'
import { changeSession } from '@pages/Player/PlayerHook/utils'
import { useNavigate } from 'react-router-dom'

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
	presetSelected: boolean
}) => {
	const [, setPage] = useQueryParam('page', PAGE_PARAM)

	const variables = useMemo(
		() => ({
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
		}),
		[page, project_id, query, startDate, endDate, sortDesc],
	)
	const { data, loading, error, refetch } = useGetSessionsQuery({
		variables,
		fetchPolicy: 'cache-and-network',
	})
	const [paginationQuery] = useGetSessionsLazyQuery({
		fetchPolicy: 'cache-first',
	})
	const [moreDataQuery] = useGetSessionsLazyQuery({
		fetchPolicy: 'network-only',
	})

	const navigate = useNavigate()
	const changeSessionIndex = useCallback(
		async (index: number) => {
			/**
			 * The Key Idea: Use an Absolute Index
			 *
			 * Instead of thinking in terms of “page 1, element 5”, you maintain a single state that represents the absolute index of the selected item in the overall list. For example, if each page shows 10 items, then:
			 * 	•	The first page contains indices 0–9.
			 * 	•	The second page contains indices 10–19.
			 * 	•	And so on.
			 *
			 * When the user hits the next key:
			 * 	•	You increment the absolute index.
			 * 	•	Then you calculate the page number based on that index.
			 * 	•	Finally, you ensure that the page is loaded (or fetch it if needed) and that the correct element is highlighted.
			 */
			const p =
				Math.floor(((page - 1) * PAGE_SIZE + index) / PAGE_SIZE) + 1
			setPage(p)

			let session = data?.sessions?.sessions?.at(index)
			if (index >= 0 && session !== undefined) {
				changeSession(project_id!, navigate, session, {
					page: p,
					query,
				})
			} else {
				// session must be in the next page; find secure id in the next page
				const { data } = await paginationQuery({
					variables: {
						...variables,
						page: p,
					},
					fetchPolicy: 'cache-first',
				})
				const newIndex = index % PAGE_SIZE
				session = data?.sessions?.sessions?.at(newIndex)
				if (session !== undefined) {
					changeSession(project_id!, navigate, session, {
						page: p,
						query,
					})
				}
			}
		},
		[
			data?.sessions?.sessions,
			navigate,
			project_id,
			page,
			query,
			setPage,
			paginationQuery,
			variables,
		],
	)

	const {
		numMore: moreSessions,
		reset: resetMoreSessions,
		pollingExpired,
	} = usePollQuery<GetSessionsQuery, GetSessionsQueryVariables>({
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

	const totalLength = useMemo(
		() => moment.duration(data?.sessions?.totalLength || 0, 'ms'),
		[data?.sessions?.totalLength],
	)
	const totalActiveLength = useMemo(
		() => moment.duration(data?.sessions?.totalActiveLength || 0, 'ms'),
		[data?.sessions?.totalActiveLength],
	)

	return {
		sessions: data?.sessions?.sessions || [],
		sessionSes: data?.sessions?.sessions.map((eg) => eg.secure_id) || [],
		moreSessions,
		resetMoreSessions,
		loading: loading && data === undefined,
		error,
		refetch,
		totalCount: data?.sessions?.totalCount || 0,
		totalLength: totalLength,
		totalActiveLength: totalActiveLength,
		histogramBucketSize: determineHistogramBucketSize(startDate, endDate),
		pollingExpired,
		changeSessionIndex,
	}
}

const determineHistogramBucketSize = (startDate: Date, endDate: Date) => {
	const duration = moment.duration(moment(endDate).diff(moment(startDate)))
	return GetHistogramBucketSize(duration)
}
