import LoadingBox from '@components/LoadingBox'
import { Log, LogLevel, LogSource } from '@graph/schemas'
import { playerMetaData } from '@highlight-run/rrweb-types'
import {
	Box,
	IconSolidArrowCircleRight,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { COLOR_MAPPING } from '@pages/LogsPage/constants'
import { buildSessionParams } from '@pages/LogsPage/SearchForm/utils'
import { ReplayerState } from '@pages/Player/ReplayerContext'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import { Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import clsx from 'clsx'
import _ from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { useGetSessionLogsQuery } from '@/graph/generated/hooks'
import { styledVerticalScrollbar } from '@/style/common.css'

import { useReplayerContext } from '../../../ReplayerContext'
import * as styles from './style.css'

type SessionLog = Pick<Log, 'timestamp' | 'message' | 'level'>
type SessionLogEdge = { cursor: string; node: SessionLog }

export const ConsolePage = ({
	autoScroll,
	filter,
	sources,
	levels,
	time,
}: {
	autoScroll: boolean
	filter: string
	sources: LogSource[]
	levels: LogLevel[]
	time: number
}) => {
	const { projectId } = useProjectId()
	const [selectedCursor, setSelectedCursor] = useState('')
	const { session, setTime, sessionMetadata, isPlayerReady, state } =
		useReplayerContext()

	const { data, loading } = useGetSessionLogsQuery({
		variables: {
			params: buildSessionParams({ session, levels, sources }),
			project_id: projectId,
		},
		skip: !session?.created_at,
	})

	// Logic for scrolling to current entry.
	useEffect(() => {
		if (state !== ReplayerState.Playing) {
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
	}, [state, time, data?.sessionLogs])

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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const scrollFunction = useCallback(
		_.debounce((cursor: string) => {
			if (virtuoso.current) {
				const index = data?.sessionLogs.findIndex(
					(logEdge) => logEdge.cursor === cursor,
				)

				if (index) {
					virtuoso.current.scrollToIndex({
						index,
						align: 'center',
						behavior: 'smooth',
					})
				}
			}
		}, 1000 / 60),
		[],
	)

	useEffect(() => {
		if (autoScroll) {
			scrollFunction(selectedCursor)
		}
	}, [autoScroll, scrollFunction, selectedCursor])

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
							setTime={(time: number) => {
								setTime(time)
								setSelectedCursor(logEdge.cursor)
							}}
							sessionMetadata={sessionMetadata}
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
	current,
	sessionMetadata,
}: {
	logEdge: SessionLogEdge
	setTime: (time: number) => void
	current?: boolean
	sessionMetadata: playerMetaData
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
			mb="2"
		>
			<Stack direction="row">
				<Box flexGrow={1}>
					<Text
						family="monospace"
						color="secondaryContentOnEnabled"
						as="p"
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
							setTime(
								new Date(logEdge.node.timestamp).getDate() -
									sessionMetadata.startTime,
							)
						}}
					>
						Go to
					</Tag>
				</Box>
			</Stack>
		</Box>
	)
})
