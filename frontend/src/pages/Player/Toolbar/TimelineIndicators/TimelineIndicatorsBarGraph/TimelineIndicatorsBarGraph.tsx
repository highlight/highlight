import { Skeleton } from '@components/Skeleton/Skeleton'
import { customEvent } from '@highlight-run/rrweb/typings/types'
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
const TARGET_BUCKET_WIDTH = 20
const MIN_BUCKET_WIDTH = 5
const MINOR_TICK_COUNT = 3

export const TIMELINE_MARGIN = 32
type SessionEvent = ParsedEvent & { eventType: string; identifier: string }

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

	const minZoom = 1
	// show 10s at max for long sessions
	const maxZoom = Math.max(duration / 10_000, 2)
	const [{ zoomStart, zoomEnd }] = useQueryParams({
		zoomStart: NumberParam,
		zoomEnd: NumberParam,
	})
	const { zoomAreaPercent, setZoomAreaPercent } = useToolbarItemsContext()

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
		const combined: SessionEvent[] = [
			...eventsForTimelineIndicator.map((event) => ({
				...event,
				eventType: (event as customEvent).data.tag,
			})),
			...comments.map((event) => ({
				...event,
				identifier: event.id,
				eventType: 'Comments',
			})),
			...errors.map((event) => ({
				...event,
				identifier: event.error_group_secure_id,
				eventType: 'Errors',
			})),
		]
		combined.sort(
			(a, b) =>
				a.relativeIntervalPercentage! - b.relativeIntervalPercentage!,
		)
		return combined
	}, [
		duration,
		eventsForTimelineIndicator,
		sessionComments,
		sessionErrors,
		start,
	])

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
		setViewportWidth(div.offsetWidth - 2 * TIMELINE_MARGIN)
	}, [width])

	const roundedDuration = useMemo(() => {
		const roundingBucketSize = pickBucketSize(
			duration,
			TARGET_BUCKET_WIDTH,
			MIN_BUCKET_WIDTH,
			viewportWidth,
		)
		const timestep = getBucketSizeInMs(roundingBucketSize)
		const numBuckets = Math.ceil(duration / timestep)
		return numBuckets * timestep
	}, [duration, viewportWidth])

	const canvasWidth = viewportWidth * camera.zoom

	const bucketSize = pickBucketSize(
		roundedDuration / camera.zoom,
		TARGET_BUCKET_WIDTH,
		MIN_BUCKET_WIDTH,
		viewportWidth,
	)
	const bucketTimestep = getBucketSizeInMs(bucketSize)
	const bucketPercentWidth = (100 * bucketTimestep) / roundedDuration

	const buckets = useMemo(
		() =>
			buildEventBuckets(
				events,
				duration,
				bucketTimestep,
				selectedTimelineAnnotationTypes,
			),
		[events, duration, bucketTimestep, selectedTimelineAnnotationTypes],
	)

	const maxBucketCount = Math.max(
		...buckets.map((bucket) => bucket.totalCount),
	)

	const inactivityPeriods: [number, number][] = useMemo(() => {
		return sessionIntervals
			.filter((interval) => !interval.active)
			.map((interval) => [interval.startTime, interval.endTime])
	}, [sessionIntervals])

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
	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		if (!viewportDiv) {
			return
		}

		const zoom = (clientX: number, dz: number) => {
			const pointerX = clientX + document.documentElement.scrollLeft
			const { offsetLeft, scrollLeft } = viewportDiv

			const factor = dz < 0 ? 1 - dz : 1 / (1 + dz)

			setCamera((camera) => {
				setIsRefreshingDOM(true)
				const zoom = clamp(factor * camera.zoom, minZoom, maxZoom)
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
		}
		const pan = (deltaX: number) => {
			setCamera(({ zoom, x }) => {
				setIsRefreshingDOM(true)
				x = clamp(x + deltaX, 0, viewportWidth * zoom - viewportWidth)

				return { zoom, x }
			})
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
	}, [duration, isRefreshingDOM, maxZoom, viewportWidth])

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
				Math.round((x * roundedDuration) / canvasWidth),
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
				minZoom,
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
				setZoomAreaPercent({ left, right })
			})
		},
		[maxZoom, setZoomAreaPercent, viewportWidth, zoomAdjustmentFactor],
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
		(time: number) => {
			const { left, right } = zoomAreaPercent
			const leftTime = (left * roundedDuration) / 100
			const rightTime = (right * roundedDuration) / 100

			return leftTime <= time && time <= rightTime
		},
		[roundedDuration, zoomAreaPercent],
	)
	const ticks = useMemo(() => {
		let size = pickBucketSize(
			roundedDuration / camera.zoom,
			viewportWidth / TARGET_TICK_COUNT,
			MIN_BUCKET_WIDTH,
			viewportWidth,
		)
		// do Math.ceil to have 1 second as the min tick
		size = { ...size, multiple: Math.ceil(size.multiple) }
		const mainTickInMs = getBucketSizeInMs(size)
		const numTicks = Math.ceil(roundedDuration / mainTickInMs)

		const step = (mainTickInMs / roundedDuration) * canvasWidth
		const minorStep = step / (MINOR_TICK_COUNT + 1)

		const elms = []

		const showTick = (idx: number) =>
			isVisible(idx * mainTickInMs) &&
			((idx * mainTickInMs) / roundedDuration) * canvasWidth < canvasWidth

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
	}, [camera.zoom, canvasWidth, isVisible, roundedDuration, viewportWidth])

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
						{time > 0 ? (
							<>
								<div
									className={style.progressBar}
									style={{
										width: clamp(
											(shownTime * borderlessWidth) /
												duration,
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
									const pWidth =
										((Math.min(shownTime, interval[1]) -
											interval[0]) /
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
													pWidth,
													0,
													borderlessWidth - left,
												),
											}}
										/>
									)
								})}{' '}
							</>
						) : null}
						{inactivityPeriods.map((interval, idx) => {
							const left =
								(interval[0] / duration) * borderlessWidth
							const pWidth =
								((interval[1] - interval[0]) / duration) *
								borderlessWidth
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
						.map(({ totalCount }, idx) => ({ totalCount, idx }))
						.filter(({ totalCount }) => totalCount > 0)
						.map(({ totalCount, idx }) => (
							<span
								key={`bucket-mark-${idx}`}
								className={style.bucketMark}
								style={{
									left:
										(idx / buckets.length) *
										borderlessWidth,
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
						(shownTime * viewportWidth * camera.zoom) /
							roundedDuration +
							TIMELINE_MARGIN,
						TIMELINE_MARGIN,
						TIMELINE_MARGIN + viewportWidth * camera.zoom,
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
						width:
							viewportWidth * camera.zoom + 2 * TIMELINE_MARGIN,
					}}
				></div>
				<div className={style.eventHistogram} ref={canvasRef}>
					<div className={style.eventTrack}>
						{buckets
							.filter(
								(bucket) =>
									isVisible(bucket.startTime) ||
									isVisible(bucket.endTime),
							)
							.map((bucket, idx) =>
								bucket.totalCount > 0 ? (
									<TimelineBar
										key={`${bucketSize.multiple}${bucketSize.tick}-${idx}`}
										bucket={bucket}
										width={bucketPercentWidth}
										left={
											(bucket.startTime /
												roundedDuration) *
											100
										}
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
	targetBucketWidth: number,
	minBucketWidth: number,
	viewportWidth: number,
): BucketSize {
	const reverseBucketSizes = Array.from(BUCKET_SIZES).reverse()
	for (const bucketSize of reverseBucketSizes) {
		const bucketCount = Math.ceil(duration / getBucketSizeInMs(bucketSize))
		const bucketWidth = viewportWidth / bucketCount

		if (bucketWidth <= targetBucketWidth) {
			return bucketSize
		}
	}
	return BUCKET_SIZES[0]
}
export interface EventBucket {
	totalCount: number
	startTime: number
	endTime: number
	identifier: {
		[props: string]: string[]
	}
	timestamp: {
		[identifier: string]: number
	}
}

function buildEventBuckets(
	events: SessionEvent[],
	duration: number,
	timestep: number,
	selectedTimelineAnnotationTypes: string[],
): EventBucket[] {
	if (
		!selectedTimelineAnnotationTypes.length ||
		!events.length ||
		duration <= 0
	) {
		return []
	}

	const numBuckets = Math.ceil(duration / timestep)
	const eventBuckets: EventBucket[] = Array.from(
		{ length: numBuckets },
		(_, idx) => ({
			totalCount: 0,
			startTime: idx * timestep,
			endTime: (idx + 1) * timestep,
			identifier: Object.fromEntries(
				selectedTimelineAnnotationTypes.map((eventType) => [
					eventType,
					[] as string[],
				]),
			),
			timestamp: {},
		}),
	)

	const filteredEvents = events.filter(({ eventType }) =>
		selectedTimelineAnnotationTypes.includes(eventType),
	)

	for (const {
		eventType,
		relativeIntervalPercentage,
		identifier,
	} of filteredEvents) {
		const timestamp = ((relativeIntervalPercentage || 0) / 100) * duration
		const bucketId = clamp(
			Math.floor(timestamp / timestep),
			0,
			eventBuckets.length - 1,
		)
		eventBuckets[bucketId].identifier[eventType].push(identifier)
		eventBuckets[bucketId].timestamp[identifier] = timestamp
		eventBuckets[bucketId].totalCount++
	}
	return eventBuckets.filter((bucket) => bucket.totalCount > 0)
}
