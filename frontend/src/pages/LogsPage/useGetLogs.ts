import {
	useGetLogsErrorObjectsQuery,
	useGetLogsLazyQuery,
	useGetLogsQuery,
} from '@graph/hooks'
import { GetLogsQuery, GetLogsQueryVariables } from '@graph/operations'
import { LogEdge, PageInfo } from '@graph/schemas'
import * as Types from '@graph/schemas'
import { usePollQuery } from '@util/search'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import {
	buildSearchQueryForServer,
	parseSearchQuery,
} from '@/components/Search/SearchForm/utils'

export type LogEdgeWithError = LogEdge & {
	error_object?: Pick<
		Types.ErrorObject,
		'log_cursor' | 'error_group_secure_id' | 'id'
	>
}

const initialWindowInfo: PageInfo = {
	hasNextPage: true,
	hasPreviousPage: true,
	startCursor: '', // unused but needed for typedef
	endCursor: '', // unused but needed for typedef
}

export const useGetLogs = ({
	query,
	project_id,
	logCursor,
	startDate,
	endDate,
	disablePolling,
}: {
	query: string
	project_id: string | undefined
	logCursor: string | undefined
	startDate: Date
	endDate: Date
	disablePolling?: boolean
}) => {
	// The backend can only tell us page info about a single page.
	// It has no idea what pages have already been loaded.
	//
	// For example: say we make the initial request for 100 logs and hasNextPage=true and hasPreviousPage=false
	// That means that we should not make any requests when going backwards.
	//
	// If the user scrolls forward to get the next 100 logs, the server will say that hasPreviousPage is `true` since we're on page 2.
	// Hence, we track the initial information (where "window" is effectively multiple pages) to ensure we aren't making requests unnecessarily.
	const [windowInfo, setWindowInfo] = useState<PageInfo>(initialWindowInfo)
	const [loadingAfter, setLoadingAfter] = useState(false)
	const [loadingBefore, setLoadingBefore] = useState(false)
	const queryTerms = parseSearchQuery(query)
	const serverQuery = buildSearchQueryForServer(queryTerms)

	useEffect(() => {
		setWindowInfo(initialWindowInfo)
	}, [query, startDate, endDate])

	const { data, loading, error, refetch, fetchMore } = useGetLogsQuery({
		variables: {
			project_id: project_id!,
			at: logCursor,
			direction: Types.SortDirection.Desc,
			params: {
				query: serverQuery,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
			},
		},
		fetchPolicy: 'cache-and-network',
	})

	const [moreDataQuery] = useGetLogsLazyQuery({
		fetchPolicy: 'network-only',
	})

	const { numMore, reset } = usePollQuery<
		GetLogsQuery,
		GetLogsQueryVariables
	>({
		skip: disablePolling,
		variableFn: useCallback(
			() => ({
				project_id: project_id!,
				at: logCursor,
				direction: Types.SortDirection.Desc,
				params: {
					query: serverQuery,
					date_range: {
						start_date: moment(endDate).format(TIME_FORMAT),
						end_date: moment().format(TIME_FORMAT),
					},
				},
			}),
			[endDate, logCursor, project_id, serverQuery],
		),
		moreDataQuery,
		getResultCount: useCallback((result) => {
			if (result?.data?.logs.edges.length !== undefined) {
				return result?.data?.logs.edges.length
			}
		}, []),
	})

	const { data: logErrorObjects } = useGetLogsErrorObjectsQuery({
		variables: { log_cursors: data?.logs.edges.map((e) => e.cursor) || [] },
		skip: !data?.logs.edges.length,
	})

	const fetchMoreForward = useCallback(async () => {
		if (!windowInfo.hasNextPage || loadingAfter) {
			return
		}

		const lastItem = data && data.logs.edges[data.logs.edges.length - 1]
		const lastCursor = lastItem?.cursor

		if (!lastCursor) {
			return
		}

		setLoadingAfter(true)

		await fetchMore({
			variables: { after: lastCursor },
			updateQuery: (prevResult, { fetchMoreResult }) => {
				const newData = fetchMoreResult.logs.edges
				setWindowInfo({
					...windowInfo,
					hasNextPage: fetchMoreResult.logs.pageInfo.hasNextPage,
				})
				setLoadingAfter(false)
				return {
					logs: {
						...prevResult.logs,
						edges: [...prevResult.logs.edges, ...newData],
						pageInfo: fetchMoreResult.logs.pageInfo,
					},
				}
			},
		})
	}, [data, fetchMore, loadingAfter, windowInfo])

	const fetchMoreBackward = useCallback(async () => {
		if (!windowInfo.hasPreviousPage || loadingBefore) {
			return
		}

		const firstItem = data && data.logs.edges[0]
		const firstCursor = firstItem?.cursor

		if (!firstCursor) {
			return
		}

		setLoadingBefore(true)

		await fetchMore({
			variables: { before: firstCursor },
			updateQuery: (prevResult, { fetchMoreResult }) => {
				const newData = fetchMoreResult.logs.edges
				setWindowInfo({
					...windowInfo,
					hasPreviousPage:
						fetchMoreResult.logs.pageInfo.hasPreviousPage,
				})
				setLoadingBefore(false)
				return {
					logs: {
						...prevResult.logs,
						edges: [...prevResult.logs.edges, ...newData],
						pageInfo: fetchMoreResult.logs.pageInfo,
					},
				}
			},
		})
	}, [data, fetchMore, loadingBefore, windowInfo])

	const logEdgesWithError: LogEdgeWithError[] = (data?.logs.edges || []).map(
		(e) => ({
			...e,
			error_object: (logErrorObjects?.logs_error_objects || []).find(
				(leo) => leo.log_cursor === e.cursor,
			),
		}),
	)

	return {
		logEdges: logEdgesWithError,
		moreLogs: numMore,
		clearMoreLogs: reset,
		loading,
		loadingAfter,
		loadingBefore,
		error,
		fetchMoreForward,
		fetchMoreBackward,
		refetch,
	}
}
