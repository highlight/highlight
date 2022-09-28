import { Skeleton } from '@components/Skeleton/Skeleton'
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	ParsedEvent,
	ParsedSessionInterval,
	ReplayerState,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import TimelineBar, {
	IBarRectangle,
} from '@pages/Player/Toolbar/TimelineIndicators/TimelineBar/TimelineBar'
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import { clamp } from '@util/numbers'
import { useParams } from '@util/react-router/useParams'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { formatTimeAsAlphanum, formatTimeAsHMS } from '@util/time'
import classNames from 'classnames'
import { debounce } from 'lodash'
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
	targetBucketCount: number
	timelineMargin: number
	width: number
}

const TimelineIndicatorsBarGraph = ({
	selectedTimelineAnnotationTypes,
	targetBucketCount,
	timelineMargin,
	width,
}: Props) => {
	const { showPlayerAbsoluteTime } = usePlayerConfiguration()
	const {
		time,
		sessionMetadata: { startTime, totalTime: duration },
		setTime,
		setCurrentEvent,
		sessionIntervals,
		play,
		pause,
		state,
		replayer,
	} = useReplayerContext()

	const { session_secure_id } = useParams<{
		session_secure_id: string
	}>()

	const events = useMemo(
		() => parseEvents(sessionIntervals),
		[sessionIntervals],
	)

	const [camera, setCamera] = useState<Camera>({ x: 0, zoom: 1 })

	const bucketSize = useMemo(
		() => pickBucketSize(duration / camera.zoom, targetBucketCount),
		[duration, camera.zoom, targetBucketCount],
	)
	const buckets = useMemo(
		() =>
			buildEventBuckets(
				events,
				duration,
				bucketSize,
				selectedTimelineAnnotationTypes,
			),
		[events, duration, bucketSize, selectedTimelineAnnotationTypes],
	)

	const formatTimeOnTop = useCallback(
		(t: number) =>
			showPlayerAbsoluteTime
				? playerTimeToSessionAbsoluteTime({
						sessionStartTime: startTime,
						relativeTime: t,
				  }).toString()
				: formatTimeAsHMS(t),
		[startTime, showPlayerAbsoluteTime],
	)

	const viewportRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLDivElement>(null)
	const timeAxisRef = useRef<HTMLDivElement>(null)
	const progressRef = useRef<HTMLDivElement>(null)
	const timeIndicatorTopRef = useRef<HTMLDivElement>(null)
	const timeIndicatorHairRef = useRef<HTMLSpanElement>(null)
	const [viewportWidth, setViewportWidth] = useState(0)
	useLayoutEffect(() => {
		const div = viewportRef.current
		if (!div) {
			return
		}
		setViewportWidth(div.offsetWidth - 2 * timelineMargin)
	}, [viewportRef, timelineMargin, width])

	const shouldMockActivityGraph = useMemo(() => {
		// buckets with less than 2 events slow down rendering,
		// so we fall back to a <span>-based mockup if too many buckets are small
		if (buckets.length > 1000) {
			let shouldMock = true
			for (const bucket of buckets) {
				if (bucket.totalCount > 2) {
					shouldMock = false
				}
			}
			return shouldMock
		}
		return false
	}, [buckets])

	const [isRefreshingDOM, setIsRefreshingDOM] = useState<boolean>(false)
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

			setIsRefreshingDOM(true)

			const { clientX, deltaY, deltaX, ctrlKey } = event
			const { offsetWidth, offsetLeft, scrollLeft } = viewportDiv
			const viewportWidth = offsetWidth - 2 * timelineMargin
			const pointerX = clientX + document.documentElement.scrollLeft
			if (ctrlKey) {
				setCamera((camera) => {
					const dz = deltaY / ZOOM_SCALING_FACTOR

					const factor = dz < 0 ? 1 - dz : 1 / (1 + dz)

					const minZoom = 1

					// show 10s at max for long sessions
					const maxZoom = Math.max(duration / 10_000, 2)
					const zoom = clamp(factor * camera.zoom, minZoom, maxZoom)

					const pointer = clamp(
						pointerX - offsetLeft - timelineMargin,
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
	}, [viewportRef, isRefreshingDOM, timelineMargin, duration])

	const [hasActiveScrollbar, setHasActiveScrollbar] = useState<boolean>(false)
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [shownTime, setShownTime] = useState<number>(time)
	useEffect(() => {
		if (state === ReplayerState.Playing && !isDragging) {
			setShownTime(time)
		}
	}, [state, time, setShownTime, isDragging])

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
	}, [
		camera,
		hasActiveScrollbar,
		viewportRef,
		canvasRef,
		timeAxisRef,
		viewportWidth,
	])

	useLayoutEffect(() => {
		const viewportDiv = viewportRef.current
		const timeIndicatorTopDiv = timeIndicatorTopRef.current
		const timeIndicatorHair = timeIndicatorHairRef.current
		if (!viewportDiv || !timeIndicatorTopDiv || !timeIndicatorHair) {
			return
		}

		let isOnScrollbar = false
		let isToDrag = false

		const setTimeDebounced = debounce(setTime, 300)
		const moveTime = (event: MouseEvent, isFinal?: boolean) => {
			const { clientX } = event
			const { offsetLeft, scrollLeft, scrollWidth } = viewportDiv
			const canvasWidth = scrollWidth - 2 * timelineMargin
			const pointerX = clientX + document.documentElement.scrollLeft
			const x = clamp(
				scrollLeft + pointerX - offsetLeft - timelineMargin,
				0,
				canvasWidth,
			)

			const newTime = clamp(
				Math.round((x * duration) / canvasWidth),
				0,
				duration,
			)
			setShownTime(newTime)
			if (isFinal) {
				setTimeDebounced(newTime)
			}
		}

		const onDrag = () => {
			isToDrag = true
			setIsDragging(isToDrag)
			timeIndicatorTopDiv.style.cursor = 'grabbing'
		}

		const onViewportPointerdown = (event: MouseEvent) => {
			const timeAxisDiv = timeAxisRef.current
			if (!timeAxisDiv) {
				return
			}
			const { clientY } = event
			const { offsetTop } = viewportDiv
			const { offsetHeight: timeAxisHeight } = timeAxisDiv
			const timeAxisBottom = offsetTop + timeAxisHeight
			const pointerY = clientY + document.documentElement.scrollTop

			if (pointerY >= timeAxisBottom) {
				isOnScrollbar = true
				setHasActiveScrollbar(isOnScrollbar)
			} else {
				onDrag()
			}
		}
		const onGlobalPointerup = (event: MouseEvent) => {
			timeIndicatorTopDiv.style.cursor = 'grab'

			if (isToDrag) {
				isToDrag = false
				setIsDragging(false)
				moveTime(event, true)
			}

			isOnScrollbar = false
			setHasActiveScrollbar(false)
		}

		const onPointermove = (event: MouseEvent) => {
			if (isToDrag) {
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

		viewportDiv.addEventListener('pointerdown', onViewportPointerdown)
		timeIndicatorHair.addEventListener('pointerdown', onDrag)
		viewportDiv.addEventListener('scroll', onScroll, { passive: false })
		document.addEventListener('pointerup', onGlobalPointerup)
		document.addEventListener('pointermove', onPointermove, {
			passive: false,
		})
		return () => {
			viewportDiv.removeEventListener(
				'pointerdown',
				onViewportPointerdown,
			)
			timeIndicatorHair.removeEventListener('pointerdown', onDrag)
			viewportDiv.removeEventListener('scroll', onScroll)
			document.removeEventListener('pointerup', onGlobalPointerup)
			document.removeEventListener('pointermove', onPointermove)
		}
	}, [
		viewportRef,
		timeAxisRef,
		timeIndicatorTopRef,
		timeIndicatorHairRef,
		timelineMargin,
		width,
		duration,
		setTime,
		camera.zoom,
		viewportWidth,
	])

	const barChartData = useMemo(() => {
		const maxTotal = Math.max(...buckets.map((bucket) => bucket.totalCount))
		return buckets.map((bucket) => {
			const barData: IBarRectangle[] = EventsForTimeline.map(
				(eventType) => ({
					color: `var(${getAnnotationColor(eventType)})`,
					percent: ((bucket[eventType] as number) / maxTotal) * 100,
				}),
			).filter((rect) => rect.percent > 0)
			return barData
		})
	}, [buckets])

	const leftProgress = useMemo(() => {
		const canvasWidth = viewportWidth * camera.zoom
		const x =
			clamp(camera.x, timelineMargin, canvasWidth - viewportWidth) -
			timelineMargin
		return (width * x) / canvasWidth
	}, [viewportWidth, camera.zoom, camera.x, timelineMargin, width])

	const rightProgress = useMemo(() => {
		const canvasWidth = viewportWidth * camera.zoom
		const actualZoom = canvasWidth / (viewportWidth + 2 * timelineMargin)
		return leftProgress + width / actualZoom
	}, [viewportWidth, camera.zoom, timelineMargin, leftProgress, width])

	const leftmostBucketIdx = useMemo(() => {
		return clamp(
			Math.floor((leftProgress * buckets.length) / width) - 2,
			0,
			buckets.length - 1,
		)
	}, [buckets, leftProgress, width])

	const rightmostBucketIdx = useMemo(() => {
		return clamp(
			Math.ceil((rightProgress / width) * buckets.length) + 2,
			0,
			buckets.length - 1,
		)
	}, [buckets, rightProgress, width])

	const ticks = useMemo(() => {
		let size = pickBucketSize(duration / camera.zoom, 20)
		// do Math.ceil to have 1 second as the min tick
		size = { ...size, multiple: Math.ceil(size.multiple) }
		const mainTickInMs = getBucketSizeInMs(size)

		const numTicks = Math.round(duration / mainTickInMs) + 1
		const elms = []

		const canvasWidth = viewportWidth * camera.zoom
		const step = (mainTickInMs * canvasWidth) / duration
		const minorStep = step / 4

		for (let idx = 0; idx < numTicks; ++idx) {
			const left = idx * step
			const progress = left / canvasWidth
			if (
				progress < leftmostBucketIdx / buckets.length ||
				progress > (rightmostBucketIdx + 1) / buckets.length
			) {
				continue
			}
			const key = `${idx * size.multiple}${size.tick}`
			const text = formatTimeAsAlphanum(mainTickInMs * idx)
			const fontWeight = text.includes('h')
				? 600
				: text.includes('m')
				? 500
				: 400
			elms.push(
				<span
					className={style.timeMarker}
					key={`tick-verbose-${key}`}
					style={{
						left: left - text.length * 1.5,
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
					style={{ left: left, borderLeftWidth }}
				></span>,
			)
			if (idx !== numTicks - 1) {
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
		duration,
		camera.zoom,
		viewportWidth,
		leftmostBucketIdx,
		buckets.length,
		rightmostBucketIdx,
	])

	const [timeIndicatorOffset, setTimeIndicatorOffset] = useState<number>(-25)
	useEffect(() => {
		const timeIndicatorTop = timeIndicatorTopRef.current
		if (!timeIndicatorTop) {
			return
		}
		setTimeIndicatorOffset(
			(shownTime * viewportWidth * camera.zoom) / duration -
				timeIndicatorTop.offsetWidth / 2,
		)
	}, [camera.zoom, duration, shownTime, viewportWidth])

	if (!sessionIntervals.length) {
		return (
			<div
				className={style.timelineIndicatorsContainer}
				style={{ width }}
			>
				<div className={style.progressMonitor} ref={progressRef}>
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
			<div className={style.progressMonitor} ref={progressRef}>
				<div className={style.progressBarContainer}>
					{time > 0 ? (
						<div
							className={style.progressBar}
							style={{
								width: (shownTime * width) / duration,
							}}
						></div>
					) : null}
				</div>
				{shouldMockActivityGraph ? (
					buckets.map((bucket, idx) => {
						if (bucket.totalCount > 0) {
							return (
								<span
									key={`bucket-mark-${idx}`}
									className={style.bucketMark}
									style={{
										left: (idx / buckets.length) * width,
										height:
											bucket.totalCount >= 2
												? '32%'
												: '16%',
									}}
								></span>
							)
						}
					})
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
							fill="var(--color-gray-300)"
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
						width: viewportWidth * camera.zoom + 2 * timelineMargin,
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
						>
							{formatTimeOnTop(shownTime)}
						</div>
						<span
							className={style.timeIndicatorHair}
							ref={timeIndicatorHairRef}
						></span>
					</div>
					<div className={style.eventTrack}>
						{barChartData.map((barData, idx) => {
							if (
								idx < leftmostBucketIdx ||
								idx > rightmostBucketIdx
							) {
								return null
							}
							const barWidth = 100 / buckets.length
							return (
								<TimelineBar
									key={`${bucketSize.multiple}${bucketSize.tick}-${idx}`}
									data={barData}
									barWidth={barWidth}
									left={idx * barWidth}
									margin={4}
								/>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}

export default TimelineIndicatorsBarGraph

interface SessionEvent {
	eventType: string
	sessionLoc: number
	identifier?: string
}

interface Camera {
	x: number
	zoom: number
}
interface EventBucket {
	[props: string]: number | string
	totalCount: number
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

function parseEvents(sessionIntervals: ParsedSessionInterval[]) {
	const events = sessionIntervals
		.filter((session) => session.active)
		.reduce(
			(acc, interval) => acc.concat(parseSessionInterval(interval)),
			[] as SessionEvent[],
		)
	events.sort((a: any, b: any) => -b.sessionLoc + a.sessionLoc)
	return events
}

function parseSessionInterval(interval: ParsedSessionInterval): SessionEvent[] {
	const events: SessionEvent[] = []

	const { endPercent: endProgress, startPercent: startProgress } = interval
	const intervalRange = endProgress - startProgress

	const getSessionLoc = (relPercentage: number) => {
		return (intervalRange * (relPercentage || 0)) / 100 + startProgress
	}

	interval.sessionEvents.forEach((event: ParsedEvent) => {
		if (event.relativeIntervalPercentage === undefined) {
			return
		}

		if (event.type === 5) {
			const eventType = event.data.tag as typeof EventsForTimeline[number]

			if (event.relativeIntervalPercentage === undefined) {
				return
			}

			events.push({
				eventType,
				sessionLoc: getSessionLoc(event.relativeIntervalPercentage),
				identifier: event.identifier,
			})
		}
	})

	interval.errors.forEach((error: any) => {
		if (error.relativeIntervalPercentage === undefined) {
			return
		}

		events.push({
			eventType: 'Errors',
			sessionLoc: getSessionLoc(error.relativeIntervalPercentage),
		})
	})

	interval.comments.forEach((comment: any) => {
		if (comment.relativeIntervalPercentage === undefined) {
			return
		}

		events.push({
			eventType: 'Comments',
			sessionLoc: getSessionLoc(comment.relativeIntervalPercentage),
		})
	})

	return events
}

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
	bucketSize: BucketSize,
	selectedTimelineAnnotationTypes: string[],
): EventBucket[] {
	if (events.length < 2 || !selectedTimelineAnnotationTypes.length) {
		return []
	}

	const defaultEventCounts = Object.fromEntries(
		Array.from(selectedTimelineAnnotationTypes).map((eventType) => [
			eventType,
			0,
		]),
	)

	const timestep = getBucketSizeInMs(bucketSize)
	const numBuckets = Math.ceil(duration / timestep)
	const buckets: any = Array.from({ length: numBuckets }, (_, idx) => ({
		label: idx,
		...defaultEventCounts,
		totalCount: 0,
	}))

	for (const { eventType, sessionLoc } of events) {
		if (!selectedTimelineAnnotationTypes.includes(eventType)) {
			continue
		}
		const bucketId = clamp(
			Math.floor((sessionLoc * duration) / timestep),
			0,
			numBuckets - 1,
		)
		buckets[bucketId][eventType]++
		buckets[bucketId].totalCount++
	}
	return buckets
}
