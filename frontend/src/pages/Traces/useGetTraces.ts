import { useGetTracesLazyQuery, useGetTracesQuery } from '@graph/hooks'
import { GetTracesQuery, GetTracesQueryVariables } from '@graph/operations'
import { PageInfo, TraceEdge } from '@graph/schemas'
import * as Types from '@graph/schemas'
import { usePollQuery } from '@util/search'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import {
	buildSearchQueryForServer,
	parseSearchQuery,
} from '@/components/Search/SearchForm/utils'

const initialWindowInfo: PageInfo = {
	hasNextPage: true,
	hasPreviousPage: true,
	startCursor: '', // unused but needed for typedef
	endCursor: '', // unused but needed for typedef
}

export const useGetTraces = ({
	query,
	projectId,
	traceCursor,
	startDate,
	endDate,
	skipPolling,
}: {
	query: string
	projectId: string | undefined
	traceCursor: string | undefined
	startDate: Date
	endDate: Date
	skipPolling?: boolean
}) => {
	// The backend can only tell us page info about a single page.
	// It has no idea what pages have already been loaded.
	//
	// For example: say we make the initial request for 100 traces and hasNextPage=true and hasPreviousPage=false
	// That means that we should not make any requests when going backwards.
	//
	// If the user scrolls forward to get the next 100 traces, the server will say that hasPreviousPage is `true` since we're on page 2.
	// Hence, we track the initial information (where "window" is effectively multiple pages) to ensure we aren't making requests unnecessarily.
	const [windowInfo, setWindowInfo] = useState<PageInfo>(initialWindowInfo)
	const [loadingAfter, setLoadingAfter] = useState(false)
	const [loadingBefore, setLoadingBefore] = useState(false)
	const queryTerms = parseSearchQuery(query)
	const serverQuery = buildSearchQueryForServer(queryTerms)

	useEffect(() => {
		setWindowInfo(initialWindowInfo)
	}, [query, startDate, endDate])

	const { data, loading, error, refetch, fetchMore } = useGetTracesQuery({
		variables: {
			project_id: projectId!,
			at: traceCursor,
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

	const [moreDataQuery] = useGetTracesLazyQuery({
		fetchPolicy: 'network-only',
	})

	const { numMore, reset } = usePollQuery<
		GetTracesQuery,
		GetTracesQueryVariables
	>({
		skip: skipPolling,
		variableFn: useCallback(
			() => ({
				project_id: projectId!,
				at: traceCursor,
				direction: Types.SortDirection.Desc,
				params: {
					query: serverQuery,
					date_range: {
						start_date: moment(endDate).format(TIME_FORMAT),
						end_date: moment().format(TIME_FORMAT),
					},
				},
			}),
			[endDate, traceCursor, projectId, serverQuery],
		),
		moreDataQuery,
		getResultCount: useCallback((result) => {
			if (result?.data?.traces.edges.length !== undefined) {
				return result?.data?.traces.edges.length
			}
		}, []),
	})

	const fetchMoreForward = useCallback(async () => {
		if (!windowInfo.hasNextPage || loadingAfter) {
			return
		}

		const lastItem = data && data.traces.edges[data.traces.edges.length - 1]
		const lastCursor = lastItem?.cursor

		if (!lastCursor) {
			return
		}

		setLoadingAfter(true)

		await fetchMore({
			variables: { after: lastCursor },
			updateQuery: (prevResult, { fetchMoreResult }) => {
				const newData = fetchMoreResult.traces.edges
				setWindowInfo({
					...windowInfo,
					hasNextPage: fetchMoreResult.traces.pageInfo.hasNextPage,
				})
				setLoadingAfter(false)
				return {
					traces: {
						...prevResult.traces,
						edges: [...prevResult.traces.edges, ...newData],
						pageInfo: fetchMoreResult.traces.pageInfo,
					},
				}
			},
		})
	}, [data, fetchMore, loadingAfter, windowInfo])

	const fetchMoreBackward = useCallback(async () => {
		if (!windowInfo.hasPreviousPage || loadingBefore) {
			return
		}

		const firstItem = data && data.traces.edges[0]
		const firstCursor = firstItem?.cursor

		if (!firstCursor) {
			return
		}

		setLoadingBefore(true)

		await fetchMore({
			variables: { before: firstCursor },
			updateQuery: (prevResult, { fetchMoreResult }) => {
				const newData = fetchMoreResult.traces.edges
				setWindowInfo({
					...windowInfo,
					hasPreviousPage:
						fetchMoreResult.traces.pageInfo.hasPreviousPage,
				})
				setLoadingBefore(false)
				return {
					traces: {
						...prevResult.traces,
						edges: [...prevResult.traces.edges, ...newData],
						pageInfo: fetchMoreResult.traces.pageInfo,
					},
				}
			},
		})
	}, [data, fetchMore, loadingBefore, windowInfo])

	return {
		traceEdges: (data?.traces.edges || []) as TraceEdge[],
		moreTraces: numMore,
		clearMoreTraces: reset,
		loading,
		loadingAfter,
		loadingBefore,
		error,
		fetchMoreForward,
		fetchMoreBackward,
		refetch,
	}
}
