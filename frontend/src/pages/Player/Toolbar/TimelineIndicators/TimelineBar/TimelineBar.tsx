import Popover from '@components/Popover/Popover'
import { getFullScreenPopoverGetPopupContainer } from '@pages/Player/context/PlayerUIContext'
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils'
import { EventBucket } from '@pages/Player/Toolbar/TimelineIndicators/TimelineIndicatorsBarGraph/TimelineIndicatorsBarGraph'
import TimelinePopover from '@pages/Player/Toolbar/TimelineIndicators/TimelinePopover/TimelinePopover'
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import { getTimelineEventDisplayName } from '@pages/Player/utils/utils'
import { serializeErrorIdentifier } from '@util/error'
import { clamp } from '@util/numbers'
import { TooltipPlacement } from 'antd/es/tooltip'
import clsx from 'clsx'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'

import {
	RelatedError,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'
import { useReplayerContext } from '@/pages/Player/ReplayerContext'

import styles from './TimelineBar.module.css'

interface IBar {
	bucket: EventBucket
	width: number
	height: number
	disabled: boolean
	viewportRef: React.RefObject<HTMLElement | null>
}

const MIN_RECTANGLE_HEIGHT = 10
const TimelineIndicatorsBar = ({
	bucket,
	width,
	height,
	disabled,
	viewportRef,
}: IBar) => {
	const { resource } = useRelatedResource()
	const relatedError = resource as RelatedError | undefined
	const { errors } = useReplayerContext()
	const activeError = useMemo(
		() =>
			errors.find(
				(error) =>
					error.error_group_secure_id === relatedError?.secureId,
			),
		[errors, relatedError?.secureId],
	)

	const data = useMemo(() => {
		const selectedEventTypes = EventsForTimeline.filter(
			(eventType) => bucket.identifier[eventType] !== undefined,
		)

		const barData = selectedEventTypes
			.map((eventType) => {
				const color = disabled
					? 'rgba(111, 110, 119, 0.08)'
					: `var(${getAnnotationColor(eventType)})`

				return {
					name: getTimelineEventDisplayName(eventType || ''),
					color,
					count: bucket.identifier[eventType].length,
					percent:
						(bucket.identifier[eventType].length /
							bucket.totalCount) *
						100,
					eventType,
				}
			})
			.filter((rect) => rect.percent > 0)

		return barData
	}, [bucket, disabled])

	const [isInsideBar, setIsInsideBar] = useState(false)
	const [isInsidePopover, setIsInsidePopover] = useState(false)
	const [isSelected, setIsSelected] = useState(false)

	useEffect(() => {
		if (
			activeError?.error_group_secure_id &&
			bucket.identifier.Errors &&
			bucket.identifier.Errors.includes(
				serializeErrorIdentifier(activeError) as string,
			)
		) {
			setIsSelected(true)
		}
		// run once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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

	const viewportBbox = viewportRef.current?.getBoundingClientRect()

	const tooltipPosition = useMemo(() => {
		const viewportDiv = viewportRef.current
		if (!viewportDiv || !viewportBbox) {
			return {
				rightOffset: 0,
				placement: 'top' as TooltipPlacement,
			}
		}
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
	}, [viewportBbox, width])

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
				className={clsx(styles.bar, {
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
							/>
						)
					})}
				</div>
			</div>
		</Popover>
	)
}

export default TimelineIndicatorsBar
