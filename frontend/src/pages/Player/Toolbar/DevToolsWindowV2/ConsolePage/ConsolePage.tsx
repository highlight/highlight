import { LogEdge, SortDirection } from '@graph/schemas'
import { Box } from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { THROTTLED_UPDATE_MS } from '@pages/Player/PlayerHook/PlayerState'
import { findLastActiveEventIndex } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useGetLogs } from '@/pages/LogsPage/useGetLogs'
import { LogCustomColumn } from '@/components/CustomColumnPopover'
import { buildSessionParams } from '@/pages/LogsPage/utils'
import analytics from '@/util/analytics'
import { parseSearch } from '@/components/Search/utils'
import { DEFAULT_LOG_COLUMNS } from '@/pages/LogsPage/LogsTable/CustomColumns/columns'

import { useReplayerContext } from '../../../ReplayerContext'
import { ConsoleTable } from '../ConsoleTable'

export const ConsolePage = ({
	autoScroll,
	panelHeight,
	query,
}: {
	autoScroll: boolean
	logCursor: string | null
	filter: string
	panelHeight: number
	query: string
}) => {
	const { projectId } = useProjectId()
	const { session, time, setTime, sessionMetadata } = useReplayerContext()

	const params = buildSessionParams({ session, query })
	const { queryParts } = parseSearch(params.query)

	const {
		logEdges,
		loading,
		error,
		loadingAfter,
		fetchMoreForward,
		refetch,
	} = useGetLogs({
		query: params.query,
		project_id: projectId,
		startDate: params.date_range.start_date.toDate(),
		endDate: params.date_range.end_date.toDate(),
		disablePolling: true,
		disableRelatedResources: true,
		logCursor: undefined,
		sortDirection: SortDirection.Asc,
		sortColumn: 'timestamp',
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
			...DEFAULT_LOG_COLUMNS,
			{
				id: 'go-to-log',
				label: '',
				type: 'go-to-log',
				size: '75px',
				accessor: (row: LogEdge) => row.node.timestamp,
				onClick: (logEdge: any) => {
					const timestamp =
						new Date(logEdge.node.timestamp).getTime() -
						sessionMetadata.startTime
					setTime(timestamp)
					analytics.track('session_go-to-log_click')
				},
			},
		] as LogCustomColumn[]
	}, [sessionMetadata.startTime, setTime])

	const messageNodes = logEdges.map((message) => message.node)
	const [lastActiveLogIndex, setLastActiveLogIndex] = useState(-1)

	useEffect(
		() =>
			_.throttle(
				() => {
					const activeIndex = findLastActiveEventIndex(
						time,
						sessionMetadata.startTime,
						messageNodes,
					)

					setLastActiveLogIndex(activeIndex)
				},
				THROTTLED_UPDATE_MS,
				{ leading: true, trailing: false },
			),
		[time, sessionMetadata.startTime, messageNodes],
	)

	useEffect(() => {
		analytics.track('session_view-console-logs')
	}, [])

	return (
		<Box height="full">
			<ConsoleTable
				logEdges={logEdges}
				loading={loading}
				error={error}
				refetch={refetch}
				selectedColumns={selectedColumns}
				queryParts={queryParts}
				lastActiveLogIndex={lastActiveLogIndex}
				autoScroll={autoScroll}
				bodyHeight={`${panelHeight - 104}px`}
				loadingAfter={loadingAfter}
				fetchMoreWhenScrolled={fetchMoreWhenScrolled}
			/>
		</Box>
	)
}
