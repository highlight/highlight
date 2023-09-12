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
import { COLOR_MAPPING } from '@pages/LogsPage/constants'
import { ReplayerState } from '@pages/Player/ReplayerContext'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import { Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import clsx from 'clsx'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { useGetSessionLogsQuery } from '@/graph/generated/hooks'
import { buildSessionParams } from '@/pages/LogsPage/utils'
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
}: {
	autoScroll: boolean
	logCursor: string | null
	filter: string
	sources: LogSource[]
	levels: LogLevel[]
}) => {
	const { projectId } = useProjectId()
	const [selectedCursor, setSelectedCursor] = useState(logCursor)
	const { session, setTime, time, isPlayerReady, sessionMetadata, state } =
		useReplayerContext()

	const params = buildSessionParams({ session, levels, sources })

	const { data, loading } = useGetSessionLogsQuery({
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

	const messagesToRender = useMemo(() => {
		if (!data?.sessionLogs) {
			return []
		}

		if (filter !== '') {
			return data.sessionLogs.filter((logEdge) => {
				if (!logEdge.node.message) {
					return false
				}

				return logEdge.node.message
					.toLocaleLowerCase()
					.includes(filter.toLocaleLowerCase())
			})
		}

		return data.sessionLogs
	}, [filter, data?.sessionLogs])

	// Logic for scrolling to current entry.
	useEffect(() => {
		if (state !== ReplayerState.Playing || !autoScroll) {
			return
		}
		if (messagesToRender.length) {
			let cursor = ''
			let msgDiff: number = Number.MAX_VALUE
			for (let i = 0; i < messagesToRender.length; i++) {
				const currentDiff: number =
					time -
					(new Date(messagesToRender[i].node.timestamp).getTime() -
						new Date(messagesToRender[0].node.timestamp).getTime())
				if (currentDiff < 0) break
				if (currentDiff < msgDiff) {
					cursor = messagesToRender[i].cursor
					msgDiff = currentDiff
				}
			}
			setSelectedCursor(cursor)
		}
	}, [state, time, messagesToRender, autoScroll])

	const virtuoso = useRef<VirtuosoHandle>(null)

	const foundIndex = useMemo(() => {
		return messagesToRender.findIndex(
			(logEdge) => logEdge.cursor === selectedCursor,
		)
	}, [messagesToRender, selectedCursor])

	useEffect(() => {
		if (
			isPlayerReady && // ensure Virtuoso component is actually rendered
			virtuoso.current &&
			messagesToRender
		) {
			if (foundIndex >= 0) {
				virtuoso.current.scrollToIndex({
					index: foundIndex,
					align: 'center',
					// Using smooth has performance issues with large lists
					// See: https://virtuoso.dev/scroll-to-index/
					// behavior: 'smooth'
				})

				if (state === ReplayerState.Paused) {
					// We really only want this run when the component is mounted
					// and we are trying to set the player time based on what the log cursor
					// query param is.
					const timestamp =
						new Date(
							messagesToRender[foundIndex].node.timestamp,
						).getTime() - sessionMetadata.startTime
					setTime(timestamp)
				}
			}
		}
	}, [
		autoScroll,
		foundIndex,
		isPlayerReady,
		messagesToRender,
		selectedCursor,
		sessionMetadata.startTime,
		setTime,
		state,
	])

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
							onSelect={() => {
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
	onSelect,
	current,
}: {
	logEdge: SessionLogEdge
	onSelect: () => void
	current?: boolean
}) {
	return (
		<Box
			cssClass={clsx(
				styles.consoleRow,
				styles.messageRowVariants({
					current,
				}),
			)}
			borderBottom="dividerWeak"
			py="8"
		>
			<Stack direction="row">
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
						size="small"
						iconRight={<IconSolidArrowCircleRight />}
						onClick={onSelect}
					>
						Go to
					</Tag>
				</Box>
			</Stack>
		</Box>
	)
})
