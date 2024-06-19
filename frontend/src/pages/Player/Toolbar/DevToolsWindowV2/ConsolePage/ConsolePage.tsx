import { Box } from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import React, { useCallback, useEffect, useMemo } from 'react'

import { LogCustomColumn } from '@/components/CustomColumnPopover'
import { parseSearch } from '@/components/Search/utils'
import { SortDirection } from '@/graph/generated/schemas'
import { useGetLogs } from '@/pages/LogsPage/useGetLogs'
import { buildSessionParams } from '@/pages/LogsPage/utils'
import { findLastActiveEventIndex } from '@/pages/Player/Toolbar/DevToolsWindowV2/utils'
import analytics from '@/util/analytics'

import { useReplayerContext } from '../../../ReplayerContext'
import { ConsoleTable } from './ConsoleTable'
import * as styles from './style.css'

export const ConsolePage = ({
	autoScroll,
	panelHeight,
	query,
}: {
	autoScroll: boolean
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
			{
				id: 'level',
				label: 'Level',
				type: 'level',
				size: '75px',
				accessKey: 'level',
			},
			{
				id: 'message',
				label: 'Body',
				type: 'body',
				size: '5fr',
				accessKey: 'message',
			},
			{
				id: 'go-to-log',
				label: '',
				type: 'go-to-log',
				size: '75px',
				accessKey: 'timestamp',
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

	const lastActiveLogIndex = useMemo(() => {
		const messageNodes = logEdges.map((message) => message.node)

		return findLastActiveEventIndex(
			time,
			sessionMetadata.startTime,
			messageNodes,
		)
	}, [time, sessionMetadata.startTime, logEdges])

	useEffect(() => {
		analytics.track('session_view-console-logs')
	}, [])

	return (
		<Box cssClass={styles.consoleBox}>
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
