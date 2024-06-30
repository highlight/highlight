import { toast } from '@components/Toaster'
import {
	Box,
	IconSolidArrowCircleRight,
	IconSolidCheveronLeft,
	IconSolidCheveronRight,
	Text,
} from '@highlight-run/ui/components'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import {
	EventsForTimeline,
	EventsForTimelineKeys,
	PlayerSearchParameters,
} from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { RightPlayerPanelTabType } from '@pages/Player/RightPlayerPanel/constants'
import { Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { EventBucket } from '@pages/Player/Toolbar/TimelineIndicators/TimelineIndicatorsBarGraph/TimelineIndicatorsBarGraph'
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import { getTimelineEventDisplayName } from '@pages/Player/utils/utils'
import { deserializeErrorIdentifier } from '@util/error'
import { formatTimeAsHMS, MillisToMinutesAndSeconds } from '@util/time'
import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import {
	RelatedError,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'

import style from './TimelinePopover.module.css'

interface Props {
	bucket: EventBucket
}

const POPOVER_CONTENT_MAX_HEIGHT = 250
const POPOVER_CONTENT_ROW_HEIGHT = 28

const TimelinePopover = ({ bucket }: Props) => {
	const navigate = useNavigate()
	const location = useLocation()

	const { setActiveEvent, setRightPanelView } = usePlayerUIContext()
	const { pause, errors, eventsForTimelineIndicator, isPlayerReady } =
		useReplayerContext()
	const {
		setShowRightPanel,
		setSelectedDevToolsTab,
		setSelectedRightPlayerPanelTab,
	} = usePlayerConfiguration()
	const { resource, set } = useRelatedResource()
	const relatedError = resource as RelatedError | undefined
	const activeError = useMemo(
		() =>
			errors.find(
				(error) =>
					error.error_group_secure_id === relatedError?.secureId,
			),
		[errors, relatedError?.secureId],
	)

	const [selectedType, setSelectedType] = useState<string | null>(null)

	useEffect(() => {
		if (
			isPlayerReady &&
			activeError?.error_group_secure_id &&
			bucket.identifier.Errors.includes(
				activeError?.error_group_secure_id as string,
			)
		) {
			setSelectedType('Errors')
		}
		// run once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPlayerReady])

	const selectedTypeName = selectedType
		? getTimelineEventDisplayName(selectedType)
		: ''
	const selectedCount = selectedType
		? bucket.identifier[selectedType].length
		: 0

	const eventTypes = useMemo(() => {
		const cats = EventsForTimeline.filter(
			(eventType) =>
				bucket.identifier[eventType] !== undefined &&
				bucket.identifier[eventType].length > 0,
		)
		cats.sort(
			(a, b) => bucket.identifier[b].length - bucket.identifier[a].length,
		)
		return cats
	}, [bucket.identifier])
	const virtuoso = useRef<VirtuosoHandle>(null)

	const onEventInstanceClick = (type: string, identifier: string) => {
		const timestamp = bucket.timestamp[identifier]

		pause(timestamp)
		if (type === 'Comments') {
			const urlSearchParams = new URLSearchParams()
			urlSearchParams.append(PlayerSearchParameters.commentId, identifier)
			navigate(`${location.pathname}?${urlSearchParams.toString()}`, {
				replace: true,
			})
			setShowRightPanel(true)
			setSelectedRightPlayerPanelTab(RightPlayerPanelTabType.Comments)
		} else if (type === 'Errors') {
			setSelectedDevToolsTab(Tab.Errors)
			const { errorId } = deserializeErrorIdentifier(identifier)
			const error = errors.find((error) => error.id === errorId)
			if (error) {
				set({
					type: 'error',
					secureId: error.error_group_secure_id,
					instanceId: error.id,
				})
			}
		} else {
			const event = eventsForTimelineIndicator.find(
				(event) => event.identifier === identifier,
			)
			setShowRightPanel(true)
			setSelectedRightPlayerPanelTab(RightPlayerPanelTabType.Events)
			setActiveEvent(event)
			setRightPanelView(RightPanelView.Event)
		}
		toast.success(
			`Changed player time to show you ${type} at ${MillisToMinutesAndSeconds(
				timestamp,
			)}`,
		)
	}

	return (
		<div className={style.timelinePopoverContent}>
			<div
				className={clsx(style.timelinePopoverHeader, style.infoPanel)}
				onClick={() => {
					if (selectedType) {
						setSelectedType(null)
					} else {
						pause(bucket.startTime)
					}
				}}
			>
				{!selectedType ? (
					<button className={style.actionButton}>
						<span>Go to timestamp</span>
						<span className={style.rightCounter}>
							{formatTimeAsHMS(bucket.startTime)}
						</span>
						<IconSolidArrowCircleRight
							className={clsx(
								style.transitionIcon,
								style.rightActionIcon,
							)}
						/>
					</button>
				) : (
					<button className={style.actionButton}>
						<IconSolidCheveronLeft
							className={clsx(
								style.transitionIcon,
								style.leftActionIcon,
							)}
						/>
						<span>Back to event categories</span>
					</button>
				)}
			</div>
			{!!selectedType ? (
				<Box cssClass={style.infoPanel} background="n2">
					<Text color="n11" size="xxSmall">
						{selectedTypeName}
					</Text>
					<div
						className={clsx(
							style.rightCounter,
							style.infoPanelCounter,
						)}
					>
						<Text color="n11" size="xxSmall">
							{selectedCount}
						</Text>
					</div>
				</Box>
			) : null}
			<div className={style.timelinePopoverDetails}>
				{!selectedType ? (
					eventTypes.map((eventType) => {
						const count = bucket.identifier[eventType].length
						const name = getTimelineEventDisplayName(eventType)
						const color = `var(${getAnnotationColor(eventType)})`
						return (
							<div
								className={style.eventTypeRow}
								style={{ height: POPOVER_CONTENT_ROW_HEIGHT }}
								key={eventType}
								onClick={(ev) => {
									ev.preventDefault()
									ev.stopPropagation()
									setSelectedType(eventType)
								}}
							>
								<button className={style.actionButton}>
									<span
										className={style.eventTypeIcon}
										style={{ background: color }}
									/>
									<span
										className={clsx(
											style.rightActionIcon,
											style.eventIdentifier,
										)}
									>
										{name}
									</span>
									<div className={style.rightCounter}>
										<span>{count}</span>
										<IconSolidCheveronRight
											className={clsx(
												style.transitionIcon,
												style.rightActionIcon,
											)}
										/>
									</div>
								</button>
							</div>
						)
					})
				) : (
					<Virtuoso
						ref={virtuoso}
						overscan={500}
						style={{
							height: Math.min(
								POPOVER_CONTENT_MAX_HEIGHT,
								POPOVER_CONTENT_ROW_HEIGHT *
									bucket.identifier[selectedType].length,
							),
						}}
						data={bucket.identifier[selectedType]}
						itemContent={(idx, identifier) => {
							const color = `var(${getAnnotationColor(
								selectedType as EventsForTimelineKeys[number],
							)})`
							const timestamp = bucket.timestamp[identifier]
							return (
								<div
									className={style.eventTypeRow}
									key={identifier}
									onClick={() =>
										onEventInstanceClick(
											selectedType,
											identifier,
										)
									}
									style={{
										height: POPOVER_CONTENT_ROW_HEIGHT,
									}}
								>
									<button className={style.actionButton}>
										<span
											className={style.eventTypeIcon}
											style={{ background: color }}
										/>
										<span
											className={clsx(
												style.rightActionIcon,
												style.eventIdentifier,
											)}
										>
											{bucket.details[identifier]}
										</span>
										<div className={style.rightCounter}>
											<span>
												{formatTimeAsHMS(timestamp)}
											</span>
											<IconSolidArrowCircleRight
												className={clsx(
													style.transitionIcon,
													style.rightActionIcon,
												)}
											/>
										</div>
									</button>
								</div>
							)
						}}
					/>
				)}
			</div>
		</div>
	)
}

export default TimelinePopover
