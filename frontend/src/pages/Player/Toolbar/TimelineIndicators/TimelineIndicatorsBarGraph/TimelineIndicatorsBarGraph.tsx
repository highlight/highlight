import { Skeleton } from '@components/Skeleton/Skeleton'
import { customEvent } from '@highlight-run/rrweb/typings/types'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import {
	getCommentsForTimelineIndicator,
	getErrorsForTimelineIndicator,
} from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	ParsedEvent,
	ReplayerState,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import { getEventRenderDetails } from '@pages/Player/StreamElement/StreamElement'
import TimeIndicator from '@pages/Player/Toolbar/TimelineIndicators/TimeIndicator/TimeIndicator'
import TimelineBar from '@pages/Player/Toolbar/TimelineIndicators/TimelineBar/TimelineBar'
import ZoomArea from '@pages/Player/Toolbar/TimelineIndicators/ZoomArea/ZoomArea'
import {
	useToolbarItemsContext,
	ZoomAreaPercent,
} from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'
import { clamp } from '@util/numbers'
import { useParams } from '@util/react-router/useParams'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { formatTimeAsAlphanum, formatTimeAsHMS } from '@util/time'
import classNames from 'classnames'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Area, AreaChart } from 'recharts'
import { NumberParam, useQueryParams } from 'use-query-params'

import style from './TimelineIndicatorsBarGraph.module.scss'
interface Props {
	selectedTimelineAnnotationTypes: string[]
	width: number
}

const TARGET_TICK_COUNT = 7
const CONTAINER_BORDER_WIDTH = 1
const TARGET_BUCKET_WIDTH_PERCENT = 4
const MINOR_TICK_COUNT = 3
const INACTIVE_PERCENTAGE = 10

const MIN_ZOOM = 1.0

export const TIMELINE_MARGIN = 32
type SessionEvent = ParsedEvent & {
	eventType: string
	identifier: string
	timestamp: number
	adjustedTimestamp: number
}

const TimelineIndicatorsBarGraph = ({
	selectedTimelineAnnotationTypes,
	width,
}: Props) => {
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const {
		time,
		sessionMetadata: { startTime: start, totalTime: duration },
		setTime,
		state,
		eventsForTimelineIndicator,
		sessionComments,
		errors: sessionErrors,
		replayer,
		sessionIntervals,
		isLiveMode,
	} = useReplayerContext()

	// show 10s at max for long sessions
	const maxZoom = Math.max(duration / 10_000, 2)
	const [{ zoomStart, zoomEnd }] = useQueryParams({
		zoomStart: NumberParam,
		zoomEnd: NumberParam,
	})
	const { zoomAreaPercent, setZoomAreaPercent } = useToolbarItemsContext()

	const [camera, setCamera] = useState<Camera>({ x: 0, zoom: 1 })

	const viewportRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLDivElement>(null)
	const timeAxisRef = useRef<HTMLDivElement>(null)
	const timeIndicatorTopRef = useRef<HTMLDivElement>(null)
	const timeIndicatorHairRef = useRef<HTMLSpanElement>(null)
	const progressMonitorRef = useRef<HTMLDivElement>(null)

	const [viewportWidth, setViewportWidth] = useState(0)
	useLayoutEffect(() => {
		const div = viewportRef.current
		if (!div) {
			return
		}
		setViewportWidth(Math.round(div.offsetWidth) - 2 * TIMELINE_MARGIN)
	}, [width])

	const roundingBucketSize = pickBucketSize(
		duration,
		TARGET_BUCKET_WIDTH_PERCENT,
	)

	const roundingTimestep = getBucketSizeInMs(roundingBucketSize)

	const inactivityPeriods: [number, number][] = useMemo(() => {
		return sessionIntervals
			.filter((interval) => !interval.active)
			.map((interval) => [
				interval.startTime,
				interval.endTime - interval.startTime,
			])
	}, [sessionIntervals])
	const adjustedInactivityPeriods: [number, number][] = useMemo(() => {
		const inactiveDuration = inactivityPeriods.reduce(
			(acc, curr) => acc + curr[1],
			0,
		)

		const activeDuration = duration - inactiveDuration

		const adjustedInactiveDuration =
			(INACTIVE_PERCENTAGE * activeDuration) / 100

		if (inactiveDuration < adjustedInactiveDuration) {
			return inactivityPeriods
		}

		let inactivityAdjustment = 0
		const adjusted = inactivityPeriods.map((interval) => {
			const relativePeriod = interval[1] / inactiveDuration
			const adjustedInactivePeriod =
				Math.ceil(
					(relativePeriod * adjustedInactiveDuration) /
						roundingTimestep,
				) * roundingTimestep

			const adjustedStart = interval[0] + inactivityAdjustment
			inactivityAdjustment += adjustedInactivePeriod - interval[1]

			return [adjustedStart, adjustedInactivePeriod] as [number, number]
		})
		return adjusted
	}, [duration, inactivityPeriods, roundingTimestep])

	const adjustedDuration = useMemo(() => {
		const adjustedInactiveDuration = adjustedInactivityPeriods.reduce(
			(acc, curr) => acc + curr[1],
			0,
		)

		const inactiveDuration = inactivityPeriods.reduce(
			(acc, curr) => acc + curr[1],
			0,
		)

		const roundedActive =
			Math.ceil((duration - inactiveDuration) / roundingTimestep) *
			roundingTimestep

		return roundedActive + adjustedInactiveDuration
	}, [
		adjustedInactivityPeriods,
		duration,
		inactivityPeriods,
		roundingTimestep,
	])

	const timeToViewportProgress = (currTime: number) => {
		let adjustedTime = currTime
		if (inactivityPeriods.length > 0) {
			let idx = 0
			while (idx < inactivityPeriods.length) {
				const inactivePeriod = inactivityPeriods[idx]
				if (currTime > inactivePeriod[0] + inactivePeriod[1]) {
					adjustedTime +=
						adjustedInactivityPeriods[idx][1] - inactivePeriod[1]
					idx++
				} else {
					break
				}
			}
			if (idx < inactivityPeriods.length) {
				const inactivePeriod = inactivityPeriods[idx]
				const adjustedInactivePeriod = adjustedInactivityPeriods[idx]
				if (
					currTime >= inactivePeriod[0] &&
					currTime <= inactivePeriod[0] + inactivePeriod[1]
				) {
					const bit = currTime - inactivePeriod[0]
					const scale = adjustedInactivePeriod[1] / inactivePeriod[1]
					adjustedTime += bit * scale - bit
				}
			}
		}

		return adjustedTime / adjustedDuration
	}
	const viewportProgressToTime = useCallback(
		(progress: number) => {
			const adjustedTime = progress * adjustedDuration
			let currTime = adjustedTime
			if (adjustedInactivityPeriods.length > 0) {
				let idx = 0
				while (idx < adjustedInactivityPeriods.length) {
					const adjusted = adjustedInactivityPeriods[idx]
					if (adjustedTime > adjusted[0] + adjusted[1]) {
						currTime += inactivityPeriods[idx][1] - adjusted[1]
						idx++
					} else {
						break
					}
				}
				if (idx < adjustedInactivityPeriods.length) {
					const adjusted = adjustedInactivityPeriods[idx]
					const inactive = inactivityPeriods[idx]
					if (
						adjustedTime >= adjusted[0] &&
						adjustedTime <= adjusted[0] + adjusted[1]
					) {
						const bit = adjustedTime - adjusted[0]
						const scale = inactive[1] / adjusted[1]
						currTime += bit * scale - bit
					}
				}
			}
			return currTime
		},
		[adjustedDuration, adjustedInactivityPeriods, inactivityPeriods],
	)

	const events = useMemo(() => {
		const comments = getCommentsForTimelineIndicator(
			sessionComments,
			start,
			duration,
		)
		const errors = getErrorsForTimelineIndicator(
			sessionErrors,
			start,
			duration,
		)
		const toTS = (pct?: number) => ((pct || 0) / 100) * duration
		const combined: SessionEvent[] = [
			...eventsForTimelineIndicator.map((event) => ({
				...event,
				eventType: (event as customEvent).data.tag,
				timestamp: toTS(event.relativeIntervalPercentage),
				adjustedTimestamp: 0,
			})),
			...comments.map((event) => ({
				...event,
				identifier: event.id,
				eventType: 'Comments',
				timestamp: toTS(event.relativeIntervalPercentage),
				adjustedTimestamp: 0,
			})),
			...errors.map(
				(event) =>
					({
						...event,
						identifier: event.error_group_secure_id,
						timestamp: toTS(event.relativeIntervalPercentage),
						eventType: 'Errors',
						adjustedTimestamp: 0,
					} as SessionEvent),
			),
		]

		combined.sort((a, b) => a.timestamp - b.timestamp)

		let inactivityPeriodIdx = 0
		let inactivityAdjustment = 0
		for (const event of combined) {
			const inactivePeriod = inactivityPeriods[inactivityPeriodIdx]
			const adjustedInactivePeriod =
				adjustedInactivityPeriods[inactivityPeriodIdx]

			if (
				inactivityPeriodIdx !== inactivityPeriods.length &&
				inactivePeriod[0] + inactivePeriod[1] < event.timestamp
			) {
				inactivityAdjustment +=
					adjustedInactivePeriod[1] - inactivePeriod[1]
				inactivityPeriodIdx++
			}

			event.adjustedTimestamp = event.timestamp + inactivityAdjustment
		}

		return combined
	}, [
		adjustedInactivityPeriods,
		duration,
		eventsForTimelineIndicator,
		inactivityPeriods,
		sessionComments,
		sessionErrors,
		start,
	])

	const bucketSize = pickBucketSize(
		adjustedDuration / camera.zoom,
		TARGET_BUCKET_WIDTH_PERCENT,
	)
	const bucketTimestep = getBucketSizeInMs(bucketSize)
	const bucketPercentWidth = (100 * bucketTimestep) / adjustedDuration
	const buckets = useMemo(
		() =>
			buildEventBuckets(
				events,
				adjustedDuration,
				bucketTimestep,
				selectedTimelineAnnotationTypes,
				viewportProgressToTime,
			),
		[
			events,
			adjustedDuration,
			bucketTimestep,
			selectedTimelineAnnotationTypes,
			viewportProgressToTime,
		],
	)

	const maxBucketCount = Math.max(
		...buckets.map((bucket) => bucket.totalCount),
	)

	const formatTimeOnTop = useCallback(
		(t: number) =>
			showPlayerAbsoluteTime
				? playerTimeToSessionAbsoluteTime({
						sessionStartTime: start,
						relativeTime: t,
				  }).toString()
				: formatTimeAsHMS(t),
		[showPlayerAbsoluteTime, start],
	)
	const [isRefreshingDOM, setIsRefreshingDOM] = useState<boolean>(false)

	const zoom = useCallback(
		(clientX: number, dz: number) => {
			const viewportDiv = viewportRef.current
			if (!viewportDiv) {
				return
			}

			const pointerX = clientX + document.documentElement.scrollLeft
			const { offsetLeft, scrollLeft } = viewportDiv

			const factor = dz < 0 ? 1 - dz : 1 / (1 + dz)

			setCamera((camera) => {
				setIsRefreshingDOM(true)
				const zoom = clamp(factor * camera.zoom, MIN_ZOOM, maxZoom)
				const pointA =
					scrollLeft +
					clamp(
						pointerX - offsetLeft - TIMELINE_MARGIN,
						0,
						viewportWidth,
					)

				const pointB = (pointA * zoom) / camera.zoom
				const delta = pointB - pointA
				const x = clamp(
					camera.x + delta,
					0,
					viewportWidth * zoom - viewportWidth,
				)

				return { x, zoom }
			})
		},
		[maxZoom, viewportWidth],
	)

	const pan = useCallback(
		(deltaX: number) => {
			setCamera(({ zoom, x }) => {
				setIsRefreshingDOM(true)
				x = clamp(x + deltaX, 0, viewportWidth * zoom - viewportWidth)

				return { zoom, x }
			})
		},
		[viewportWidth],
	)

	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		if (!viewportDiv) {
			return
		}

		const onWheel = (event: WheelEvent) => {
			event.preventDefault()
			event.stopPropagation()

			if (isRefreshingDOM) {
				return
			}

			const { clientX, deltaY, deltaX, ctrlKey, metaKey } = event

			if (ctrlKey || metaKey) {
				const dz = deltaY / ZOOM_SCALING_FACTOR
				zoom(clientX, dz)
			} else {
				pan(deltaX)
			}
		}

		viewportDiv.addEventListener('wheel', onWheel, {
			passive: false,
		})

		return () => {
			viewportDiv.removeEventListener('wheel', onWheel)
		}
	}, [duration, isRefreshingDOM, maxZoom, pan, viewportWidth, zoom])

	const [hasActiveScrollbar, setHasActiveScrollbar] = useState<boolean>(false)
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [dragTime, setDragTime] = useState<number>(time)

	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		const canvasDiv = canvasRef.current
		const timeAxisDiv = timeAxisRef.current
		if (!viewportDiv || !canvasDiv || !timeAxisDiv) {
			return
		}
		const timeout = requestAnimationFrame(() => {
			if (!hasActiveScrollbar) {
				const canvasWidth = camera.zoom * viewportWidth
				canvasDiv.style.width = `${canvasWidth}px`
				timeAxisDiv.style.width = `${canvasWidth}px`

				viewportDiv.scrollTo({ left: camera.x })
				setIsRefreshingDOM(false)
			}
		})
		return () => cancelAnimationFrame(timeout)
	}, [camera, hasActiveScrollbar, viewportWidth])

	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		const timeIndicatorTopDiv = timeIndicatorTopRef.current
		const timeIndicatorHair = timeIndicatorHairRef.current
		const timeIndicatorTop = timeIndicatorTopRef.current
		if (
			!viewportDiv ||
			!timeIndicatorTopDiv ||
			!timeIndicatorHair ||
			!timeIndicatorTop
		) {
			return
		}

		let isOnScrollbar = false
		let shouldDrag = false

		const moveTime = (event: MouseEvent) => {
			const { clientX } = event
			const { offsetLeft, scrollLeft, scrollWidth } = viewportDiv
			const canvasWidth = scrollWidth - 2 * TIMELINE_MARGIN
			const pointerX = clientX + document.documentElement.scrollLeft
			const x = clamp(
				scrollLeft + pointerX - offsetLeft - TIMELINE_MARGIN,
				0,
				canvasWidth,
			)

			const newTime = clamp(
				Math.round(viewportProgressToTime(x / canvasWidth)),
				0,
				duration,
			)
			if (!shouldDrag) {
				setTime(newTime)
			} else {
				setDragTime(newTime)
			}
			return newTime
		}

		const onDrag = () => {
			shouldDrag = true
			setIsDragging(true)
			timeIndicatorTopDiv.style.cursor = 'grabbing'
		}

		const onPointerdown = (event: MouseEvent) => {
			const timeAxisDiv = timeAxisRef.current
			if (!timeAxisDiv) {
				return
			}
			const { offsetHeight: timeAxisHeight } = timeAxisDiv

			const { clientY } = event
			const bbox = viewportDiv.getBoundingClientRect()
			const timeAxisBottom = bbox.top + timeAxisHeight
			const histogramBottom = bbox.top + viewportDiv.clientHeight
			const pointerY = clientY + document.documentElement.scrollTop

			if (pointerY <= timeAxisBottom) {
				onDrag()
				moveTime(event)
			}
			if (pointerY > histogramBottom) {
				isOnScrollbar = true
				setHasActiveScrollbar(isOnScrollbar)
			}
		}

		const onPointerup = (event: MouseEvent) => {
			timeIndicatorTopDiv.style.cursor = 'grab'

			if (shouldDrag) {
				shouldDrag = false
				setIsDragging(false)
				moveTime(event)
			}

			isOnScrollbar = false
			setHasActiveScrollbar(false)
		}

		const onPointermove = (event: MouseEvent) => {
			if (shouldDrag) {
				event.preventDefault()
				moveTime(event)
			}
		}

		const onScroll = (event: Event) => {
			event.preventDefault()
			if (isOnScrollbar) {
				requestAnimationFrame(() =>
					setCamera(({ zoom }) => ({
						x: Math.min(
							viewportDiv.scrollLeft,
							viewportDiv.scrollWidth -
								viewportWidth -
								2 * TIMELINE_MARGIN +
								1,
						),
						zoom,
					})),
				)
			}
		}

		viewportDiv.addEventListener('pointerdown', onPointerdown)
		timeIndicatorHair.addEventListener('pointerdown', onDrag)
		timeIndicatorTop.addEventListener('pointerdown', onDrag)
		viewportDiv.addEventListener('scroll', onScroll, { passive: false })
		document.addEventListener('pointerup', onPointerup)
		document.addEventListener('pointermove', onPointermove, {
			passive: false,
		})
		return () => {
			viewportDiv.removeEventListener('pointerdown', onPointerdown)
			timeIndicatorHair.removeEventListener('pointerdown', onDrag)
			timeIndicatorTop.removeEventListener('pointerdown', onDrag)
			viewportDiv.removeEventListener('scroll', onScroll)
			document.removeEventListener('pointerup', onPointerup)
			document.removeEventListener('pointermove', onPointermove)
			timeIndicatorTopDiv.style.cursor = 'grab'
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [duration, viewportWidth])

	const canvasWidth = viewportWidth * camera.zoom
	// camera.x frame of reference is the canvas; to fix it to the viewport and make
	// margins insignificant parts of panning/zooming the session, we clamp the values
	const relativeLeftX = clamp(
		camera.x - TIMELINE_MARGIN,
		0,
		canvasWidth - viewportWidth,
	)
	const leftProgress = (width * relativeLeftX) / canvasWidth

	// the same reasoning applies to camera.zoom
	const relativeZoom = canvasWidth / (viewportWidth + 2 * TIMELINE_MARGIN)
	const rightProgress = clamp(leftProgress + width / relativeZoom, 1, width)

	const borderlessWidth = width - 2 * CONTAINER_BORDER_WIDTH // adjusting the width to account for the borders

	useLayoutEffect(() => {
		setZoomAreaPercent({
			left: clamp((100 * leftProgress) / width, 0, 100),
			right: clamp((100 * rightProgress) / width, 0, 100),
		})
	}, [leftProgress, rightProgress, setZoomAreaPercent, width])

	const zoomAdjustmentFactor = relativeZoom / camera.zoom
	const updateCameraFromZoomArea = useCallback(
		(percent: ZoomAreaPercent) => {
			const { left, right } = percent
			let zoom = clamp(
				100 / (right - left) / zoomAdjustmentFactor,
				MIN_ZOOM,
				maxZoom,
			)
			const canvasWidth = viewportWidth * zoom
			let x = (left * canvasWidth) / 100 + TIMELINE_MARGIN
			if (x === TIMELINE_MARGIN) {
				x = 0
			}

			if (x === 0 && zoom <= 1 / zoomAdjustmentFactor) {
				zoom = 1
			}

			requestAnimationFrame(() => {
				setCamera({ x, zoom })
			})
		},
		[maxZoom, viewportWidth, zoomAdjustmentFactor],
	)

	useLayoutEffect(() => {
		const zoomPercent = {
			left:
				zoomStart !== undefined && zoomStart !== null
					? clamp(zoomStart, 0, 100)
					: 0,
			right:
				zoomEnd !== undefined && zoomEnd !== null
					? clamp(zoomEnd, 0, 100)
					: 100,
		}
		setZoomAreaPercent(zoomPercent)
		updateCameraFromZoomArea(zoomPercent)
		// run once for session secure id

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session_secure_id])

	const isVisible = useCallback(
		(...percents: number[]) => {
			const { left, right } = zoomAreaPercent

			return percents.reduce(
				(prev, pct) => prev || (left <= pct && pct <= right),
				false,
			)
		},
		[zoomAreaPercent],
	)
	const ticks = useMemo(() => {
		let size = pickBucketSize(
			adjustedDuration / camera.zoom,
			100 / TARGET_TICK_COUNT,
		)
		// do Math.ceil to have 1 second as the min tick
		size = { ...size, multiple: Math.ceil(size.multiple) }
		const mainTickInMs = getBucketSizeInMs(size)
		const numTicks = Math.ceil(adjustedDuration / mainTickInMs)

		const step = (mainTickInMs / adjustedDuration) * canvasWidth
		const minorStep = step / (MINOR_TICK_COUNT + 1)

		const elms = []

		const showTick = (idx: number) =>
			isVisible(((idx * mainTickInMs) / adjustedDuration) * 100)

		for (let idx = 0; idx <= numTicks; ++idx) {
			if (!showTick(idx)) {
				continue
			}
			const key = `${idx * size.multiple}${size.tick}`
			const text = formatTimeAsAlphanum(mainTickInMs * idx)
			const fontWeight = text.includes('h')
				? 500
				: text.includes('m')
				? 450
				: 400

			const left = idx * step
			elms.push(
				<span
					className={style.timeTickMark}
					key={`tick-verbose-${key}`}
					style={{
						left: left - text.length * 3,
						fontWeight,
					}}
				>
					{text}
				</span>,
			)

			const borderLeftWidth = text.includes('h')
				? 1
				: text.includes('m')
				? 0.75
				: 0.5
			elms.push(
				<span
					className={classNames(style.timeTick, style.timeTickMajor)}
					key={`tick-major-${key}`}
					style={{ left, borderLeftWidth }}
				></span>,
			)
			if (idx !== numTicks) {
				for (
					let minorIdx = 0;
					minorIdx < MINOR_TICK_COUNT;
					++minorIdx
				) {
					if (!showTick(idx + minorIdx / MINOR_TICK_COUNT)) {
						continue
					}
					const isMid = minorIdx === Math.floor(MINOR_TICK_COUNT / 2)
					elms.push(
						<span
							className={classNames(style.timeTick, {
								[style.timeTickMinor]: !isMid,
								[style.timeTickMid]: isMid,
							})}
							key={`tick-minor-${minorIdx}-${key}`}
							style={{ left: left + (minorIdx + 1) * minorStep }}
						></span>,
					)
				}
			}
		}
		return elms
	}, [camera.zoom, canvasWidth, isVisible, adjustedDuration])

	const shownTime = isDragging ? dragTime : time
	if (!events.length || state === ReplayerState.Loading || !replayer) {
		return (
			<div
				className={style.timelineIndicatorsContainer}
				style={{ width }}
			>
				<div className={style.progressMonitor}>
					<Skeleton height={38} />
				</div>
				<div className={style.timelineContainer} ref={viewportRef}>
					<Skeleton height={128} />
				</div>
			</div>
		)
	}

	return (
		<div className={style.timelineIndicatorsContainer} style={{ width }}>
			<div className={style.progressBarContainer}>
				{isLiveMode ? (
					<div className={style.liveProgressBar} />
				) : (
					<>
						{shownTime > 0 ? (
							<>
								<div
									className={style.progressBar}
									style={{
										width: clamp(
											(shownTime / duration) *
												borderlessWidth,
											0,
											borderlessWidth,
										),
									}}
								/>
								{inactivityPeriods.map((interval, idx) => {
									if (interval[0] >= shownTime) {
										return null
									}

									const left =
										(interval[0] / duration) *
										borderlessWidth
									const width =
										(Math.min(
											shownTime - interval[0],
											interval[1],
										) /
											duration) *
										borderlessWidth

									return (
										<div
											key={idx}
											className={classNames(
												style.inactivityPeriod,
												style.inactivityPeriodPlayed,
											)}
											style={{
												left,
												width: clamp(
													width,
													0,
													borderlessWidth - left,
												),
											}}
										/>
									)
								})}
							</>
						) : null}
						{inactivityPeriods.map((interval, idx) => {
							const left =
								(interval[0] / duration) * borderlessWidth
							const pWidth =
								(interval[1] / duration) * borderlessWidth
							return (
								<div
									key={idx}
									className={style.inactivityPeriod}
									style={{
										left,
										width: clamp(
											pWidth,
											0,
											borderlessWidth - left,
										),
									}}
								/>
							)
						})}
					</>
				)}
			</div>
			<div className={style.progressMonitor} ref={progressMonitorRef}>
				{bucketPercentWidth < 0.5 ? (
					buckets
						.filter((bucket) => bucket.totalCount > 0)
						.map(({ totalCount, startPercent }, idx) => (
							<span
								key={`bucket-mark-${idx}`}
								className={style.bucketMark}
								style={{
									left: `${startPercent}%`,
									height: `${clamp(totalCount * 8, 0, 100)}%`,
								}}
							></span>
						))
				) : (
					<AreaChart
						width={borderlessWidth}
						height={22}
						data={buckets}
						margin={{ top: 4, bottom: 0, left: 0, right: 0 }}
					>
						<Area
							type="monotone"
							stroke="transparent"
							dataKey="totalCount"
							fill="var(--color-neutral-200)"
						></Area>
					</AreaChart>
				)}
				<ZoomArea
					containerWidth={borderlessWidth}
					wrapperRef={progressMonitorRef}
					update={updateCameraFromZoomArea}
					minZoomAreaPercent={100 / maxZoom}
				/>
			</div>
			<div className={style.timelineContainer} ref={viewportRef}>
				<TimeIndicator
					left={clamp(
						canvasWidth * timeToViewportProgress(shownTime) +
							TIMELINE_MARGIN,
						TIMELINE_MARGIN,
						TIMELINE_MARGIN + canvasWidth,
					)}
					topRef={timeIndicatorTopRef}
					hairRef={timeIndicatorHairRef}
					viewportRef={viewportRef}
					text={formatTimeOnTop(shownTime)}
					isDragging={isDragging}
				/>
				<div className={style.timeAxis} ref={timeAxisRef}>
					{ticks}
				</div>
				<div
					className={style.separator}
					style={{
						width: canvasWidth + 2 * TIMELINE_MARGIN,
					}}
				/>
				<div className={style.eventHistogram} ref={canvasRef}>
					<div className={style.eventTrack}>
						{buckets
							.filter(
								(bucket) =>
									bucket.totalCount > 0 &&
									isVisible(
										bucket.startPercent,
										bucket.endPercent,
									),
							)
							.map((bucket, idx) =>
								bucket.totalCount > 0 ? (
									<TimelineBar
										key={`${bucketSize.multiple}${bucketSize.tick}-${idx}`}
										bucket={bucket}
										width={bucketPercentWidth}
										height={
											(bucket.totalCount /
												maxBucketCount) *
											100
										}
										viewportRef={viewportRef}
									/>
								) : null,
							)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default TimelineIndicatorsBarGraph

interface Camera {
	x: number
	zoom: number
}

enum TimelineTick {
	second = 's',
	minute = 'm',
}

interface BucketSize {
	tick: TimelineTick
	multiple: number
}

const ZOOM_SCALING_FACTOR = 100

const BUCKET_SIZES: readonly BucketSize[] = [
	{
		tick: TimelineTick.second,
		multiple: 0.25,
	},
	{
		tick: TimelineTick.second,
		multiple: 0.5,
	},
	{
		tick: TimelineTick.second,
		multiple: 1,
	},
	{
		tick: TimelineTick.second,
		multiple: 5,
	},
	{
		tick: TimelineTick.second,
		multiple: 10,
	},
	{
		tick: TimelineTick.second,
		multiple: 15,
	},
	{
		tick: TimelineTick.second,
		multiple: 30,
	},
	{
		tick: TimelineTick.minute,
		multiple: 1,
	},
	{
		tick: TimelineTick.minute,
		multiple: 5,
	},
	{
		tick: TimelineTick.minute,
		multiple: 10,
	},
	{
		tick: TimelineTick.minute,
		multiple: 15,
	},
	{
		tick: TimelineTick.minute,
		multiple: 30,
	},
]

function getBucketSizeInMs({ multiple, tick }: BucketSize) {
	let size = multiple
	switch (tick) {
		case TimelineTick.second:
			size *= 1000
			break
		case TimelineTick.minute:
			size *= 60 * 1000
			break
	}
	return size
}

function pickBucketSize(
	duration: number,
	targetBucketWidthPercent: number,
): BucketSize {
	const reverseBucketSizes = Array.from(BUCKET_SIZES).reverse()
	for (const bucketSize of reverseBucketSizes) {
		const bucketCount = Math.ceil(duration / getBucketSizeInMs(bucketSize))
		const bucketWidth = 100 / bucketCount

		if (bucketWidth <= targetBucketWidthPercent) {
			return bucketSize
		}
	}
	return BUCKET_SIZES[0]
}
export interface EventBucket {
	totalCount: number
	startPercent: number
	endPercent: number
	startTime: number
	identifier: {
		[props: string]: string[]
	}
	details: {
		[identifier: string]: string
	}
	timestamp: {
		[identifier: string]: number
	}
}

function buildEventBuckets(
	events: SessionEvent[],
	viewportDuration: number,
	timestep: number,
	selectedTimelineAnnotationTypes: string[],
	viewportProgressToTime: (progress: number) => number,
): EventBucket[] {
	if (
		!selectedTimelineAnnotationTypes.length ||
		!events.length ||
		viewportDuration <= 0
	) {
		return []
	}

	const numBuckets = Math.ceil(viewportDuration / timestep)
	const eventBuckets: EventBucket[] = Array.from(
		{ length: numBuckets },
		(_, idx) => {
			const progress = idx / numBuckets
			const startTime = viewportProgressToTime(progress)
			return {
				totalCount: 0,
				startPercent: 100 * progress,
				endPercent: (100 * (idx + 1)) / numBuckets,
				startTime,
				identifier: Object.fromEntries(
					selectedTimelineAnnotationTypes.map((eventType) => [
						eventType,
						[] as string[],
					]),
				),
				details: {},
				timestamp: {},
			}
		},
	)

	const filteredEvents = events.filter(({ eventType }) =>
		selectedTimelineAnnotationTypes.includes(eventType),
	)

	for (const event of filteredEvents) {
		const { eventType, adjustedTimestamp, timestamp, identifier } = event
		const bucketId = clamp(
			Math.floor(adjustedTimestamp / timestep),
			0,
			eventBuckets.length - 1,
		)
		eventBuckets[bucketId].identifier[eventType].push(identifier)
		const details = JSON.stringify(
			getEventRenderDetails(event as HighlightEvent).displayValue,
		)?.replaceAll(/^\"|\"$/g, '')
		eventBuckets[bucketId].details[identifier] = !details
			? identifier
			: details
		eventBuckets[bucketId].timestamp[identifier] = timestamp
		eventBuckets[bucketId].totalCount++
	}
	return eventBuckets
}
