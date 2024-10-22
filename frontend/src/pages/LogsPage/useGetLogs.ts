import {
	useGetLogsLazyQuery,
	useGetLogsQuery,
	useGetLogsRelatedResourcesQuery,
} from '@graph/hooks'
import { GetLogsQuery, GetLogsQueryVariables } from '@graph/operations'
import * as Types from '@graph/schemas'
import { LogEdge } from '@graph/schemas'
import { usePollQuery } from '@util/search'
import moment from 'moment'
import { useCallback, useMemo, useState } from 'react'
import { debounce } from 'lodash'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'

export type LogEdgeWithResources = LogEdge & {
	error_object?: Pick<
		Types.ErrorObject,
		'log_cursor' | 'error_group_secure_id' | 'id'
	>
	traceExist?: boolean
}

export const MAX_LOGS = 50

export const useGetLogs = ({
	query,
	project_id,
	logCursor,
	startDate,
	endDate,
	disablePolling,
	sortColumn = 'timestamp',
	sortDirection = Types.SortDirection.Desc,
	limit,
	disableRelatedResources,
}: {
	query: string
	project_id: string | undefined
	logCursor: string | undefined
	startDate: Date
	endDate: Date
	disablePolling?: boolean
	sortColumn?: string
	sortDirection?: Types.SortDirection
	limit?: number
	disableRelatedResources?: boolean
}) => {
	const [loadingAfter, setLoadingAfter] = useState(false)

	const { data, loading, error, refetch, fetchMore } = useGetLogsQuery({
		variables: {
			project_id: project_id!,
			at: logCursor,
			direction: sortDirection,
			limit,
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
	})

	const [moreDataQuery] = useGetLogsLazyQuery({
		fetchPolicy: 'network-only',
	})

	const logResultMetadata = useMemo(() => {
		const logTraceIdSet = new Set()
		const cursors = []
		let latestLogTime, earliestLogTime

		if (data?.logs.edges.length) {
			cursors.push(data.logs.edges[0].cursor)

			for (const edge of data.logs.edges) {
				if (edge.node.traceID) {
					logTraceIdSet.add(edge.node.traceID)
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
			traceIds: Array.from(logTraceIdSet) as string[],
			endDate: latestLogTime || endDate,
			startDate: earliestLogTime || startDate,
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.logs.edges])

	const { numMore, pollingExpired, reset } = usePollQuery<
		GetLogsQuery,
		GetLogsQueryVariables
	>({
		maxResults: MAX_LOGS,
		skip: disablePolling,
		variableFn: useCallback(
			() => ({
				project_id: project_id!,
				at: logCursor,
				direction: sortDirection,
				params: {
					query,
					date_range: {
						start_date: moment(logResultMetadata.endDate)
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
				logCursor,
				logResultMetadata.endDate,
				project_id,
				query,
				sortColumn,
				sortDirection,
			],
		),
		moreDataQuery,
		getResultCount: useCallback((result) => {
			if (result?.data?.logs.edges.length !== undefined) {
				return result?.data?.logs.edges.length
			}
		}, []),
	})

	const { data: logRelatedResources } = useGetLogsRelatedResourcesQuery({
		variables: {
			project_id: project_id!,
			log_cursors: logResultMetadata.cursors,
			trace_ids: logResultMetadata.traceIds,
			date_range: {
				start_date: moment(logResultMetadata.startDate)
					.subtract(5, 'minutes')
					.format(TIME_FORMAT),
				end_date: moment(logResultMetadata.endDate)
					.add(5, 'minutes')
					.format(TIME_FORMAT),
			},
		},
		skip: disableRelatedResources || !data?.logs.edges.length,
	})

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const fetchMoreLogs = useCallback(
		debounce(
			async (cursor: string) => {
				await fetchMore({
					variables: { after: cursor },
					updateQuery: (prevResult, { fetchMoreResult }) => {
						return {
							logs: {
								...prevResult.logs,
								edges: [
									...prevResult.logs.edges,
									...fetchMoreResult.logs.edges,
								],
								pageInfo: {
									...prevResult.logs.pageInfo,
									hasNextPage:
										fetchMoreResult.logs.pageInfo
											.hasNextPage,
									endCursor:
										fetchMoreResult.logs.pageInfo.endCursor,
								},
							},
						}
					},
				})

				setLoadingAfter(false)
			},
			300,
			{ leading: true, trailing: false },
		),
		[fetchMore],
	)

	const fetchMoreForward = useCallback(async () => {
		const { hasNextPage, endCursor } = data?.logs.pageInfo || {}
		if (!hasNextPage || loadingAfter || !endCursor) {
			return
		}

		setLoadingAfter(true)
		await fetchMoreLogs(endCursor)
		setLoadingAfter(false)
	}, [data?.logs.pageInfo, fetchMoreLogs, loadingAfter])

	const existingTraceSet = new Set(logRelatedResources?.existing_logs_traces)

	const logEdgesWithResources: LogEdgeWithResources[] = (
		data?.logs.edges || []
	).map((e) => ({
		...e,
		error_object: (logRelatedResources?.logs_error_objects || []).find(
			(
				leo: Pick<
					Types.ErrorObject,
					'log_cursor' | 'error_group_secure_id' | 'id'
				>,
			) => leo.log_cursor === e.cursor,
		),
		traceExist: !!e.node.traceID && existingTraceSet.has(e.node.traceID),
	}))

	return {
		logEdges: logEdgesWithResources,
		moreLogs: numMore,
		clearMoreLogs: reset,
		pollingExpired,
		loading,
		loadingAfter,
		error,
		fetchMoreForward,
		refetch,
	}
}
