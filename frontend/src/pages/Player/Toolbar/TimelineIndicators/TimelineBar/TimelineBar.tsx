import Button from '@components/Button/Button/Button'
import Popover from '@components/Popover/Popover'
import { getFullScreenPopoverGetPopupContainer } from '@pages/Player/context/PlayerUIContext'
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { getPlayerEventIcon } from '@pages/Player/StreamElement/StreamElement'
import timelineAnnotationStyles from '@pages/Player/Toolbar/TimelineAnnotation/TimelineAnnotation.module.scss'
import { getTimelineEventDisplayName } from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings'
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import { TooltipPlacement } from 'antd/lib/tooltip'
import classNames from 'classnames'
import { useLayoutEffect, useMemo, useState } from 'react'

import styles from './TimelineBar.module.scss'
export interface EventBucket {
	totalCount: number
	[props: string]: number | string
}

interface IBar {
	bucket: EventBucket
	left: number
	width: number
	height: number
	viewportRef: React.RefObject<HTMLElement>
}

const MIN_RECTANGLE_HEIGHT = 10
const TimelineIndicatorsBar = ({
	bucket,
	width,
	left,
	height,
	viewportRef,
}: IBar) => {
	const { setCurrentEvent } = useReplayerContext()
	const { setShowRightPanel, setShowLeftPanel } = usePlayerConfiguration()
	const data = useMemo(() => {
		const selectedEventTypes = EventsForTimeline.filter(
			(eventType) => bucket[eventType] !== undefined,
		)

		const barData = selectedEventTypes
			.map((eventType) => {
				const color = `var(${getAnnotationColor(eventType)})`
				const icon = getPlayerEventIcon(eventType)
				return {
					name: getTimelineEventDisplayName(eventType || ''),
					color,
					icon,
					count: bucket[eventType],
					firstId: bucket[`${eventType}Identifier`],
					percent:
						((bucket[eventType] as number) / bucket.totalCount) *
						100,
					eventType,
				}
			})
			.filter((rect) => rect.percent > 0)

		return barData
	}, [bucket])

	const [rightTooltipOffset, setRightTooltipOffset] = useState<number>(0)
	const [placement, setPlacement] = useState<TooltipPlacement>('top')
	const [relativePosition, setRelativePosition] = useState<number>(left)
	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		if (!viewportDiv) {
			return
		}
		const onPointermove = ({ clientX }: MouseEvent) => {
			const { offsetLeft, offsetWidth } = viewportDiv
			const relX =
				((clientX + document.documentElement.scrollLeft - offsetLeft) *
					100) /
				offsetWidth
			let relPos = 0
			for (const threshold of [66, 33]) {
				if (relX > threshold) {
					relPos = threshold + 1
					break
				}
			}
			setRelativePosition(relPos)
		}

		viewportDiv.addEventListener('pointermove', onPointermove)
		return () => {
			viewportDiv.removeEventListener('pointermove', onPointermove)
		}
	}, [viewportRef])

	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		if (!viewportDiv) {
			return
		}

		const offset = (viewportDiv.scrollWidth * (width / 100)) / 8
		if (relativePosition > 66) {
			setRightTooltipOffset(offset)
			setPlacement('topRight')
		} else if (relativePosition > 33) {
			setRightTooltipOffset(0)
			setPlacement('top')
		} else {
			setRightTooltipOffset(-offset)
			setPlacement('topLeft')
		}
	}, [relativePosition, viewportRef, width, viewportRef.current?.scrollWidth])

	const popoverContent = useMemo(() => {
		const rows = []
		for (const { icon, color, count, name, firstId, eventType } of data) {
			rows.push(
				<Button
					className={classNames(
						timelineAnnotationStyles.title,
						styles.eventAggregateTitle,
					)}
					trackingId="ViewEventDetail"
					type="text"
					key={name}
					onClick={() => {
						if (
							!!firstId &&
							!(
								eventType === 'Comments' ||
								eventType === 'Errors'
							)
						) {
							setCurrentEvent(firstId as string)
							setShowLeftPanel(false)
							setShowRightPanel(true)
						}
					}}
				>
					<span
						className={timelineAnnotationStyles.iconContainer}
						style={{
							background: color,
							width: 30,
							height: 30,
						}}
					>
						{icon}
					</span>
					{name}
					{count > 1 && ` x ${count}`}
				</Button>,
			)
		}
		return rows
	}, [data, setCurrentEvent, setShowLeftPanel, setShowRightPanel])

	const [isInsideBar, setIsInsideBar] = useState(false)
	const [isInsidePopover, setIsInsidePopover] = useState(false)
	const [isSelected, setIsSelected] = useState(false)
	useLayoutEffect(() => {
		const onPointerDown = () => {
			if (!(isInsideBar || isInsidePopover)) {
				setIsSelected(false)
			}
		}
		document.addEventListener('pointerdown', onPointerDown)

		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
		}
	}, [isInsideBar, isInsidePopover])

	return (
		<Popover
			getPopupContainer={getFullScreenPopoverGetPopupContainer}
			content={<>{popoverContent}</>}
			align={{
				overflow: {
					adjustY: false,
					adjustX: false,
				},
				offset: [rightTooltipOffset, 0],
			}}
			placement={placement}
			overlayClassName={styles.timelineBarPopoverContainer}
			visible={isSelected}
			onMouseEnter={() => setIsInsidePopover(true)}
			onMouseLeave={() => setIsInsidePopover(false)}
		>
			<div
				className={classNames(styles.bar, {
					[styles.isShaded]: isInsideBar,
				})}
				style={{
					width: `${width}%`,
					left: `${left}%`,
				}}
				onPointerEnter={() => setIsInsideBar(true)}
				onPointerLeave={() => setIsInsideBar(false)}
				onPointerDown={() => setIsSelected(true)}
			>
				<div
					className={styles.rectangleContainer}
					style={{
						height: `calc(max(${height}%, ${
							MIN_RECTANGLE_HEIGHT * data.length
						}px))`,
					}}
				>
					{data.map((rect, idx) => {
						return (
							<div
								className={styles.barRectangle}
								style={{
									background: rect.color,
									height: `calc(max(${rect.percent}%, ${MIN_RECTANGLE_HEIGHT}px))`,
									marginBottom:
										idx === data.length - 1 ? 0 : undefined,
								}}
								key={idx}
							></div>
						)
					})}
				</div>
			</div>
		</Popover>
	)
}

export default TimelineIndicatorsBar
