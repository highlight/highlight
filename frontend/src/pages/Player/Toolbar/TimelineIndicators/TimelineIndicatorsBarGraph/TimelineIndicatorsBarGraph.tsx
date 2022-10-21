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
const TICK_ZOOM_DISCOUNT = 1.4
const CONTAINER_BORDER_WIDTH = 1
const TARGET_BUCKET_WIDTH_PERCENT = 4
const MINOR_TICK_COUNT = 3
const TARGET_INACTIVE_PERCENTAGE = 10
const ZOOM_SCALING_FACTOR = 100
const MIN_ZOOM = 1.0
const INACTIVE_TICK_FREQUENCY = 7

export const TIMELINE_MARGIN = 32
type SessionEvent = ParsedEvent & {
	eventType: string
	identifier: string
	timestamp: number
}

const TimelineIndicatorsBarGraph = ({
	selectedTimelineAnnotationTypes,
	width,
}: Props) => {
	const { session_secure_id } = useParams<{ session_secure_id: string }>()

	const { showPlayerAbsoluteTime, showHistogram } = usePlayerConfiguration()
	const {
		time,
		sessionMetadata: { startTime: start, totalTime: duration },
		setTime,
		eventsForTimelineIndicator,
		sessionComments,
		errors: sessionErrors,
		sessionIntervals,
		isLiveMode,
		canViewSession,
		state: replayerState,
	} = useReplayerContext()

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
	const sessionMonitorRef = useRef<HTMLDivElement>(null)

	const [viewportWidth, setViewportWidth] = useState(0)
	useLayoutEffect(() => {
		const div = viewportRef.current
		if (!div) {
			return
		}
		const bbox = div.getBoundingClientRect()
		setViewportWidth(Math.round(bbox.width) - 2 * TIMELINE_MARGIN)
	}, [width, showHistogram])

	const inactivityPeriods: [number, number][] = useMemo(() => {
		return sessionIntervals
			.filter((interval) => !interval.active)
			.map((interval) => [
				interval.startTime,
				interval.endTime - interval.startTime,
			])
	}, [sessionIntervals])

	const inactiveDuration = useMemo(
		() => inactivityPeriods.reduce((acc, curr) => acc + curr[1], 0),
		[inactivityPeriods],
	)

	const activeDuration = duration - inactiveDuration

	const adjustedInactivityPeriods: [number, number][] = useMemo(() => {
		const targetInactiveDuration =
			(activeDuration * TARGET_INACTIVE_PERCENTAGE) / 100

		if (inactiveDuration <= targetInactiveDuration) {
			return inactivityPeriods
		}

		let durationCut = 0
		const adjusted = inactivityPeriods.map((interval) => {
			const fracInactive = interval[1] / inactiveDuration
			const adjustedDuration = Math.max(
				fracInactive * targetInactiveDuration,
				(activeDuration * TARGET_BUCKET_WIDTH_PERCENT) / 100,
			)

			const adjustedStart = interval[0] + durationCut
			durationCut += adjustedDuration - interval[1]

			return [adjustedStart, adjustedDuration] as [number, number]
		})
		return adjusted
	}, [activeDuration, inactiveDuration, inactivityPeriods])

	const adjustedInactiveDuration = adjustedInactivityPeriods.reduce(
		(acc, curr) => acc + curr[1],
		0,
	)
	const adjustedDuration = activeDuration + adjustedInactiveDuration

	const roundingTimestep = getBucketSizeInMs(
		pickBucketSize(adjustedDuration, TARGET_BUCKET_WIDTH_PERCENT),
	)
	// canvasDuration is only used to make bucketing with margins work;
	// canvasWidth = alpha * canvasDuration for some constant alpha
	const canvasDuration =
		Math.ceil(adjustedDuration / roundingTimestep) * roundingTimestep

	const timeToProgress = useCallback(
		(currTime: number) => {
			let canvasTime = currTime
			if (inactivityPeriods.length > 0) {
				let idx = 0
				while (idx < inactivityPeriods.length) {
					const inactive = inactivityPeriods[idx]
					const adjustedInactive = adjustedInactivityPeriods[idx]
					if (currTime > inactive[0] + inactive[1]) {
						canvasTime += adjustedInactive[1] - inactive[1]
						idx++
					} else {
						break
					}
				}
				if (idx < inactivityPeriods.length) {
					const inactive = inactivityPeriods[idx]
					const adjustedInactive = adjustedInactivityPeriods[idx]
					if (
						currTime >= inactive[0] &&
						currTime <= inactive[0] + inactive[1]
					) {
						const seen = currTime - inactive[0]
						canvasTime -= seen
						canvasTime += (adjustedInactive[1] * seen) / inactive[1]
					}
				}
			}
			return canvasTime / canvasDuration
		},
		[adjustedInactivityPeriods, canvasDuration, inactivityPeriods],
	)
	const progressToTime = useCallback(
		(progress: number) => {
			const canvasTime = progress * canvasDuration
			let currTime = canvasTime
			if (adjustedInactivityPeriods.length > 0) {
				let idx = 0
				while (idx < adjustedInactivityPeriods.length) {
					const adjusted = adjustedInactivityPeriods[idx]
					const original = inactivityPeriods[idx]
					if (canvasTime > adjusted[0] + adjusted[1]) {
						currTime += original[1] - adjusted[1]
						idx++
					} else {
						break
					}
				}
				if (idx < adjustedInactivityPeriods.length) {
					const adjusted = adjustedInactivityPeriods[idx]
					const inactive = inactivityPeriods[idx]
					if (
						canvasTime >= adjusted[0] &&
						canvasTime <= adjusted[0] + adjusted[1]
					) {
						const bit = canvasTime - adjusted[0]
						const scale = inactive[1] / adjusted[1]
						currTime += bit * scale - bit
					}
				}
			}
			return clamp(currTime, 0, duration)
		},
		[
			adjustedInactivityPeriods,
			canvasDuration,
			duration,
			inactivityPeriods,
		],
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
			})),
			...comments.map((event) => ({
				...event,
				identifier: event.id,
				eventType: 'Comments',
				timestamp: toTS(event.relativeIntervalPercentage),
			})),
			...errors.map(
				(event) =>
					({
						...event,
						identifier: event.error_group_secure_id,
						timestamp: toTS(event.relativeIntervalPercentage),
						eventType: 'Errors',
					} as SessionEvent),
			),
		]

		combined.sort((a, b) => a.timestamp - b.timestamp)

		return combined
	}, [
		duration,
		eventsForTimelineIndicator,
		sessionComments,
		sessionErrors,
		start,
	])

	const bucketSize = pickBucketSize(
		canvasDuration / camera.zoom,
		TARGET_BUCKET_WIDTH_PERCENT,
	)
	const bucketTimestep = getBucketSizeInMs(bucketSize)
	const bucketPercentWidth = (100 * bucketTimestep) / canvasDuration
	const buckets = useMemo(
		() =>
			buildViewportEventBuckets(
				events,
				canvasDuration,
				bucketTimestep,
				selectedTimelineAnnotationTypes,
				progressToTime,
				timeToProgress,
			),
		[
			events,
			canvasDuration,
			bucketTimestep,
			selectedTimelineAnnotationTypes,
			progressToTime,
			timeToProgress,
		],
	)
	const areaChartBuckets = useMemo(() => {
		return buildViewportEventBuckets(
			events,
			adjustedDuration,
			bucketTimestep,
			selectedTimelineAnnotationTypes,
			progressToTime,
			timeToProgress,
		)
	}, [
		adjustedDuration,
		bucketTimestep,
		events,
		selectedTimelineAnnotationTypes,
		timeToProgress,
		progressToTime,
	])

	const areaChartMaxBucketCount = useMemo(
		() => Math.max(...areaChartBuckets.map(({ totalCount }) => totalCount)),
		[areaChartBuckets],
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

	// show 10s at max for long sessions
	const maxZoom = Math.max(adjustedDuration / 10_000, 2)

	const zoom = useCallback(
		(clientX: number, dz: number) => {
			const viewportDiv = viewportRef.current
			if (!viewportDiv) {
				return
			}

			const pointerX = clientX + document.documentElement.scrollLeft
			const bbox = viewportDiv.getBoundingClientRect()
			const { scrollLeft } = viewportDiv

			const factor = dz < 0 ? 1 - dz : 1 / (1 + dz)

			setCamera((camera) => {
				setIsRefreshingDOM(true)
				const zoom = clamp(factor * camera.zoom, MIN_ZOOM, maxZoom)
				const pointA =
					scrollLeft +
					clamp(
						pointerX - bbox.left - TIMELINE_MARGIN,
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
	}, [
		duration,
		isRefreshingDOM,
		maxZoom,
		pan,
		viewportWidth,
		zoom,
		showHistogram,
	])

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
	}, [camera, hasActiveScrollbar, viewportWidth, showHistogram])

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
			const bbox = viewportDiv.getBoundingClientRect()
			const { scrollLeft, scrollWidth } = viewportDiv
			const canvasWidth = scrollWidth - 2 * TIMELINE_MARGIN
			const pointerX = clientX + document.documentElement.scrollLeft
			const x = clamp(
				scrollLeft + pointerX - bbox.left - TIMELINE_MARGIN,
				0,
				canvasWidth,
			)

			const newTime = clamp(
				Math.round(progressToTime(x / canvasWidth)),
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
	}, [duration, viewportWidth, showHistogram])

	const borderlessWidth = width - 2 * CONTAINER_BORDER_WIDTH // adjusting the width to account for the borders

	const canvasWidth = viewportWidth * camera.zoom
	const zoomAdjustment = 1 + (2 * TIMELINE_MARGIN) / viewportWidth
	useLayoutEffect(() => {
		// camera.x frame of reference is the canvas; to fix it to the viewport and make
		// margins insignificant parts of panning/zooming the session, we clamp the values
		const relativeX = clamp(
			camera.x - TIMELINE_MARGIN,
			0,
			canvasWidth - viewportWidth,
		)
		const zoomProgress = (1 / camera.zoom) * zoomAdjustment
		const leftProgress = clamp(relativeX / canvasWidth, 0, 1 - zoomProgress)
		const rightProgress = clamp(
			leftProgress + zoomProgress,
			zoomProgress,
			1,
		)
		const left = clamp(leftProgress * 100, 0, 100)
		const right = clamp(rightProgress * 100, left, 100)
		if (Number.isFinite(left) && Number.isFinite(right)) {
			setZoomAreaPercent({
				left,
				right,
			})
		}
	}, [
		camera.x,
		camera.zoom,
		canvasWidth,
		setZoomAreaPercent,
		viewportWidth,
		zoomAdjustment,
	])

	const updateCameraFromZoomArea = useCallback(
		(percent: ZoomAreaPercent) => {
			const { left, right } = percent
			let zoom = clamp(
				(100 * zoomAdjustment) / (right - left),
				MIN_ZOOM,
				maxZoom,
			)
			const canvasWidth = viewportWidth * zoom
			let x = (left * canvasWidth) / 100 + TIMELINE_MARGIN
			if (x <= TIMELINE_MARGIN) {
				x = 0
			}

			if (zoom <= MIN_ZOOM * zoomAdjustment) {
				zoom = MIN_ZOOM
			}

			requestAnimationFrame(() => {
				setCamera({ x, zoom })
			})
		},
		[maxZoom, viewportWidth, zoomAdjustment],
	)

	useLayoutEffect(() => {
		const left = Number.isFinite(zoomStart) ? clamp(zoomStart!, 0, 100) : 0
		const right = Number.isFinite(zoomEnd)
			? clamp(zoomEnd!, left + 1 / Number.MAX_VALUE, 100)
			: 100
		const zoomPercent = {
			left,
			right,
		}
		setZoomAreaPercent(zoomPercent)
		updateCameraFromZoomArea(zoomPercent)
		// run once for session secure id
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session_secure_id])

	const isVisible = useCallback(
		(...percents: number[]) => {
			const { left, right } = zoomAreaPercent
			const marginProgress = TIMELINE_MARGIN / viewportWidth
			const leftPct = clamp(left - marginProgress * 100, 0, 100)
			const rightPct = clamp(right + marginProgress * 100, 0, 100)

			return percents.reduce((prev, pct) => {
				pct = Math.max(pct, 0)
				return prev || (leftPct <= pct && pct <= rightPct)
			}, false)
		},
		[viewportWidth, zoomAreaPercent],
	)
	const ticks = useMemo(() => {
		let size = pickBucketSize(
			(adjustedDuration * TICK_ZOOM_DISCOUNT) / camera.zoom,
			100 / TARGET_TICK_COUNT,
		)

		size = {
			...size,
			multiple: Math.max(size.multiple, 1),
		}

		const mainTickInMs = getBucketSizeInMs(size)

		const numTicks = Math.ceil(duration / mainTickInMs)

		const tickProps: TimelineTickProps[] = []

		let timestamp = 0
		const estimateTextOffset = (text: string) => text.length * 3
		for (let idx = 0; idx <= numTicks; ++idx) {
			timestamp = mainTickInMs * idx
			const left = timeToProgress(timestamp) * canvasWidth
			let zeroUnit = ''
			if (timestamp === 0) {
				if (duration > 60_000) {
					zeroUnit = 'm'
				} else if (duration > 60 * 60_000) {
					zeroUnit = 'h'
				} else {
					zeroUnit = 's'
				}
			}
			const text = formatTimeAsAlphanum(timestamp, { zeroUnit })
			const fontWeight = text.includes('h')
				? 500
				: text.includes('m')
				? 450
				: 400

			tickProps.push({
				className: style.timeTickMark,
				left: left - estimateTextOffset(text),
				fontWeight,
				text,
				timestamp,
			})

			const borderLeftWidth = text.includes('h')
				? 1
				: text.includes('m')
				? 0.75
				: 0.5

			tickProps.push({
				className: classNames(style.timeTick, style.timeTickMajor),
				left,
				borderLeftWidth,
				timestamp,
			})

			if (idx !== numTicks) {
				for (
					let minorIdx = 0;
					minorIdx < MINOR_TICK_COUNT;
					++minorIdx
				) {
					const mid = (MINOR_TICK_COUNT - 1) / 2
					const isMid = minorIdx === mid && MINOR_TICK_COUNT % 2 === 1
					timestamp += mainTickInMs / (MINOR_TICK_COUNT + 1)
					tickProps.push({
						className: classNames(style.timeTick, {
							[style.timeTickMinor]: !isMid,
							[style.timeTickMid]: isMid,
						}),
						left: timeToProgress(timestamp) * canvasWidth,
						timestamp,
					})
				}
			}
		}

		const toDelete = new Set<number>()
		const numInactiveTicks: { [idx: number]: number } = {}
		const belongsToInactive: { [idx: number]: number } = {}
		let isAfterInactivity = false

		const formatAfterInactivity = (tick: TimelineTickProps) => {
			const oldText = tick.text || ''
			tick.text = formatTimeAsAlphanum(tick.timestamp, {
				showDetails: true,
			})
			tick.left +=
				estimateTextOffset(oldText) - estimateTextOffset(tick.text)
		}

		if (inactivityPeriods.length > 0) {
			let tickIdx = 0
			let inactiveIdx = 0
			while (
				tickIdx < tickProps.length &&
				inactiveIdx < inactivityPeriods.length
			) {
				const tick = tickProps[tickIdx]
				const original = inactivityPeriods[inactiveIdx]
				const left = Math.max(tick.timestamp, original[0])
				const right = Math.min(
					tick.timestamp,
					original[0] + original[1],
				)

				if (left <= right) {
					if (tick.className.includes(style.timeTickMajor)) {
						belongsToInactive[tickIdx] = inactiveIdx
						numInactiveTicks[inactiveIdx] =
							numInactiveTicks[inactiveIdx] >= 0
								? numInactiveTicks[inactiveIdx] + 1
								: 1
					} else {
						toDelete.add(tickIdx)
					}
					isAfterInactivity = true
				} else {
					if (
						isAfterInactivity &&
						tick.className.includes(style.timeTickMark)
					) {
						isAfterInactivity = false
						formatAfterInactivity(tick)
					}
				}

				if (tick.timestamp < original[0] + original[1]) {
					tickIdx++
				} else {
					inactiveIdx++
				}
			}
			if (isAfterInactivity) {
				for (; tickIdx < tickProps.length; ++tickIdx) {
					const tick = tickProps[tickIdx]
					if (tick.className.includes(style.timeTickMark)) {
						formatAfterInactivity(tick)
						isAfterInactivity = false
						break
					}
				}
			}
		}
		return tickProps
			.filter(
				(_, idx) =>
					!toDelete.has(idx) &&
					(belongsToInactive[idx] !== undefined
						? numInactiveTicks[belongsToInactive[idx]] >
						  INACTIVE_TICK_FREQUENCY
							? idx % INACTIVE_TICK_FREQUENCY === 0
							: true
						: true),
			)
			.filter(
				({ left }) =>
					isVisible((100 * left) / canvasWidth + 1) ||
					isVisible((100 * left) / canvasWidth - 1),
			)
			.map(({ className, text, ...style }, idx) => (
				<span className={className} key={idx} style={style}>
					{text}
				</span>
			))
	}, [
		adjustedDuration,
		camera.zoom,
		canvasWidth,
		duration,
		inactivityPeriods,
		isVisible,
		timeToProgress,
	])

	const shownTime = isDragging ? dragTime : time
	const canvasProgress = timeToProgress(shownTime)
	const sessionProgress = (canvasProgress * canvasDuration) / adjustedDuration

	const progressBar = useMemo(() => {
		return (
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
											sessionProgress * borderlessWidth,
											0,
											borderlessWidth,
										),
									}}
								/>
								{adjustedInactivityPeriods.map(
									(interval, idx) => {
										if (
											interval[0] / adjustedDuration >=
											sessionProgress
										) {
											return null
										}

										const left =
											(interval[0] / adjustedDuration) *
											borderlessWidth
										const width =
											(Math.min(
												sessionProgress *
													adjustedDuration -
													interval[0],
												interval[1],
											) /
												adjustedDuration) *
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
									},
								)}
							</>
						) : null}
						{adjustedInactivityPeriods.map((interval, idx) => {
							const left =
								(interval[0] / adjustedDuration) *
								borderlessWidth
							const width =
								(interval[1] / adjustedDuration) *
								borderlessWidth
							return (
								<div
									key={idx}
									className={style.inactivityPeriod}
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
				)}
			</div>
		)
	}, [
		adjustedDuration,
		adjustedInactivityPeriods,
		borderlessWidth,
		isLiveMode,
		sessionProgress,
		shownTime,
	])

	const sessionMonitor = useMemo(() => {
		return areaChartBuckets.length > 200 ? (
			areaChartBuckets
				.filter((bucket) => bucket.totalCount > 0)
				.map(({ totalCount, startPercent }, idx) => (
					<span
						key={`bucket-mark-${idx}`}
						className={style.bucketMark}
						style={{
							left: `${startPercent}%`,
							height: `${clamp(
								(100 * totalCount) / areaChartMaxBucketCount,
								0,
								100,
							)}%`,
						}}
					></span>
				))
		) : (
			<AreaChart
				width={borderlessWidth}
				height={22}
				data={areaChartBuckets}
				margin={{ top: 4, bottom: 0, left: 0, right: 0 }}
			>
				<Area
					type="monotone"
					stroke="transparent"
					dataKey="totalCount"
					fill="var(--color-neutral-200)"
				></Area>
			</AreaChart>
		)
	}, [areaChartBuckets, areaChartMaxBucketCount, borderlessWidth])

	const showSkeleton =
		!events.length ||
		replayerState === ReplayerState.Loading ||
		!canViewSession

	if (showSkeleton) {
		return (
			<div
				className={style.timelineIndicatorsContainer}
				style={{ width }}
			>
				<div
					className={style.progressBarContainer}
					style={{
						background: 'none',
						overflow: 'hidden',
					}}
				>
					<Skeleton
						style={{
							height: 20,
							top: -10,
							position: 'absolute',
						}}
					/>
				</div>
				{isLiveMode || !showHistogram ? null : (
					<>
						<div
							className={style.sessionMonitor}
							ref={sessionMonitorRef}
						>
							<Skeleton height={22} />
						</div>
						<div
							className={style.timelineContainer}
							ref={viewportRef}
						>
							<Skeleton height={'100%'} />
						</div>
					</>
				)}
			</div>
		)
	}

	if (isLiveMode || !showHistogram) {
		return (
			<div
				className={style.timelineIndicatorsContainer}
				style={{ width }}
			>
				{progressBar}
			</div>
		)
	}

	return (
		<div className={style.timelineIndicatorsContainer} style={{ width }}>
			{progressBar}
			<div className={style.sessionMonitor} ref={sessionMonitorRef}>
				{sessionMonitor}
				<ZoomArea
					containerWidth={borderlessWidth}
					wrapperRef={sessionMonitorRef}
					update={updateCameraFromZoomArea}
					minZoomAreaPercent={(100 * zoomAdjustment) / maxZoom}
				/>
			</div>
			<div className={style.timelineContainer} ref={viewportRef}>
				<TimeIndicator
					left={clamp(
						canvasWidth * canvasProgress + TIMELINE_MARGIN,
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
				{adjustedInactivityPeriods.map((inactive, idx) => {
					const width = (inactive[1] / canvasDuration) * canvasWidth
					const left =
						TIMELINE_MARGIN +
						(inactive[0] / canvasDuration) * canvasWidth
					return (
						<span
							key={idx}
							className={style.inactivityPeriodMask}
							style={{
								width,
								left,
							}}
						></span>
					)
				})}
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

function buildViewportEventBuckets(
	events: SessionEvent[],
	canvasDuration: number,
	timestep: number,
	selectedTimelineAnnotationTypes: string[],
	viewportProgressToTime: (progress: number) => number,
	timeToViewportProgress: (time: number) => number,
): EventBucket[] {
	if (
		!selectedTimelineAnnotationTypes.length ||
		!events.length ||
		canvasDuration <= 0
	) {
		return []
	}

	const numBuckets = Math.ceil(canvasDuration / timestep)
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
		const { eventType, timestamp, identifier } = event
		const adjustedTimestamp =
			timeToViewportProgress(timestamp) * canvasDuration
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

interface TimelineTickProps {
	timestamp: number
	left: number
	className: string
	text?: string
	fontWeight?: number
	borderLeftWidth?: number
}
