import { SortDirection } from '@graph/schemas'
import { Box } from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { findLastActiveEventIndex } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { TraceCustomColumn } from '@/components/CustomColumnPopover'
import { buildSessionParams } from '@/pages/LogsPage/utils'
import analytics from '@/util/analytics'
import { parseSearch } from '@/components/Search/utils'

import { useReplayerContext } from '../../../ReplayerContext'
import { useGetTraces } from '@pages/Traces/useGetTraces'
import { TracesTable } from '@pages/Player/Toolbar/DevToolsWindowV2/TracesTable'
import { DEFAULT_TRACE_COLUMNS } from '@pages/Traces/CustomColumns/columns'

export const TracesPage = ({
	autoScroll,
	panelHeight,
	query,
}: {
	autoScroll: boolean
	filter: string
	panelHeight: number
	query: string
}) => {
	const { projectId } = useProjectId()
	const { session, time, setTime, sessionMetadata } = useReplayerContext()

	const params = buildSessionParams({ session, query })
	const { queryParts } = parseSearch(params.query)
	const {
		traceEdges,
		loading,
		error,
		loadingAfter,
		fetchMoreForward,
		refetch,
	} = useGetTraces({
		query: params.query,
		projectId,
		traceCursor: undefined,
		startDate: params.date_range.start_date.toDate(),
		endDate: params.date_range.end_date.toDate(),
		skipPolling: true,
		sortColumn: 'timestamp',
		sortDirection: SortDirection.Asc,
		limit: 1_000,
	})

	const fetchMoreWhenScrolled = useCallback(
		(containerRefElement?: HTMLDivElement | null) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } =
					containerRefElement

				if (scrollHeight - scrollTop - clientHeight < 100) {
					fetchMoreForward()
				}
			}
		},
		[fetchMoreForward],
	)

	const selectedColumns = useMemo(() => {
		return [
			...DEFAULT_TRACE_COLUMNS,
			{
				id: 'go-to-trace',
				label: '',
				type: 'go-to-trace',
				size: '75px',
				accessor: (row) => row.node.timestamp,
				onClick: (traceEdge: any) => {
					const timestamp =
						new Date(traceEdge.node.timestamp).getTime() -
						sessionMetadata.startTime
					setTime(timestamp)
					analytics.track('session_go-to-trace_click')
				},
			},
		] as TraceCustomColumn[]
	}, [sessionMetadata.startTime, setTime])

	const traceNodes = traceEdges.map((trace) => trace.node)
	const [lastActiveTraceIndex, setLastActiveTraceIndex] = useState(-1)

	useEffect(() => {
		// need to load data ahead because the player skipped past the last loaded node
		const lastTraceTs = traceNodes.at(traceNodes.length - 1)?.timestamp
		if (lastTraceTs) {
			const lastTraceTime = new Date(lastTraceTs).getTime()
			if (sessionMetadata.startTime + time > lastTraceTime) {
				fetchMoreForward()
			}
		}

		const activeIndex = findLastActiveEventIndex(
			time,
			sessionMetadata.startTime,
			traceNodes,
		)

		setLastActiveTraceIndex(activeIndex)
	}, [time, sessionMetadata.startTime, traceNodes, fetchMoreForward])

	useEffect(() => {
		analytics.track('session_view-console-traces')
	}, [])

	return (
		<Box height="full">
			<TracesTable
				traceEdges={traceEdges}
				loading={loading}
				error={error}
				refetch={refetch}
				selectedColumns={selectedColumns}
				queryParts={queryParts}
				lastActiveTraceIndex={lastActiveTraceIndex}
				autoScroll={autoScroll}
				bodyHeight={`${panelHeight - 104}px`}
				loadingAfter={loadingAfter}
				fetchMoreWhenScrolled={fetchMoreWhenScrolled}
			/>
		</Box>
	)
}
