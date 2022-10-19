import Popover from '@components/Popover/Popover'
import { getFullScreenPopoverGetPopupContainer } from '@pages/Player/context/PlayerUIContext'
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils'
import { getTimelineEventDisplayName } from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings'
import { EventBucket } from '@pages/Player/Toolbar/TimelineIndicators/TimelineIndicatorsBarGraph/TimelineIndicatorsBarGraph'
import TimelinePopover from '@pages/Player/Toolbar/TimelineIndicators/TimelinePopover/TimelinePopover'
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import { clamp } from '@util/numbers'
import { TooltipPlacement } from 'antd/lib/tooltip'
import classNames from 'classnames'
import { useLayoutEffect, useMemo, useState } from 'react'

import styles from './TimelineBar.module.scss'

interface IBar {
	bucket: EventBucket
	width: number
	height: number
	viewportRef: React.RefObject<HTMLElement>
}

const MIN_RECTANGLE_HEIGHT = 10
const TimelineIndicatorsBar = ({
	bucket,
	width,
	height,
	viewportRef,
}: IBar) => {
	const data = useMemo(() => {
		const selectedEventTypes = EventsForTimeline.filter(
			(eventType) => bucket.identifier[eventType] !== undefined,
		)

		const barData = selectedEventTypes
			.map((eventType) => {
				const color = `var(${getAnnotationColor(eventType)})`
				return {
					name: getTimelineEventDisplayName(eventType || ''),
					color,
					count: bucket.identifier[eventType].length,
					firstId: bucket.identifier[eventType][0],
					percent:
						(bucket.identifier[eventType].length /
							bucket.totalCount) *
						100,
					eventType,
				}
			})
			.filter((rect) => rect.percent > 0)

		return barData
	}, [bucket])

	const [isInsideBar, setIsInsideBar] = useState(false)
	const [isInsidePopover, setIsInsidePopover] = useState(false)
	const [isSelected, setIsSelected] = useState(false)
	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		if (!viewportDiv) {
			return
		}

		const onScroll = () => {
			setIsSelected(false)
		}

		const onPointerDown = () => {
			if (!(isInsideBar || isInsidePopover)) {
				setIsSelected(false)
			}
		}

		document.addEventListener('pointerdown', onPointerDown)
		viewportDiv.addEventListener('scroll', onScroll)

		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			viewportDiv.removeEventListener('scroll', onScroll)
		}
	}, [isInsideBar, isInsidePopover, viewportRef, width])

	const tooltipPosition = useMemo(() => {
		const viewportDiv = viewportRef.current
		if (!viewportDiv) {
			return {
				rightOffset: 0,
				placement: 'top' as TooltipPlacement,
			}
		}
		const viewportBbox = viewportDiv.getBoundingClientRect()
		const { scrollWidth, scrollLeft } = viewportDiv

		const barLeft = (bucket.startPercent * scrollWidth) / 100 - scrollLeft

		const relX = clamp((barLeft / viewportBbox.width) * 100, 0, 100)

		let relPos = 2
		for (const threshold of [66, 33]) {
			if (relX >= threshold) {
				break
			}
			relPos -= 1
		}

		// move by the 8th of the bar width
		let offset = (scrollWidth * (width / 100)) / 8

		let placement: TooltipPlacement = 'top'
		if (relPos === 2) {
			placement = 'topRight'
		} else if (relPos === 1) {
			offset = 0
			placement = 'top'
		} else {
			offset *= -1
			placement = 'topLeft'
		}
		return {
			rightOffset: offset,
			placement: placement,
		}
		// disable checks to update on scroll
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [viewportRef, viewportRef.current?.scrollLeft, width])

	return (
		<Popover
			getPopupContainer={getFullScreenPopoverGetPopupContainer}
			content={<TimelinePopover bucket={bucket} />}
			align={{
				overflow: {
					adjustY: false,
					adjustX: false,
				},
				offset: [tooltipPosition.rightOffset, -42],
			}}
			placement={tooltipPosition.placement}
			overlayClassName={styles.timelineBarPopoverContainer}
			visible={isSelected}
			onMouseEnter={() => setIsInsidePopover(true)}
			onMouseLeave={() => setIsInsidePopover(false)}
			showArrow={false}
			destroyTooltipOnHide
		>
			<div
				className={classNames(styles.bar, {
					[styles.isShaded]: isInsideBar || isSelected,
				})}
				style={{
					width: `${width}%`,
					left: `${bucket.startPercent}%`,
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
