import {
	Box,
	IconSolidArrowNarrowDown,
	IconSolidArrowNarrowUp,
	IconSolidChevronDoubleLeft,
	IconSolidChevronDoubleRight,
	IconSolidExclamation,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import moment from 'moment'
import { useRef, type JSX } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import LoadingBox from '@/components/LoadingBox'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@/pages/Player/ReplayerContext'
import { styledVerticalScrollbar } from '@/style/common.css'
import { MillisToMinutesAndSeconds } from '@/util/time'

import * as styles from './WebSocketMessages.css'

export const WebSocketMessages = ({ events, eventsLoading }: any) => {
	const virtuoso = useRef<VirtuosoHandle>(null)
	const { sessionMetadata } = useReplayerContext()
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const startTime = sessionMetadata.startTime

	return eventsLoading ? (
		<LoadingBox />
	) : (
		<Box cssClass={styles.container}>
			<Box cssClass={styles.websocketHeader}>
				<Box></Box>
				<Box color="weak" py="6" px="8" borderRight="dividerWeak">
					<Text size="xxSmall">Data</Text>
				</Box>
				<Box color="weak" py="6" px="8" borderRight="dividerWeak">
					<Text size="xxSmall">Length</Text>
				</Box>
				<Box color="weak" py="6" px="8">
					<Text size="xxSmall">Time</Text>
				</Box>
			</Box>
			<Box cssClass={styles.networkBox}>
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
					data={events}
					itemContent={(index, resource) => {
						return (
							<WebSocketRow
								key={index.toString()}
								resource={resource}
								playerStartTime={startTime}
								showPlayerAbsoluteTime={showPlayerAbsoluteTime}
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

const getWebSocketEventTime = (event: any, sessionStart: number) => {
	return event.type === 'open'
		? (event.startTimeAbs ?? event.startTime + sessionStart)
		: event.type === 'close'
			? (event.requestEndAbs ?? event.requestEnd + sessionStart)
			: event.timeStamp
}

const getWebSocketEventMessage = (event: any) => {
	return event.type === 'open'
		? 'Websocket connection has been opened'
		: event.type === 'close'
			? 'Websocket connection has been closed'
			: event.type === 'error'
				? 'Error'
				: event.message
}

const getWebSocketEventSize = (event: any) => {
	return event.type === 'open' || event.type === 'close' ? '' : event.size
}

const WebSocketRow = ({
	resource,
	playerStartTime,
	showPlayerAbsoluteTime,
}: WebSocketRowProps) => {
	return (
		<Box>
			<Box
				borderBottom="dividerWeak"
				cssClass={styles.websocketRowVariants()}
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
							? moment(
									getWebSocketEventTime(
										resource,
										playerStartTime,
									),
								).format('h:mm:ss A')
							: MillisToMinutesAndSeconds(
									getWebSocketEventTime(
										resource,
										playerStartTime,
									) - playerStartTime,
								)}
					</Text>
				</Box>
			</Box>
		</Box>
	)
}
