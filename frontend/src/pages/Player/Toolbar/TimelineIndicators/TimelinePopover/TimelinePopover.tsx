import { ReactComponent as CircleRightArrow } from '@icons/Solid/arrow-circle-right.svg'
import { ReactComponent as ChevronLeftIcon } from '@icons/Solid/cheveron-left.svg'
import { ReactComponent as ChevronRightIcon } from '@icons/Solid/cheveron-right.svg'
import { ReactComponent as CollectionIcon } from '@icons/Solid/collection.svg'
import {
	EventsForTimeline,
	EventsForTimelineKeys,
	PlayerSearchParameters,
} from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { RightPlayerPanelTabType } from '@pages/Player/RightPlayerPanel/constants'
import { DevToolTabType } from '@pages/Player/Toolbar/DevToolsContext/DevToolsContext'
import { getTimelineEventDisplayName } from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings'
import { EventBucket } from '@pages/Player/Toolbar/TimelineIndicators/TimelineIndicatorsBarGraph/TimelineIndicatorsBarGraph'
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import { formatTimeAsHMS } from '@util/time'
import classNames from 'classnames'
import { useMemo, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import style from './TimelinePopover.module.scss'

interface Props {
	bucket: EventBucket
}

const POPOVER_CONTENT_MAX_HEIGHT = 250
const POPOVER_CONTENT_ROW_HEIGHT = 28

const TimelinePopover = ({ bucket }: Props) => {
	const history = useHistory()
	const { setTime, setCurrentEvent } = useReplayerContext()
	const {
		setShowRightPanel,
		setShowLeftPanel,
		setShowDevTools,
		setSelectedDevToolsTab,
		setSelectedRightPlayerPanelTab,
	} = usePlayerConfiguration()
	const [selectedType, setSelectedType] = useState<string | null>(null)
	const selectedTypeName = selectedType
		? getTimelineEventDisplayName(selectedType)
		: ''
	const selectedCount = selectedType
		? bucket.identifier[selectedType].length
		: 0

	const eventTypes = useMemo(
		() =>
			EventsForTimeline.filter(
				(eventType) =>
					bucket.identifier[eventType] !== undefined &&
					bucket.identifier[eventType].length > 0,
			),
		[bucket.identifier],
	)
	const virtuoso = useRef<VirtuosoHandle>(null)

	return (
		<div className={style.timelinePopoverContent}>
			<div
				className={classNames(
					style.timelinePopoverHeader,
					style.infoPanel,
				)}
				onClick={() => {
					if (selectedType) {
						setSelectedType(null)
					} else {
						setTime(bucket.startTime)
					}
				}}
			>
				{!selectedType ? (
					<button className={style.actionButton}>
						<CircleRightArrow
							className={classNames(
								style.transitionIcon,
								style.leftActionIcon,
							)}
						/>
						<span>Go to timestamp</span>
						<span className={style.rightCounter}>
							{formatTimeAsHMS(bucket.startTime)}
						</span>
					</button>
				) : (
					<button className={style.actionButton}>
						<ChevronLeftIcon
							className={classNames(
								style.transitionIcon,
								style.leftActionIcon,
							)}
						/>
						<span>Back to event categories</span>
					</button>
				)}
			</div>
			{!!selectedType ? (
				<div className={style.infoPanel}>
					<CollectionIcon
						className={classNames(
							style.transitionIcon,
							style.leftActionIcon,
						)}
					/>
					<span>{selectedTypeName}</span>
					<div
						className={classNames(
							style.rightCounter,
							style.infoPanelCounter,
						)}
					>
						<span>{selectedCount}</span>
					</div>
				</div>
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
									<span className={style.rightActionIcon}>
										{name}
									</span>
									<div className={style.rightCounter}>
										<span>{count}</span>
										<ChevronRightIcon
											className={classNames(
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
					<>
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
								const onClick = () => {
									setTime(timestamp)
									if (selectedType === 'Comments') {
										const urlSearchParams =
											new URLSearchParams()
										urlSearchParams.append(
											PlayerSearchParameters.commentId,
											identifier,
										)
										history.replace(
											`${
												history.location.pathname
											}?${urlSearchParams.toString()}`,
										)
										setShowLeftPanel(false)
										setShowRightPanel(true)
										setSelectedRightPlayerPanelTab(
											RightPlayerPanelTabType.Comments,
										)
									} else if (selectedType === 'Errors') {
										setShowDevTools(true)
										setSelectedDevToolsTab(
											DevToolTabType.Errors,
										)
									} else {
										setShowLeftPanel(false)
										setShowRightPanel(true)
										setSelectedRightPlayerPanelTab(
											RightPlayerPanelTabType.Events,
										)
										setCurrentEvent(identifier)
									}
								}
								return (
									<div
										className={style.eventTypeRow}
										key={identifier}
										onClick={onClick}
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
												className={
													style.rightActionIcon
												}
											>
												{identifier}
											</span>
											<div className={style.rightCounter}>
												<span>
													{formatTimeAsHMS(timestamp)}
												</span>
												<ChevronRightIcon
													className={classNames(
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
					</>
				)}
			</div>
		</div>
	)
}

export default TimelinePopover
