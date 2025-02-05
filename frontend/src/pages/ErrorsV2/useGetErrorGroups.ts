import {
	PAGE_PARAM,
	PAGE_SIZE,
} from '@components/SearchPagination/SearchPagination'
import {
	useGetErrorGroupsLazyQuery,
	useGetErrorGroupsQuery,
} from '@graph/hooks'
import { usePollQuery } from '@util/search'
import moment from 'moment'
import { useCallback, useMemo } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { GetHistogramBucketSize } from '@/components/SearchResultsHistogram/SearchResultsHistogram'
import {
	GetErrorGroupsQuery,
	GetErrorGroupsQueryVariables,
} from '@/graph/generated/operations'
import { useNavigate } from 'react-router-dom'
import { useQueryParam } from 'use-query-params'

export const useGetErrorGroups = ({
	query,
	project_id,
	startDate,
	endDate,
	page = 1,
	disablePolling,
}: {
	query: string
	project_id: string | undefined
	startDate: Date
	endDate: Date
	page?: number
	disablePolling?: boolean
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
		}),
		[endDate, page, project_id, query, startDate],
	)
	const { data, loading, error, refetch } = useGetErrorGroupsQuery({
		variables,
		fetchPolicy: 'cache-and-network',
	})
	const [paginationQuery] = useGetErrorGroupsLazyQuery({
		fetchPolicy: 'cache-first',
	})
	const [moreDataQuery] = useGetErrorGroupsLazyQuery({
		fetchPolicy: 'network-only',
	})

	const navigate = useNavigate()
	const goToErrorGroup = useCallback(
		(secureId: string, page?: number, query?: string) => {
			// preserve query string
			const queryStringParts = []
			if (page) {
				queryStringParts.push(`page=${page}`)
			}
			if (query) {
				queryStringParts.push(`query=${query}`)
			}
			const queryString = queryStringParts.join('&')
			navigate(
				`/${project_id}/errors/${secureId}${queryString ? `?${queryString}` : ''}`,
			)
		},
		[navigate, project_id],
	)

	const changeErrorGroupIndex = useCallback(
		async (index: number) => {
			const p =
				Math.floor(((page - 1) * PAGE_SIZE + index) / PAGE_SIZE) + 1
			setPage(p)

			let eg = data?.error_groups?.error_groups?.at(index)
			if (index >= 0 && eg !== undefined) {
				goToErrorGroup(eg.secure_id, p, query)
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
				eg = data?.error_groups?.error_groups?.at(newIndex)
				if (eg !== undefined) {
					goToErrorGroup(eg.secure_id, p, query)
				}
			}
		},
		[
			data?.error_groups?.error_groups,
			page,
			query,
			setPage,
			paginationQuery,
			variables,
			goToErrorGroup,
		],
	)

	const {
		numMore: moreErrors,
		pollingExpired,
		reset: resetMoreErrors,
	} = usePollQuery<GetErrorGroupsQuery, GetErrorGroupsQueryVariables>({
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
			}
		}, [endDate, project_id, query]),
		moreDataQuery,
		getResultCount: useCallback(
			(result) => result?.data?.error_groups.totalCount,
			[],
		),
		skip: disablePolling,
		maxResults: PAGE_SIZE,
	})

	return {
		errorGroups: data?.error_groups?.error_groups || [],
		errorGroupSecureIds:
			data?.error_groups?.error_groups.map((eg) => eg.secure_id) || [],
		moreErrors,
		pollingExpired,
		resetMoreErrors,
		loading,
		error,
		refetch,
		totalCount: data?.error_groups?.totalCount || 0,
		histogramBucketSize: determineHistogramBucketSize(startDate, endDate),
		changeErrorGroupIndex,
	}
}

const determineHistogramBucketSize = (startDate: Date, endDate: Date) => {
	const duration = moment.duration(moment(endDate).diff(moment(startDate)))
	return GetHistogramBucketSize(duration)
}
