import {
	Box,
	IconSolidArrowNarrowDown,
	IconSolidArrowNarrowUp,
	IconSolidChevronDoubleLeft,
	IconSolidChevronDoubleRight,
	IconSolidExclamation,
	Text,
	vars,
} from '@highlight-run/ui'
import { useMemo, useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@/pages/Player/ReplayerContext'
import { styledVerticalScrollbar } from '@/style/common.css'
import { playerTimeToSessionAbsoluteTime } from '@/util/session/utils'
import { MillisToMinutesAndSeconds } from '@/util/time'

import * as styles from './WebSocketMessages.css'

export const WebSocketMessages = ({ events, startEvent }: any) => {
	const virtuoso = useRef<VirtuosoHandle>(null)
	const { sessionMetadata } = useReplayerContext()
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const startTime = sessionMetadata.startTime

	const eventsToRender = useMemo(() => {
		return [startEvent, ...events]
	}, [events, startEvent])

	return (
		<Box className={styles.container}>
			<Box className={styles.websocketHeader}>
				<Box></Box>
				<Box color="weak" py="6" px="8">
					<Text size="xxSmall">Data</Text>
				</Box>
				<Box color="weak" py="6" px="8">
					<Text size="xxSmall">Length</Text>
				</Box>
				<Box color="weak" py="6" px="8">
					<Text size="xxSmall">Time</Text>
				</Box>
			</Box>
			<Box className={styles.networkBox}>
				<Virtuoso
					ref={virtuoso}
					overscan={1024}
					increaseViewportBy={1024}
					className={styledVerticalScrollbar}
					components={{
						ScrollSeekPlaceholder: () => (
							<div
								style={{
									height: 36,
								}}
							/>
						),
					}}
					scrollSeekConfiguration={{
						enter: (v) => v > 512,
						exit: (v) => v < 128,
					}}
					data={eventsToRender}
					itemContent={(index, resource) => {
						return (
							<WebSocketRow
								key={index.toString()}
								resource={resource}
								playerStartTime={startTime}
								showPlayerAbsoluteTime={showPlayerAbsoluteTime}
								gray={index % 2 === 0}
							/>
						)
					}}
				/>
			</Box>
		</Box>
	)
}

interface WebSocketRowProps {
	resource: any
	playerStartTime: number
	showPlayerAbsoluteTime?: boolean
	gray: boolean
}

const WebSocketRequestTypeIcon: { [k: string]: JSX.Element } = {
	sent: (
		<IconSolidArrowNarrowUp
			size={14}
			color={vars.theme.static.content.sentiment.good}
		/>
	),
	received: (
		<IconSolidArrowNarrowDown
			size={14}
			color={vars.theme.static.content.sentiment.bad}
		/>
	),
	open: <IconSolidChevronDoubleRight size={14} />,
	close: <IconSolidChevronDoubleLeft size={14} />,
	error: <IconSolidExclamation size={14} />,
}

const getWebSocketEventTime = (event: any) => {
	return event.type === 'open'
		? event.startTime
		: event.type === 'close'
		? event.requestEnd
		: event.timeStamp
}

const getWebSocketEventMessage = (event: any) => {
	return event.type === 'open'
		? 'Websocket connection has been opened'
		: event.type === 'close'
		? 'Websocket connection has been closed'
		: event.message
}

const getWebSocketEventSize = (event: any) => {
	return event.type === 'open' ? '' : event.type === 'close' ? '' : event.size
}

const WebSocketRow = ({
	resource,
	gray,
	playerStartTime,
	showPlayerAbsoluteTime,
}: WebSocketRowProps) => {
	return (
		<Box>
			<Box
				borderBottom="dividerWeak"
				cssClass={styles.websocketRowVariants({
					gray,
				})}
			>
				<Box color="secondaryContentText" pl="4" display="flex">
					{WebSocketRequestTypeIcon[String(resource.type) || 'error']}
				</Box>
				<Box color="secondaryContentText" px="8">
					<Text size="small" weight="medium" lines="1">
						{getWebSocketEventMessage(resource)}
					</Text>
				</Box>
				<Box color="secondaryContentText" px="8">
					<Text size="small" weight="medium" lines="1">
						{getWebSocketEventSize(resource)}
					</Text>
				</Box>
				<Box color="secondaryContentText" px="8">
					<Text size="small" weight="medium" lines="1">
						{showPlayerAbsoluteTime
							? playerTimeToSessionAbsoluteTime({
									sessionStartTime: playerStartTime,
									relativeTime:
										getWebSocketEventTime(resource),
							  })
							: MillisToMinutesAndSeconds(
									getWebSocketEventTime(resource),
							  )}
					</Text>
				</Box>
			</Box>
		</Box>
	)
}
