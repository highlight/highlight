import { useGetTracesLazyQuery, useGetTracesQuery } from '@graph/hooks'
import { GetTracesQuery, GetTracesQueryVariables } from '@graph/operations'
import * as Types from '@graph/schemas'
import { TraceEdge } from '@graph/schemas'
import { usePollQuery } from '@util/search'
import moment from 'moment'
import { useCallback, useMemo, useState } from 'react'
import { debounce } from 'lodash'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'

export const MAX_TRACES = 50

export const useGetTraces = ({
	query,
	projectId,
	traceCursor,
	startDate,
	endDate,
	skipPolling,
	sortColumn = 'timestamp',
	sortDirection = Types.SortDirection.Desc,
	skip,
}: {
	query: string
	projectId: string | undefined
	traceCursor: string | undefined
	startDate: Date
	endDate: Date
	skipPolling?: boolean
	sortColumn?: string
	sortDirection?: Types.SortDirection
	skip?: boolean
}) => {
	const [loadingAfter, setLoadingAfter] = useState(false)

	const { data, loading, error, refetch, fetchMore } = useGetTracesQuery({
		variables: {
			project_id: projectId!,
			at: traceCursor,
			direction: sortDirection,
			params: {
				query,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				sort: {
					column: sortColumn,
					direction: sortDirection,
				},
			},
		},
		fetchPolicy: 'cache-and-network',
		skip,
	})

	const [moreDataQuery] = useGetTracesLazyQuery({
		fetchPolicy: 'network-only',
	})

	const traceResultMetadata = useMemo(() => {
		const traceIdSet = new Set()
		const cursors = []
		let latestLogTime, earliestLogTime

		if (data?.traces.edges.length) {
			cursors.push(data.traces.edges[0].cursor)

			for (const edge of data.traces.edges) {
				if (edge.node.traceID) {
					traceIdSet.add(edge.node.traceID)
				}

				if (!latestLogTime || latestLogTime < edge.node.timestamp) {
					latestLogTime = edge.node.timestamp
				}

				if (!earliestLogTime || earliestLogTime > edge.node.timestamp) {
					earliestLogTime = edge.node.timestamp
				}
			}
		}

		return {
			cursors,
			traceIds: Array.from(traceIdSet) as string[],
			endDate: latestLogTime || endDate,
			startDate: earliestLogTime || startDate,
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.traces.edges])

	const { numMore, pollingExpired, reset } = usePollQuery<
		GetTracesQuery,
		GetTracesQueryVariables
	>({
		maxResults: MAX_TRACES,
		skip: skipPolling,
		variableFn: useCallback(
			() => ({
				project_id: projectId!,
				at: traceCursor,
				direction: sortDirection,
				params: {
					query,
					date_range: {
						start_date: moment(traceResultMetadata.endDate)
							.add(1, 'second')
							.format(TIME_FORMAT),
						end_date: moment().format(TIME_FORMAT),
					},
					sort: {
						column: sortColumn,
						direction: sortDirection,
					},
				},
			}),
			[
				projectId,
				traceCursor,
				query,
				traceResultMetadata.endDate,
				sortColumn,
				sortDirection,
			],
		),
		moreDataQuery,
		getResultCount: useCallback((result) => {
			if (result?.data?.traces.edges.length !== undefined) {
				return result?.data?.traces.edges.length
			}
		}, []),
	})

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const fetchMoreTraces = useCallback(
		debounce(
			async (cursor: string) => {
				await fetchMore({
					variables: { after: cursor },
					updateQuery: (prevResult, { fetchMoreResult }) => {
						return {
							traces: {
								...prevResult.traces,
								edges: [
									...prevResult.traces.edges,
									...fetchMoreResult.traces.edges,
								],
								pageInfo: {
									...prevResult.traces.pageInfo,
									hasNextPage:
										fetchMoreResult.traces.pageInfo
											.hasNextPage,
									endCursor:
										fetchMoreResult.traces.pageInfo
											.endCursor,
								},
							},
						}
					},
				})
			},
			300,
			{ leading: true, trailing: false },
		),
		[fetchMore],
	)

	const fetchMoreForward = useCallback(async () => {
		const { hasNextPage, endCursor } = data?.traces.pageInfo || {}
		if (!hasNextPage || loadingAfter || !endCursor) {
			return
		}

		setLoadingAfter(true)
		await fetchMoreTraces(endCursor)
		setLoadingAfter(false)
	}, [data?.traces.pageInfo, fetchMoreTraces, loadingAfter])

	return {
		traceEdges: (data?.traces.edges || []) as TraceEdge[],
		moreTraces: numMore,
		pollingExpired,
		clearMoreTraces: reset,
		loading,
		loadingAfter,
		error,
		fetchMoreForward,
		refetch,
		sampled: data?.traces.sampled,
	}
}
