import LoadingBox from '@components/LoadingBox'
import { Log, LogLevel, LogSource } from '@graph/schemas'
import {
	Box,
	IconSolidArrowCircleRight,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { COLOR_MAPPING } from '@pages/LogsPage/constants'
import { THROTTLED_UPDATE_MS } from '@pages/Player/PlayerHook/PlayerState'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import {
	findLastActiveEventIndex,
	Tab,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import clsx from 'clsx'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { useGetSessionLogsQuery } from '@/graph/generated/hooks'
import { buildSessionParams } from '@/pages/LogsPage/utils'
import { styledVerticalScrollbar } from '@/style/common.css'
import analytics from '@/util/analytics'

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
	const [, setSelectedCursor] = useState(logCursor)
	const { session, time, setTime, sessionMetadata, isPlayerReady } =
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

	const messageNodes = messagesToRender.map((message) => {
		return message.node
	})

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

	const virtuoso = useRef<VirtuosoHandle>(null)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const scrollFunction = useCallback(
		_.debounce((index: number) => {
			requestAnimationFrame(() => {
				if (virtuoso.current) {
					virtuoso.current.scrollToIndex({
						index,
						align: 'center',
					})
				}
			})
		}, THROTTLED_UPDATE_MS),
		[],
	)

	useEffect(() => {
		if (
			isPlayerReady && // ensure Virtuoso component is actually rendered
			virtuoso.current &&
			messagesToRender
		) {
			if (autoScroll) {
				if (lastActiveLogIndex >= 0) {
					scrollFunction(lastActiveLogIndex)
				}
			}
		}
	}, [
		lastActiveLogIndex,
		isPlayerReady,
		messagesToRender,
		scrollFunction,
		autoScroll,
	])

	return (
		<Box height="full">
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
							current={_index === lastActiveLogIndex}
							past={_index <= lastActiveLogIndex}
							onSelect={() => {
								setSelectedCursor(logEdge.cursor)
								const timestamp =
									new Date(logEdge.node.timestamp).getTime() -
									sessionMetadata.startTime
								setTime(timestamp)
								analytics.track('session_go-to-log_click')
							}}
						/>
					)}
				/>
			) : (
				<Box p="8" height="full">
					<EmptyDevToolsCallout kind={Tab.Console} filter={filter} />
				</Box>
			)}
		</Box>
	)
}

const MessageRow = React.memo(function ({
	logEdge,
	onSelect,
	current,
	past,
}: {
	logEdge: SessionLogEdge
	onSelect: () => void
	current?: boolean
	past: boolean
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
			pl="8"
			style={{
				opacity: past ? 1 : 0.4,
			}}
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
