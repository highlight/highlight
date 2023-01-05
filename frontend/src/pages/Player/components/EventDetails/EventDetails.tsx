import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import { TableList } from '@components/TableList/TableList'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	IconSolidX,
	Tag,
	Text,
	vars,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { getEventRenderDetails } from '@pages/Player/StreamElement/StreamElement'
import {
	getTimelineEventDisplayName,
	getTimelineEventTooltipText,
} from '@pages/Player/utils/utils'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import React from 'react'

import { EVENT_TYPES_TO_VARIANTS } from '../EventStreamV2/StreamEventV2/StreamEventV2'
import * as styles from './EventDetails.css'

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
	const payload = (event.data as { payload: any }).payload

	const eventIdx = eventsForTimelineIndicator.findIndex(
		(e) => e.identifier === event.identifier,
	)
	const [prev, next] = [eventIdx - 1, eventIdx + 1]

	return (
		<Box cssClass={styles.container}>
			<Box
				pt="6"
				pr="8"
				pb="6"
				pl="12"
				display="flex"
				align="center"
				justifyContent="space-between"
			>
				<Box
					display="flex"
					marginRight="8"
					style={{
						height: 28,
						width: 56,
					}}
				>
					<ButtonIcon
						kind="secondary"
						size="small"
						shape="square"
						emphasis="low"
						icon={
							<IconSolidCheveronUp size={14} color={colors.n11} />
						}
						title="k"
						disabled={!eventsForTimelineIndicator[prev]}
						onClick={() => {
							setActiveEvent(eventsForTimelineIndicator[prev])
						}}
					/>
					<Box as="span" borderRight="secondary" />
					<ButtonIcon
						kind="secondary"
						size="small"
						shape="square"
						emphasis="low"
						icon={
							<IconSolidCheveronDown
								size={14}
								color={colors.n11}
							/>
						}
						title="j"
						disabled={!eventsForTimelineIndicator[next]}
						onClick={() => {
							setActiveEvent(eventsForTimelineIndicator[next])
						}}
					/>
				</Box>
				<ButtonIcon
					kind="secondary"
					size="small"
					shape="square"
					emphasis="low"
					icon={
						<IconSolidX
							size={16}
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
				<Text>{details.displayValue}</Text>
			</Box>
			<Box display="flex" pt="8" pr="12" pb="8" pl="12" gap="4">
				<Badge
					size="medium"
					variant={EVENT_TYPES_TO_VARIANTS[displayName]}
					label={displayName}
					iconEnd={
						<Box
							display="flex"
							alignItems="center"
							style={{ width: 12, height: 12 }}
						>
							<InfoTooltip
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
		</Box>
	)
})

export default EventDetails
