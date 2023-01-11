import { EventType } from '@highlight-run/rrweb'
import { Badge, Box, Tag, Text } from '@highlight-run/ui'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { getEventRenderDetails } from '@pages/Player/StreamElement/StreamElement'
import { getTimelineEventDisplayName } from '@pages/Player/utils/utils'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import { message } from 'antd'

import * as styles from './StreamEventV2.css'

const EVENT_TYPES_TO_NOT_RENDER_TIME = ['Web Vitals']
export const EVENT_TYPES_TO_VARIANTS: {
	[key: string]:
		| 'red'
		| 'blue'
		| 'gray'
		| 'green'
		| 'grey'
		| 'purple'
		| 'white'
		| 'yellow'
		| 'outlineGrey'
} = {
	Click: 'purple',
	Focus: 'blue',
	Reload: 'green',
	Navigate: 'blue',
	Segment: 'green',
	Track: 'blue',
	Comments: 'green',
	Viewport: 'red',
	Identify: 'yellow',
	'Web Vitals': 'green',
	Referrer: 'yellow',
	'Tab State': 'grey',
	Errors: 'red',
}

export const StreamEventV2 = function ({
	e,
	start,
	isCurrent,
	onGoToHandler,
}: {
	e: HighlightEvent
	start: number
	isCurrent: boolean
	onGoToHandler: (event: string) => void
	isFirstCard: boolean
}) {
	const { pause } = useReplayerContext()
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const timeSinceStart = Math.max(e?.timestamp - start, 0)
	const details = getEventRenderDetails(e)
	const displayName = getTimelineEventDisplayName(details.title || '')
	const shouldShowTimestamp =
		e.type === EventType.Custom &&
		!EVENT_TYPES_TO_NOT_RENDER_TIME.includes(e.data.tag)
	return (
		<Box px="8" cursor="pointer">
			<Box
				cssClass={styles.variants({ current: isCurrent })}
				onClick={(e) => {
					// Stopping the event from propagating up to the parent button. This is to allow the element to stay opened when the user clicks on the GoToButton. Without this the element would close.
					e.stopPropagation()
					// Sets the current event as null. It will be reset as the player continues.
					onGoToHandler('')
					pause(timeSinceStart)

					message.success(
						`Changed player time showing you ${
							details.title
						} at ${MillisToMinutesAndSeconds(timeSinceStart)}`,
					)
				}}
			>
				<Text lines="1" display="flex">
					{details.displayValue}
				</Text>
				<Box display="flex" alignItems="center" gap="4">
					<Badge
						size="small"
						variant={EVENT_TYPES_TO_VARIANTS[displayName]}
						label={displayName}
					/>
					{shouldShowTimestamp && (
						<Tag
							kind="secondary"
							size="small"
							emphasis="high"
							shape="basic"
						>
							<Text>
								{showPlayerAbsoluteTime
									? playerTimeToSessionAbsoluteTime({
											sessionStartTime: start,
											relativeTime: timeSinceStart,
									  })
									: MillisToMinutesAndSeconds(timeSinceStart)}
							</Text>
						</Tag>
					)}
				</Box>
			</Box>
		</Box>
	)
}
