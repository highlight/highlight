import { PAGE_SIZE } from '@components/SearchPagination/SearchPagination'
import {
	useGetErrorGroupsLazyQuery,
	useGetErrorGroupsQuery,
} from '@graph/hooks'
import { usePollQuery } from '@util/search'
import moment from 'moment'
import { useCallback } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { GetHistogramBucketSize } from '@/components/SearchResultsHistogram/SearchResultsHistogram'
import {
	GetErrorGroupsQuery,
	GetErrorGroupsQueryVariables,
} from '@/graph/generated/operations'

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
	const { data, loading, error, refetch } = useGetErrorGroupsQuery({
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
		},
		fetchPolicy: 'cache-and-network',
	})

	const [moreDataQuery] = useGetErrorGroupsLazyQuery({
		fetchPolicy: 'network-only',
	})

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
	}
}

const determineHistogramBucketSize = (startDate: Date, endDate: Date) => {
	const duration = moment.duration(moment(endDate).diff(moment(startDate)))
	return GetHistogramBucketSize(duration)
}
