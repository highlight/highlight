import { Box, Text } from '@highlight-run/ui'
import { ReactComponent as CircleRightArrow } from '@icons/Solid/arrow-circle-right.svg'
import { ReactComponent as ChevronLeftIcon } from '@icons/Solid/cheveron-left.svg'
import { ReactComponent as ChevronRightIcon } from '@icons/Solid/cheveron-right.svg'
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
import { formatTimeAsHMS, MillisToMinutesAndSeconds } from '@util/time'
import { message } from 'antd'
import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import style from './TimelinePopover.module.scss'

interface Props {
	bucket: EventBucket
}

const POPOVER_CONTENT_MAX_HEIGHT = 250
const POPOVER_CONTENT_ROW_HEIGHT = 28

const TimelinePopover = ({ bucket }: Props) => {
	const navigate = useNavigate()
	const location = useLocation()

	const { setActiveError, setRightPanelView } = usePlayerUIContext()
	const { setCurrentEvent, pause, errors, isPlayerReady } =
		useReplayerContext()
	const {
		setShowRightPanel,
		setShowDevTools,
		setSelectedDevToolsTab,
		setSelectedRightPlayerPanelTab,
	} = usePlayerConfiguration()

	const { activeError } = usePlayerUIContext()

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
			setShowDevTools(true)
			setSelectedDevToolsTab(Tab.Errors)
			const error = errors.find(
				(error) => error.error_group_secure_id === identifier,
			)
			if (error) {
				setShowRightPanel(true)
				setActiveError(error)
				setRightPanelView(RightPanelView.Error)
			}
		} else {
			setShowRightPanel(true)
			setSelectedRightPlayerPanelTab(RightPlayerPanelTabType.Events)
			setCurrentEvent(identifier)
		}
		message.success(
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
						<CircleRightArrow
							className={clsx(
								style.transitionIcon,
								style.rightActionIcon,
							)}
						/>
					</button>
				) : (
					<button className={style.actionButton}>
						<ChevronLeftIcon
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
										<ChevronRightIcon
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
						itemContent={(_, identifier: string) => {
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
											<CircleRightArrow
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
