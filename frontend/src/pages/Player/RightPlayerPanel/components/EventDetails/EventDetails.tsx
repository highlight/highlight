import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { PreviousNextGroup } from '@components/PreviousNextGroup/PreviousNextGroup'
import { TableList } from '@components/TableList/TableList'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidX,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import {
	EVENT_TYPES_TO_COLORS,
	EVENT_TYPES_TO_VARIANTS,
} from '@pages/Player/components/EventStreamV2/StreamEventV2/StreamEventV2'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import WebVitalSimpleRenderer from '@pages/Player/StreamElement/Renderers/WebVitals/WebVitalRender'
import { getEventRenderDetails } from '@pages/Player/StreamElement/StreamElement'
import {
	getTimelineEventDisplayName,
	getTimelineEventTooltipText,
} from '@pages/Player/utils/utils'
import analytics from '@util/analytics'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

const EventDetails = React.memo(({ event }: { event: HighlightEvent }) => {
	const { sessionMetadata, eventsForTimelineIndicator } = useReplayerContext()
	const { setActiveEvent } = usePlayerUIContext()
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const details = getEventRenderDetails(event)
	const timeSinceStart = Math.max(
		event?.timestamp - sessionMetadata.startTime,
		0,
	)
	const displayName = getTimelineEventDisplayName(details.title || '')
	let payload = (event.data as { payload: any }).payload
	try {
		payload = JSON.parse(payload)
	} catch (e) {}

	const eventIdx = eventsForTimelineIndicator.findIndex(
		(e) => e.identifier === event.identifier,
	)
	const [prev, next] = [eventIdx - 1, eventIdx + 1]
	const canMoveBackward = !!eventsForTimelineIndicator[prev]
	const canMoveForward = !!eventsForTimelineIndicator[next]

	useHotkeys(
		'h',
		() => {
			if (canMoveBackward) {
				analytics.track('PrevSessionEventKeyboardShortcut')
				setActiveEvent(eventsForTimelineIndicator[prev])
			}
		},
		[canMoveBackward, prev],
	)

	useHotkeys(
		'l',
		() => {
			if (canMoveForward) {
				analytics.track('NextSessionEventKeyboardShortcut')
				setActiveEvent(eventsForTimelineIndicator[next])
			}
		},
		[canMoveForward, next],
	)

	return (
		<Box display="flex" flexDirection="column" width="full" height="full">
			<Box
				py="6"
				px="8"
				display="flex"
				align="center"
				justifyContent="space-between"
			>
				<Box display="flex" gap="6" alignItems="center">
					<PreviousNextGroup
						onPrev={() =>
							setActiveEvent(eventsForTimelineIndicator[prev])
						}
						canMoveBackward={canMoveBackward}
						prevShortcut="h"
						onNext={() =>
							setActiveEvent(eventsForTimelineIndicator[next])
						}
						canMoveForward={canMoveForward}
						nextShortcut="l"
					/>
					<Text size="xSmall" weight="medium" color="weak">
						{eventIdx + 1} / {eventsForTimelineIndicator.length}
					</Text>
				</Box>
				<ButtonIcon
					kind="secondary"
					size="small"
					shape="square"
					emphasis="low"
					icon={
						<IconSolidX
							color={
								vars.theme.interactive.fill.secondary.content
									.text
							}
						/>
					}
					onClick={() => {
						setActiveEvent(undefined)
					}}
				/>
			</Box>
			<Box pt="8" pr="12" pb="8" pl="12">
				<Text lines="1">{details.displayValue}</Text>
			</Box>
			<Box display="flex" pt="8" pr="12" pb="8" pl="12" gap="4">
				<Badge
					size="small"
					variant={EVENT_TYPES_TO_VARIANTS[displayName]}
					label={displayName}
					iconEnd={
						<Box
							display="flex"
							alignItems="center"
							style={{ width: 12, height: 12 }}
						>
							<InfoTooltip
								color={EVENT_TYPES_TO_COLORS[displayName]}
								title={getTimelineEventTooltipText(
									details.title || '',
								)}
							/>
						</Box>
					}
				/>
				<Tag
					kind="secondary"
					size="medium"
					emphasis="high"
					shape="basic"
				>
					<Text>
						{showPlayerAbsoluteTime
							? playerTimeToSessionAbsoluteTime({
									sessionStartTime: sessionMetadata.startTime,
									relativeTime: timeSinceStart,
								})
							: MillisToMinutesAndSeconds(timeSinceStart)}
					</Text>
				</Tag>
			</Box>
			<Box as="span" mr="12" ml="12" borderBottom="secondary" />
			{payload.vitals ? (
				<Box p="16">
					<WebVitalSimpleRenderer
						showDetailedView
						vitals={payload.vitals}
					/>
				</Box>
			) : (
				<Box display="flex" pt="8" pr="12" pb="8" pl="12">
					{typeof payload === 'object' ? (
						<TableList
							data={Object.entries(payload).map(([k, v]) => ({
								keyDisplayValue: k,
								valueDisplayValue: v as any,
							}))}
						/>
					) : (
						<TableList
							data={[
								{
									keyDisplayValue: 'Payload',
									valueDisplayValue:
										typeof payload === 'string'
											? payload
											: JSON.stringify(payload),
								},
							]}
						/>
					)}
				</Box>
			)}
		</Box>
	)
})

export default EventDetails
