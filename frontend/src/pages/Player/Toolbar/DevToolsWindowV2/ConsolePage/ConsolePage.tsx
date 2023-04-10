import LoadingBox from '@components/LoadingBox'
import { Log, LogLevel, LogSource } from '@graph/schemas'
import {
	Box,
	IconSolidArrowCircleRight,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { COLOR_MAPPING, LOG_TIME_FORMAT } from '@pages/LogsPage/constants'
import { buildSessionParams } from '@pages/LogsPage/SearchForm/utils'
import { ReplayerState } from '@pages/Player/ReplayerContext'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import { Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import clsx from 'clsx'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { useGetSessionLogsQuery } from '@/graph/generated/hooks'
import { styledVerticalScrollbar } from '@/style/common.css'

import { useReplayerContext } from '../../../ReplayerContext'
import * as styles from './style.css'

type SessionLog = Pick<Log, 'timestamp' | 'message' | 'level'>
type SessionLogEdge = { cursor: string; node: SessionLog }

export const ConsolePage = ({
	logCursor,
	autoScroll,
	filter,
	sources,
	levels,
	time,
}: {
	autoScroll: boolean
	logCursor: string | null
	filter: string
	sources: LogSource[]
	levels: LogLevel[]
	time: number
}) => {
	const { projectId } = useProjectId()
	const [selectedCursor, setSelectedCursor] = useState(logCursor)
	const { session, setTime, isPlayerReady, sessionMetadata, state } =
		useReplayerContext()

	const params = buildSessionParams({ session, levels, sources })

	const { data, loading } = useGetSessionLogsQuery({
		variables: {
			params: {
				query: params.query,
				date_range: {
					start_date:
						params.date_range.start_date.format(LOG_TIME_FORMAT),
					end_date:
						params.date_range.end_date.format(LOG_TIME_FORMAT),
				},
			},
			project_id: projectId,
		},
		skip: !session?.created_at,
	})

	// Logic for scrolling to current entry.
	useEffect(() => {
		if (state !== ReplayerState.Playing || !autoScroll) {
			return
		}
		if (data?.sessionLogs.length) {
			let cursor = ''
			let msgDiff: number = Number.MAX_VALUE
			for (let i = 0; i < data.sessionLogs.length; i++) {
				const currentDiff: number =
					time -
					(new Date(data.sessionLogs[i].node.timestamp).getDate() -
						new Date(data.sessionLogs[0].node.timestamp).getDate())
				if (currentDiff < 0) break
				if (currentDiff < msgDiff) {
					cursor = data.sessionLogs[i].cursor
					msgDiff = currentDiff
				}
			}
			setSelectedCursor(cursor)
		}
	}, [state, time, data?.sessionLogs, autoScroll])

	const messagesToRender = useMemo(() => {
		if (filter !== '') {
			return data?.sessionLogs.filter((logEdge) => {
				if (!logEdge.node.message) {
					return false
				}

				return logEdge.node.message
					.toLocaleLowerCase()
					.includes(filter.toLocaleLowerCase())
			})
		}

		return data?.sessionLogs
	}, [filter, data?.sessionLogs])

	const virtuoso = useRef<VirtuosoHandle>(null)
	useEffect(() => {
		if (
			isPlayerReady && // ensure Virtuoso component is actually rendered
			virtuoso.current &&
			messagesToRender
		) {
			const index = messagesToRender.findIndex(
				(logEdge) => logEdge.cursor === selectedCursor,
			)

			if (index) {
				virtuoso.current.scrollToIndex({
					index,
					align: 'center',
					// Using smooth has performance issues with large lists
					// See: https://virtuoso.dev/scroll-to-index/
					// behavior: 'smooth'
				})
			}
		}
	}, [isPlayerReady, messagesToRender, selectedCursor])

	return (
		<Box className={styles.consoleBox}>
			{loading || !isPlayerReady ? (
				<LoadingBox />
			) : messagesToRender?.length ? (
				<Virtuoso
					ref={virtuoso}
					overscan={1024}
					increaseViewportBy={1024}
					data={messagesToRender}
					className={styledVerticalScrollbar}
					itemContent={(_index, logEdge: SessionLogEdge) => (
						<MessageRow
							key={logEdge.cursor}
							logEdge={logEdge}
							current={selectedCursor === logEdge.cursor}
							startTime={sessionMetadata.startTime}
							setTime={(time: number) => {
								setTime(time)
								setSelectedCursor(logEdge.cursor)
							}}
						/>
					)}
				/>
			) : (
				<EmptyDevToolsCallout kind={Tab.Console} filter={filter} />
			)}
		</Box>
	)
}

const MessageRow = React.memo(function ({
	logEdge,
	setTime,
	startTime,
	current,
}: {
	logEdge: SessionLogEdge
	setTime: (time: number) => void
	startTime: number
	current?: boolean
}) {
	const timestamp = useMemo(() => {
		return new Date(logEdge.node.timestamp).getTime() - startTime
	}, [logEdge.node.timestamp, startTime])

	return (
		<Box
			cssClass={clsx(
				styles.consoleRow,
				styles.messageRowVariants({
					current,
				}),
			)}
			borderBottom="dividerWeak"
			py="4"
		>
			<Stack direction="row" align="center">
				<Box flexGrow={1}>
					<Text
						family="monospace"
						color="secondaryContentOnEnabled"
						break="word"
					>
						<Box
							style={{
								color: COLOR_MAPPING[logEdge.node.level],
								marginRight: '2px',
							}}
							as="span"
						>
							[{logEdge.node.level.toUpperCase()}]
						</Box>
						{logEdge.node.message}
					</Text>
				</Box>

				<Box style={{ minWidth: '70px' }}>
					<Tag
						shape="basic"
						emphasis="low"
						kind="secondary"
						iconRight={<IconSolidArrowCircleRight />}
						onClick={() => {
							setTime(timestamp)
						}}
					>
						Go to
					</Tag>
				</Box>
			</Stack>
		</Box>
	)
})
