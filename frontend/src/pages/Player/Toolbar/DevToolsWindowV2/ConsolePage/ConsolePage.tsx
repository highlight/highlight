import { Box } from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import React, { useEffect, useMemo } from 'react'

import { LogCustomColumn } from '@/components/CustomColumnPopover'
import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { parseSearch } from '@/components/Search/utils'
import { useGetSessionLogsQuery } from '@/graph/generated/hooks'
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

	const { data, loading, error, refetch } = useGetSessionLogsQuery({
		variables: {
			params: {
				query: params.query,
				date_range: {
					start_date:
						params.date_range.start_date.format(TIME_FORMAT),
					end_date: params.date_range.end_date.format(TIME_FORMAT),
				},
			},
			project_id: projectId,
		},
		skip: !session,
	})

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
		const messageNodes = data?.sessionLogs
			? data.sessionLogs.map((message) => message.node)
			: []

		return findLastActiveEventIndex(
			time,
			sessionMetadata.startTime,
			messageNodes,
		)
	}, [time, sessionMetadata.startTime, data?.sessionLogs])

	useEffect(() => {
		analytics.track('session_view-console-logs')
	}, [])

	return (
		<Box cssClass={styles.consoleBox}>
			<ConsoleTable
				logEdges={data?.sessionLogs || []}
				loading={loading}
				error={error}
				refetch={refetch}
				selectedColumns={selectedColumns}
				queryParts={queryParts}
				lastActiveLogIndex={lastActiveLogIndex}
				autoScroll={autoScroll}
				bodyHeight={`${panelHeight - 104}px`}
			/>
		</Box>
	)
}
