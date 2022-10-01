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
import TimelineBar, {
	EventBucket,
} from '@pages/Player/Toolbar/TimelineIndicators/TimelineBar/TimelineBar'
import { clamp } from '@util/numbers'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { formatTimeAsAlphanum, formatTimeAsHMS } from '@util/time'
import classNames from 'classnames'
import moment from 'moment'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Area, AreaChart } from 'recharts'

import style from './TimelineIndicatorsBarGraph.module.scss'
interface Props {
	selectedTimelineAnnotationTypes: string[]
	width: number
}

const TARGET_BUCKET_COUNT = 36
const TIMELINE_MARGIN = 32

type SessionEvent = ParsedEvent & { eventType: string; identifier: string }

const TimelineIndicatorsBarGraph = ({
	selectedTimelineAnnotationTypes,
	width,
}: Props) => {
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const {
		time,
		sessionMetadata: { startTime: start, totalTime: duration },
		setTime,
		play,
		pause,
		state,
		eventsForTimelineIndicator,
		sessionComments,
		errors: sessionErrors,
		replayer,
		sessionIntervals,
	} = useReplayerContext()

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
				identifier: event.id,
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

	const bucketSize = useMemo(
		() => pickBucketSize(duration / camera.zoom, TARGET_BUCKET_COUNT),
		[duration, camera.zoom],
	)

	const bucketTimestep = useMemo(
		() => getBucketSizeInMs(bucketSize),
		[bucketSize],
	)

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
	const bucketPercentWidth = (bucketTimestep / duration) * 100
	const lastBucketPercentWidth =
		((duration - bucketTimestep * (buckets.length - 1)) * 100) / duration

	const shouldMockActivityGraph = useMemo(() => {
		// fall back to a <span>-based mockup if too many buckets are small
		if (buckets.length > 1000) {
			return bucketPercentWidth < 0.5
		}
		return false
	}, [bucketPercentWidth, buckets.length])

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

	const viewportRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLDivElement>(null)
	const timeAxisRef = useRef<HTMLDivElement>(null)
	const timeIndicatorTopRef = useRef<HTMLDivElement>(null)
	const timeIndicatorHairRef = useRef<HTMLSpanElement>(null)
	const [viewportWidth, setViewportWidth] = useState(0)

	useLayoutEffect(() => {
		const div = viewportRef.current
		if (!div) {
			return
		}
		setViewportWidth(div.offsetWidth - 2 * TIMELINE_MARGIN)
	}, [width])

	const [isRefreshingDOM, setIsRefreshingDOM] = useState<boolean>(false)
	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		if (!viewportDiv) {
			return
		}
		console.log(inactivityPeriods)

		const onWheel = (event: WheelEvent) => {
			event.preventDefault()
			event.stopPropagation()

			if (isRefreshingDOM) {
				return
			}

			setIsRefreshingDOM(true)

			const { clientX, deltaY, deltaX, ctrlKey, metaKey } = event
			const { offsetWidth, offsetLeft, scrollLeft } = viewportDiv
			const viewportWidth = offsetWidth - 2 * TIMELINE_MARGIN
			const pointerX = clientX + document.documentElement.scrollLeft
			if (ctrlKey || metaKey) {
				setCamera((camera) => {
					const dz = deltaY / ZOOM_SCALING_FACTOR

					const factor = dz < 0 ? 1 - dz : 1 / (1 + dz)

					const minZoom = 1

					// show 10s at max for long sessions
					const maxZoom = Math.max(duration / 10_000, 2)
					const zoom = clamp(factor * camera.zoom, minZoom, maxZoom)

					const pointer = clamp(
						pointerX - offsetLeft - TIMELINE_MARGIN,
						0,
						viewportWidth,
					)

					const pointA = scrollLeft + pointer
					const pointB = (pointA * zoom) / camera.zoom
					const delta = pointB - pointA
					const x = clamp(
						camera.x + delta,
						0,
						viewportWidth * zoom - viewportWidth,
					)

					return { x, zoom }
				})
			} else {
				setCamera(({ zoom, x }) => {
					x = clamp(
						x + deltaX,
						0,
						viewportWidth * zoom - viewportWidth,
					)

					return { zoom, x }
				})
			}
		}

		viewportDiv.addEventListener('wheel', onWheel, {
			passive: false,
		})
		return () => {
			viewportDiv.removeEventListener('wheel', onWheel)
		}
	}, [duration, isRefreshingDOM])

	const [hasActiveScrollbar, setHasActiveScrollbar] = useState<boolean>(false)
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [shouldPlay, setShouldPlay] = useState(false)
	useEffect(() => {
		// pause playing on drag start
		if (state === ReplayerState.Playing && isDragging) {
			pause()
			setShouldPlay(true)
		}

		if (state === ReplayerState.Paused && !isDragging && shouldPlay) {
			// start playing after dragging
			play()
			setShouldPlay(false)
		}
	}, [isDragging, pause, play, shouldPlay, state])

	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		const canvasDiv = canvasRef.current
		const timeAxisDiv = timeAxisRef.current
		if (!viewportDiv || !canvasDiv || !timeAxisDiv) {
			return
		}
		const timeout = requestAnimationFrame(() => {
			if (!hasActiveScrollbar) {
				const width = camera.zoom * viewportWidth
				canvasDiv.style.width = `${width}px`
				timeAxisDiv.style.width = `${width}px`
				viewportDiv.scrollTo(camera.x, 0)
			}
			setIsRefreshingDOM(false)
		})
		return () => cancelAnimationFrame(timeout)
	}, [camera, hasActiveScrollbar, viewportWidth])

	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		const timeIndicatorTopDiv = timeIndicatorTopRef.current
		const timeIndicatorHair = timeIndicatorHairRef.current
		if (!viewportDiv || !timeIndicatorTopDiv || !timeIndicatorHair) {
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
				Math.round((x * duration) / canvasWidth),
				0,
				duration,
			)
			setTime(newTime)
			return newTime
		}

		const onDrag = () => {
			shouldDrag = true
			setIsDragging(shouldDrag)
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
						x: viewportDiv.scrollLeft,
						zoom,
					})),
				)
			}
		}

		viewportDiv.addEventListener('pointerdown', onPointerdown)
		timeIndicatorHair.addEventListener('pointerdown', onDrag)
		viewportDiv.addEventListener('scroll', onScroll, { passive: false })
		document.addEventListener('pointerup', onPointerup)
		document.addEventListener('pointermove', onPointermove, {
			passive: false,
		})
		return () => {
			viewportDiv.removeEventListener('pointerdown', onPointerdown)
			timeIndicatorHair.removeEventListener('pointerdown', onDrag)
			viewportDiv.removeEventListener('scroll', onScroll)
			document.removeEventListener('pointerup', onPointerup)
			document.removeEventListener('pointermove', onPointermove)
			timeIndicatorTopDiv.style.cursor = 'grab'
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [duration])

	const leftProgress = useMemo(() => {
		const canvasWidth = viewportWidth * camera.zoom
		const x =
			clamp(camera.x, TIMELINE_MARGIN, canvasWidth - viewportWidth) -
			TIMELINE_MARGIN
		return (width * x) / canvasWidth
	}, [viewportWidth, camera.zoom, camera.x, width])

	const rightProgress = useMemo(() => {
		const canvasWidth = viewportWidth * camera.zoom
		const actualZoom = canvasWidth / (viewportWidth + 2 * TIMELINE_MARGIN)
		return leftProgress + width / actualZoom
	}, [viewportWidth, camera.zoom, leftProgress, width])

	const leftmostBucketIdx = useMemo(() => {
		return clamp(
			Math.floor((leftProgress * buckets.length) / width) - 1,
			0,
			buckets.length - 1,
		)
	}, [buckets, leftProgress, width])

	const rightmostBucketIdx = useMemo(() => {
		return clamp(
			Math.ceil((rightProgress / width) * buckets.length) + 1,
			0,
			buckets.length - 1,
		)
	}, [buckets, rightProgress, width])

	const ticks = useMemo(() => {
		let size = pickBucketSize(duration / camera.zoom, 20)
		// do Math.ceil to have 1 second as the min tick
		size = { ...size, multiple: Math.ceil(size.multiple) }
		const mainTickInMs = getBucketSizeInMs(size)

		const canvasWidth = viewportWidth * camera.zoom
		const step = (mainTickInMs / duration) * canvasWidth
		const minorStep = step / 4

		const numTicks = Math.ceil(duration / mainTickInMs)

		const elms = []

		const isTickRedundant = (idx: number, rem: number) => {
			const leftTime = (idx + rem) * mainTickInMs
			if (
				leftTime > duration ||
				leftTime < (leftmostBucketIdx - 1) * bucketTimestep ||
				leftTime > (rightmostBucketIdx + 1) * bucketTimestep
			) {
				return true
			}
			return false
		}
		for (let idx = 0; idx <= numTicks; ++idx) {
			if (isTickRedundant(idx, 0)) {
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
				if (isTickRedundant(idx, 0.25)) {
					continue
				}
				elms.push(
					<span
						className={classNames(
							style.timeTick,
							style.timeTickMinor,
						)}
						key={`tick-minor-1-${key}`}
						style={{ left: left + minorStep }}
					></span>,
				)
				if (isTickRedundant(idx, 0.5)) {
					continue
				}
				elms.push(
					<span
						className={classNames(
							style.timeTick,
							style.timeTickMid,
						)}
						key={`tick-mid-${key}`}
						style={{ left: left + 2 * minorStep }}
					></span>,
				)
				if (isTickRedundant(idx, 0.75)) {
					continue
				}
				elms.push(
					<span
						className={classNames(
							style.timeTick,
							style.timeTickMinor,
						)}
						key={`tick-minor-2-${key}`}
						style={{ left: left + 3 * minorStep }}
					></span>,
				)
			}
		}
		return elms
	}, [
		bucketTimestep,
		camera.zoom,
		duration,
		leftmostBucketIdx,
		rightmostBucketIdx,
		viewportWidth,
	])

	const [timeIndicatorOffset, setTimeIndicatorOffset] = useState<number>(-25)
	useEffect(() => {
		const timeIndicatorTop = timeIndicatorTopRef.current
		if (!timeIndicatorTop) {
			return
		}
		setTimeIndicatorOffset(
			(time * viewportWidth * camera.zoom) / duration -
				timeIndicatorTop.offsetWidth / 2,
		)
	}, [camera.zoom, duration, time, viewportWidth])

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
				{time > 0 ? (
					<div
						className={style.progressBar}
						style={{
							width: (time * width) / duration,
						}}
					/>
				) : null}
				{inactivityPeriods.map((interval, idx) => {
					const left = (interval[0] / duration) * width
					const pWidth =
						((interval[1] - interval[0]) / duration) * width
					return (
						<div
							key={idx}
							className={style.inactivityPeriod}
							style={{
								left,
								width: clamp(pWidth, 0, width - left - 2),
							}}
						/>
					)
				})}
			</div>
			<div className={style.progressMonitor}>
				{shouldMockActivityGraph ? (
					buckets
						.filter((bucket) => bucket.totalCount > 0)
						.map((bucket, idx) => (
							<span
								key={`bucket-mark-${idx}`}
								className={style.bucketMark}
								style={{
									left: (idx / buckets.length) * width,
									height:
										bucket.totalCount >= 2 ? '32%' : '16%',
								}}
							></span>
						))
				) : (
					<AreaChart
						width={width}
						height={36}
						data={buckets}
						margin={{ top: 4, bottom: 0, left: 0, right: 0 }}
					>
						<Area
							type="monotone"
							stroke="transparent"
							dataKey="totalCount"
							fill="var(--color-n-200)"
						></Area>
					</AreaChart>
				)}
				<div
					style={{
						left: 0,
						width: Math.min(leftProgress, rightProgress - 1),
					}}
					className={style.zoomArea}
				/>
				<div
					style={{
						left: rightProgress,
						width: width - rightProgress,
					}}
					className={style.zoomArea}
				/>
			</div>
			<div className={style.timelineContainer} ref={viewportRef}>
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
					<div
						className={style.timeIndicator}
						style={{
							left: timeIndicatorOffset,
						}}
					>
						<div
							className={style.timeIndicatorTop}
							ref={timeIndicatorTopRef}
						/>
						<span
							className={style.timeIndicatorHair}
							ref={timeIndicatorHairRef}
						></span>
					</div>
					<div className={style.eventTrack}>
						{buckets
							.map((bucket, idx) =>
								bucket.totalCount > 0 ? (
									<TimelineBar
										key={`${bucketSize.multiple}${bucketSize.tick}-${idx}`}
										bucket={bucket}
										width={
											idx === buckets.length - 1
												? lastBucketPercentWidth
												: bucketPercentWidth
										}
										left={idx * bucketPercentWidth}
										height={
											(bucket.totalCount /
												maxBucketCount) *
											100
										}
										viewportRef={viewportRef}
									/>
								) : null,
							)
							.filter(
								(_, idx) =>
									idx >= leftmostBucketIdx &&
									idx <= rightmostBucketIdx,
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
	targetBucketCount: number,
): BucketSize {
	const dur = moment.duration(duration)

	for (const bucketSize of BUCKET_SIZES) {
		let numIntervals = Number.MAX_VALUE
		switch (bucketSize.tick) {
			case TimelineTick.second:
				numIntervals = dur.asSeconds()
				break
			case TimelineTick.minute:
				numIntervals = dur.asMinutes()
				break
		}
		const bucketCount = Math.ceil(numIntervals / bucketSize.multiple)

		if (bucketCount <= targetBucketCount) {
			return bucketSize
		}
	}
	return BUCKET_SIZES.at(-1)!
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

	const defaultEventCounts = Object.fromEntries(
		selectedTimelineAnnotationTypes.map((eventType) => [eventType, 0]),
	)

	const numBuckets = Math.ceil(duration / timestep)
	const eventBuckets: EventBucket[] = Array.from(
		{ length: numBuckets },
		(_, idx) => ({
			label: idx,
			...defaultEventCounts,
			totalCount: 0,
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
		const bucketId = clamp(
			Math.ceil(
				((relativeIntervalPercentage! / 100) * duration) / timestep,
			) - 1,
			0,
			eventBuckets.length - 1,
		)
		if (eventBuckets[bucketId][eventType] === 0) {
			eventBuckets[bucketId][`${eventType}Identifier`] = identifier || ''
		}
		;(eventBuckets[bucketId][eventType] as number)++
		eventBuckets[bucketId].totalCount++
	}
	return eventBuckets
}
