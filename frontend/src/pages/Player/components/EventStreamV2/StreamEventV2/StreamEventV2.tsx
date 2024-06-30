import { toast } from '@components/Toaster'
import { colors } from '@highlight-run/ui/colors'
import {
	Badge,
	Box,
	IconSolidArrowCircleRight,
	Text,
} from '@highlight-run/ui/components'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { getEventRenderDetails } from '@pages/Player/StreamElement/StreamElement'
import { getTimelineEventDisplayName } from '@pages/Player/utils/utils'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import { EventType } from 'rrweb'

import * as styles from './StreamEventV2.css'

const EVENT_TYPES_TO_NOT_RENDER_TIME = ['Web Vitals']
export const EVENT_TYPES_TO_VARIANTS: {
	[key: string]:
		| 'red'
		| 'blue'
		| 'green'
		| 'gray'
		| 'purple'
		| 'white'
		| 'yellow'
		| 'outlineGray'
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
	'Tab State': 'gray',
	Errors: 'red',
}
export const EVENT_TYPES_TO_COLORS: {
	[key: string]: string
} = {
	Click: colors.p9,
	Focus: colors.lb700,
	Reload: colors.g9,
	Navigate: colors.lb700,
	Segment: colors.g9,
	Track: colors.lb700,
	Comments: colors.g9,
	Viewport: colors.r9,
	Identify: colors.y9,
	'Web Vitals': colors.g9,
	Referrer: colors.y9,
	'Tab State': colors.n9,
	Errors: colors.r9,
}

export const StreamEventV2 = function ({
	event,
	start,
	isCurrent,
	onGoToHandler,
}: {
	event: HighlightEvent
	start: number
	isCurrent: boolean
	onGoToHandler: () => void
	isFirstCard: boolean
}) {
	const { pause } = useReplayerContext()
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const timeSinceStart = Math.max(event?.timestamp - start, 0)
	const details = getEventRenderDetails(event)
	const displayName = getTimelineEventDisplayName(details.title || '')
	const shouldShowTimestamp =
		event.type === EventType.Custom &&
		!EVENT_TYPES_TO_NOT_RENDER_TIME.includes(event.data.tag)
	return (
		<Box px="8" cursor="pointer">
			<Box
				cssClass={styles.variants({ current: isCurrent })}
				onClick={(e) => {
					// Stopping the event from propagating up to the parent button. This is to allow the element to stay opened when the user clicks on the GoToButton. Without this the element would close.
					e.stopPropagation()
					onGoToHandler()
					pause(timeSinceStart)

					toast.success(
						`Changed player time showing you ${
							details.title
						} at ${MillisToMinutesAndSeconds(timeSinceStart)}`,
					)
				}}
			>
				<Text lines="1" display="flex">
					{details.displayValue}
				</Text>
				<Box
					display="flex"
					alignItems="center"
					gap="4"
					justifyContent="space-between"
				>
					<Badge
						size="small"
						variant={EVENT_TYPES_TO_VARIANTS[displayName]}
						label={displayName}
					/>
					{shouldShowTimestamp && (
						<Box
							display="flex"
							alignItems="center"
							gap="2"
							justifyContent="space-between"
						>
							<Text size="xxSmall" color="secondaryContentText">
								{showPlayerAbsoluteTime
									? playerTimeToSessionAbsoluteTime({
											sessionStartTime: start,
											relativeTime: timeSinceStart,
									  })
									: MillisToMinutesAndSeconds(timeSinceStart)}
							</Text>
							<IconSolidArrowCircleRight
								className={styles.secondaryContent}
								onClick={(e) => {
									e.stopPropagation()
									pause(timeSinceStart)
									toast.success(
										`Changed player time showing you ${
											details.title
										} at ${MillisToMinutesAndSeconds(
											timeSinceStart,
										)}`,
									)
								}}
							/>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	)
}
