import LoadingBox from '@components/LoadingBox'
import { Box, Text } from '@highlight-run/ui/components'
import { useHTMLElementEvent } from '@hooks/useHTMLElementEvent'
import { useWindowEvent } from '@hooks/useWindowEvent'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { HighlightEvent } from '@pages/Player/HighlightEvent'
import {
	getCommentsForTimelineIndicator,
	getErrorsForTimelineIndicator,
} from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	ParsedErrorObject,
	ParsedEvent,
	ReplayerState,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import { getEventRenderDetails } from '@pages/Player/StreamElement/StreamElement'
import TimelineBar from '@pages/Player/Toolbar/TimelineIndicators/TimelineBar/TimelineBar'
import ZoomArea from '@pages/Player/Toolbar/TimelineIndicators/ZoomArea/ZoomArea'
import {
	useToolbarItemsContext,
	ZoomAreaPercent,
} from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'
import { customEvent, EventType } from '@rrweb/types'
import { isInsideElement } from '@util/dom'
import { serializeErrorIdentifier } from '@util/error'
import { getErrorBody } from '@util/errors/errorUtils'
import { clamp } from '@util/numbers'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { formatTimeAsAlphanum, formatTimeAsHMS } from '@util/time'
import clsx from 'clsx'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { NumberParam, useQueryParams } from 'use-query-params'

import { useSessionParams } from '@/pages/Sessions/utils'

import { ToolbarControlBar } from '../../ToolbarControlBar/ToolbarControlBar'
import * as style from './style.css'
import { TIMELINE_MARGIN } from './style.css'

interface Props {
	selectedTimelineAnnotationTypes: string[]
	width: number
}

const TARGET_TICK_COUNT = 7
const CONTAINER_BORDER_WIDTH = 1
const TARGET_BUCKET_WIDTH_PERCENT = 4
const MINOR_TICK_COUNT = 3
const TARGET_INACTIVE_PERCENTAGE = 10
export const ZOOM_SCALING_FACTOR = 100
const MIN_ZOOM = 1.0
const INACTIVE_TICK_FREQUENCY = 7

type SessionEvent = ParsedEvent & {
	eventType: string
	identifier: string
	timestamp: number
}

const TimelineIndicatorsBarGraph = ({
	selectedTimelineAnnotationTypes,
	width,
}: Props) => {
	const { sessionSecureId } = useSessionParams()

	const { showPlayerAbsoluteTime, showHistogram: shouldShowHistogram } =
		usePlayerConfiguration()
	const { isPlayerFullscreen } = usePlayerUIContext()
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
		isPlayerReady,
		rageClicks,
	} = useReplayerContext()
	const showHistogram = shouldShowHistogram && !isPlayerFullscreen

	const [{ zoomStart, zoomEnd }] = useQueryParams({
		zoomStart: NumberParam,
		zoomEnd: NumberParam,
	})
	const { zoomAreaPercent, setZoomAreaPercent } = useToolbarItemsContext()

	const calculateViewportWidth = useCallback(() => {
		return Math.max(Math.round(width) - 2 * TIMELINE_MARGIN, 0)
	}, [width])

	const [camera, setCamera] = useState<Camera>({ x: 0, zoom: 1 })
	const [dragTime, setDragTime] = useState<number>(0)
	const [hasActiveScrollbar, setHasActiveScrollbar] = useState<boolean>(false)
	const [isDragging, setIsDragging] = useState<boolean>(false)
	const [isRefreshingDOM, setIsRefreshingDOM] = useState<boolean>(false)
	const [viewportWidth, setViewportWidth] = useState(calculateViewportWidth())

	const canvasRef = useRef<HTMLDivElement>(null)
	const sessionMonitorRef = useRef<HTMLDivElement>(null)
	const timeAxisRef = useRef<HTMLDivElement>(null)
	const timeIndicatorHairRef = useRef<HTMLSpanElement>(null)
	const timeIndicatorRef = useRef<HTMLDivElement>(null)
	const timeIndicatorTextRef = useRef<HTMLElement>(null)
	const timeIndicatorTopRef = useRef<HTMLDivElement>(null)
	const viewportRef = useRef<HTMLDivElement>(null)

	useLayoutEffect(() => {
		setViewportWidth(calculateViewportWidth())
	}, [width, showHistogram, calculateViewportWidth])

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
		return inactivityPeriods.map((interval) => {
			const fracInactive = interval[1] / inactiveDuration
			const adjustedDuration = Math.max(
				fracInactive * targetInactiveDuration,
				(activeDuration * TARGET_BUCKET_WIDTH_PERCENT) / 100,
			)

			const adjustedStart = interval[0] + durationCut
			durationCut += adjustedDuration - interval[1]

			return [adjustedStart, adjustedDuration] as [number, number]
		})
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
			return currTime
		},
		[adjustedInactivityPeriods, canvasDuration, inactivityPeriods],
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
				(error) =>
					({
						...error,
						identifier: serializeErrorIdentifier(error),
						timestamp: toTS(error.relativeIntervalPercentage),
						eventType: 'Errors',
					} as SessionEvent),
			),
			...(rageClicks.map((rageClick) => ({
				relativeIntervalPercentage: rageClick.startPercentage,
				timestamp: toTS(rageClick.startPercentage),
				eventType: 'RageClicks',
				identifier: `RageClicks-${rageClick.startTimestamp}`,
				data: {
					payload: rageClick.totalClicks,
					tag: 'RageClicks',
				},
				type: EventType.Custom,
			})) as SessionEvent[]),
		]

		combined.sort((a, b) => a.timestamp - b.timestamp)

		return combined
	}, [
		duration,
		eventsForTimelineIndicator,
		sessionComments,
		sessionErrors,
		start,
		rageClicks,
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

	// show 10s at max for long sessions
	const maxZoom = Math.max(adjustedDuration / 10_000, 2)

	const zoom = useCallback(
		(clientX: number, dz: number) => {
			const viewportDiv = viewportRef.current
			if (!viewportDiv || isLiveMode) {
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
		[isLiveMode, maxZoom, viewportWidth],
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

	const [showIndicatorText, setShowIndicatorText] = useState(false)

	useHTMLElementEvent(
		viewportRef.current,
		'wheel',
		(event: WheelEvent) => {
			event.preventDefault()
			event.stopPropagation()

			if (isRefreshingDOM || !showHistogram) {
				return
			}

			const { clientX, deltaY, deltaX, ctrlKey, metaKey } = event

			if (ctrlKey || metaKey) {
				const dz = deltaY / ZOOM_SCALING_FACTOR
				zoom(clientX, dz)
			} else {
				pan(deltaX)
			}
		},
		{ passive: false },
	)

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

	useEffect(() => {
		if (!showHistogram) {
			setCamera({ x: 0, zoom: 1 })
		}
	}, [showHistogram])

	const onDrag = useCallback(() => {
		setIsDragging(true)
		const timeIndicatorTopDiv = timeIndicatorTopRef.current
		if (!timeIndicatorTopDiv) {
			return
		}
		timeIndicatorTopDiv.style.cursor = 'grabbing'
	}, [])

	const onCanvasDrag = useCallback((e: PointerEvent) => {
		const canvasDiv = canvasRef.current
		if (!canvasDiv) {
			return
		}

		const el = e.target as HTMLDivElement
		// Only set dragging when the user clicks on the canvas, but not one of the
		// bars in the histogram.
		if (el === canvasDiv || el.parentNode === canvasDiv) {
			setIsDragging(true)
		}
	}, [])

	useHTMLElementEvent(timeIndicatorHairRef.current, 'pointerdown', onDrag, {
		passive: true,
	})
	useHTMLElementEvent(timeIndicatorTopRef.current, 'pointerdown', onDrag, {
		passive: true,
	})
	useHTMLElementEvent(canvasRef.current, 'pointerdown', onCanvasDrag, {
		passive: true,
	})

	const moveTime = useCallback(
		(event: MouseEvent) => {
			const viewportDiv = viewportRef.current
			if (!viewportDiv) {
				return 0
			}
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

			return Math.round(progressToTime(x / canvasWidth))
		},
		[progressToTime],
	)

	const onPointerdown = useCallback(
		(event: MouseEvent) => {
			const timeAxisDiv = timeAxisRef.current
			const viewportDiv = viewportRef.current
			if (!timeAxisDiv || !viewportDiv) {
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
				setDragTime(moveTime(event))
			}
			if (pointerY > histogramBottom) {
				setHasActiveScrollbar(true)
			}
		},
		[moveTime, onDrag],
	)

	useHTMLElementEvent(viewportRef.current, 'pointerdown', onPointerdown, {
		passive: true,
	})

	const onPointerup = useCallback(
		(event: MouseEvent) => {
			const timeIndicatorTopDiv = timeIndicatorTopRef.current
			if (!timeIndicatorTopDiv) {
				return
			}
			timeIndicatorTopDiv.style.cursor = 'grab'

			setIsDragging((isDragging) => {
				if (isDragging) {
					const newTime = moveTime(event)
					setDragTime(newTime)
					setTime(newTime)
				}
				return false
			})

			setHasActiveScrollbar(false)
		},
		[moveTime, setTime],
	)

	useWindowEvent('pointerup', onPointerup, { passive: true })

	const onVisibilityChange = useCallback(
		(event: MouseEvent) => {
			setDragTime(moveTime(event))
			const viewportBbox = viewportRef.current?.getBoundingClientRect()
			if (!viewportBbox) {
				return
			}
			const isInsideViewport = isInsideElement(event, viewportRef.current)

			const indicatorBbox =
				timeIndicatorRef.current?.getBoundingClientRect()
			if (!indicatorBbox) {
				return
			}

			if (!isInsideViewport) {
				setShowIndicatorText(false)
				return
			}

			setShowIndicatorText(
				isDragging || isInsideElement(event, timeIndicatorRef.current),
			)
		},
		[isDragging, moveTime],
	)
	useWindowEvent('pointermove', onVisibilityChange, { passive: true })
	useHTMLElementEvent(viewportRef.current, 'wheel', onVisibilityChange, {
		passive: true,
	})

	const onScroll = useCallback((event: Event) => {
		event.preventDefault()
		const viewportDiv = viewportRef.current
		if (!viewportDiv) {
			return
		}
		requestAnimationFrame(() =>
			setCamera(({ zoom }) => ({
				x: Math.min(
					viewportDiv.scrollLeft,
					viewportDiv.scrollWidth -
						viewportDiv.getBoundingClientRect().width,
				),
				zoom,
			})),
		)
	}, [])

	useHTMLElementEvent(viewportRef.current, 'scroll', onScroll, {
		passive: false,
	})

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
	}, [sessionSecureId])

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
			adjustedDuration / camera.zoom,
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

			const left = timeToProgress(timestamp) * canvasWidth

			// progress can be > 1 because of the rounding wrt to buckets
			if (left > canvasWidth) {
				break
			}

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
				className: clsx([style.timeTick, style.timeTickMajor]),
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

					const left = timeToProgress(timestamp) * canvasWidth

					if (left > canvasWidth) {
						break
					}

					tickProps.push({
						className: clsx([
							style.timeTick,
							{
								[style.timeTickMinor]: !isMid,
								[style.timeTickMid]: isMid,
							},
						]),
						left,
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

	const borderlessWidth = width - 2 * CONTAINER_BORDER_WIDTH // adjusting the width to account for the borders
	const useTransition = !isRefreshingDOM && !isDragging && time > 0
	const showSkeleton =
		!events.length ||
		replayerState === ReplayerState.Loading ||
		!canViewSession ||
		!isPlayerReady

	const sessionProgress = showSkeleton
		? 0
		: clamp((canvasProgress * canvasDuration) / adjustedDuration, 0, 1)

	const progressBar = useMemo(() => {
		return (
			<div className={style.progressBarContainer}>
				<div
					className={clsx([
						style.progressBar,

						{
							[style.moveIndicator]: useTransition,
						},
					])}
					style={{
						transform: `scaleX(${sessionProgress})`,
					}}
				/>

				{adjustedInactivityPeriods.map((interval, idx) => {
					const left =
						(interval[0] / adjustedDuration) * borderlessWidth
					const width =
						(interval[1] / adjustedDuration) * borderlessWidth
					const progress = clamp(
						(sessionProgress * adjustedDuration - interval[0]) /
							interval[1],
						0,
						1.01,
					)
					return (
						<div
							key={idx}
							className={style.inactivityPeriod}
							style={{
								left,
								width: clamp(width, 0, borderlessWidth - left),
							}}
						>
							<div
								className={style.inactivityPeriodPlayed}
								style={{ transform: `scaleX(${progress})` }}
							/>
						</div>
					)
				})}
			</div>
		)
	}, [
		adjustedDuration,
		adjustedInactivityPeriods,
		borderlessWidth,
		sessionProgress,
		useTransition,
	])

	const containerProgress = clamp(
		canvasWidth * canvasProgress,
		0,
		canvasWidth,
	)
	const timeIndicatorStart =
		containerProgress - style.TIME_INDICATOR_TOP_WIDTH / 2

	const timeIndicatorTextWidth =
		timeIndicatorTextRef.current?.getBoundingClientRect().width || 0

	const textStart =
		timeIndicatorStart +
		TIMELINE_MARGIN -
		timeIndicatorTextWidth / 2 +
		style.TIME_INDICATOR_TOP_WIDTH / 2 -
		camera.x

	if (showSkeleton) {
		return (
			<Box
				cssClass={[style.timelineContainer]}
				style={{
					width,
				}}
			>
				{progressBar}
				<ToolbarControlBar />
				<LoadingBox
					height={
						style.TIME_AXIS_HEIGHT +
						(showHistogram
							? style.SEPARATOR_HEIGHT +
							  style.HISTOGRAM_AREA_HEIGHT +
							  style.SESSION_MONITOR_HEIGHT
							: 0)
					}
				/>
			</Box>
		)
	}

	return (
		<div className={style.timelineContainer} style={{ width }}>
			{progressBar}
			<ToolbarControlBar />
			<div
				className={clsx([
					style.viewportContainer,
					{
						[style.hideOverflow]: !showHistogram,
					},
				])}
				ref={viewportRef}
			>
				<div
					className={style.timeIndicatorContainerWrapper}
					style={{
						width: canvasWidth,
					}}
				>
					<div
						ref={timeIndicatorRef}
						className={clsx([
							style.timeIndicatorContainer,
							{
								[style.moveIndicator]: useTransition,
							},
						])}
						style={{
							transform: `translateX(${timeIndicatorStart}px)`,
						}}
					>
						{!isLiveMode && (
							<div className={style.timeIndicator}>
								<span
									className={style.timeIndicatorTop}
									ref={timeIndicatorTopRef}
								/>
								<Box
									as="span"
									cssClass={[
										style.timeIndicatorHair,
										{
											[style.hairHidden]: !showHistogram,
										},
									]}
									ref={timeIndicatorHairRef}
								/>
							</div>
						)}
					</div>
				</div>
				<div className={style.timeAxis} ref={timeAxisRef}>
					{ticks}
				</div>
				<div
					className={clsx([
						style.separator,
						{
							[style.hidden]: !showHistogram,
						},
					])}
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
							className={clsx([style.inactivityPeriodMask])}
							style={{
								width,
								left,
							}}
						/>
					)
				})}
				<div
					className={clsx([
						style.eventHistogram,
						{
							[style.hidden]:
								!showHistogram || isPlayerFullscreen,
							[style.noPointerEvents]: isLiveMode,
						},
					])}
					ref={canvasRef}
				>
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
							.map((bucket, idx) => {
								if (!bucket.totalCount) {
									return null
								}

								const barHeightAdjustment =
									1 -
									style.HISTOGRAM_OFFSET /
										style.HISTOGRAM_AREA_HEIGHT

								const relativeHeight =
									barHeightAdjustment *
									(bucket.totalCount / maxBucketCount) *
									100
								return (
									<TimelineBar
										key={`${bucketSize.multiple}${bucketSize.tick}-${idx}`}
										bucket={bucket}
										width={bucketPercentWidth}
										height={relativeHeight}
										disabled={isLiveMode}
										viewportRef={viewportRef}
									/>
								)
							})}
					</div>
				</div>
			</div>
			<div
				className={clsx([
					style.sessionMonitor,
					{
						[style.hidden]: !showHistogram,
					},
				])}
				ref={sessionMonitorRef}
			>
				<ZoomArea
					containerWidth={borderlessWidth}
					containerLeft={
						sessionMonitorRef.current?.getBoundingClientRect()
							.left || 0
					}
					update={updateCameraFromZoomArea}
					minZoomAreaPercent={(100 * zoomAdjustment) / maxZoom}
				/>
			</div>
			<Box
				ref={timeIndicatorTextRef}
				background="n12"
				borderRadius="10"
				position="absolute"
				px="8"
				py="2"
				display="flex"
				justifyContent="center"
				alignItems="center"
				cssClass={clsx(style.timeIndicatorText, {
					[style.moveIndicator]: useTransition,
				})}
				style={{
					transform: `translateX(${textStart}px)`,
					visibility: showIndicatorText ? 'visible' : 'hidden',
					top:
						style.PROGRESS_BAR_HEIGHT +
						32 +
						style.TIME_AXIS_HEIGHT -
						style.TIME_INDICATOR_TOP_HEIGHT -
						style.TIME_INDICATOR_TEXT_HEIGHT -
						4,
				}}
			>
				<Text
					ref={timeIndicatorTextRef}
					color="n5"
					size="xSmall"
					userSelect="none"
				>
					{formatTimeOnTop(shownTime)}
				</Text>
			</Box>
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
		[types: string]: string[]
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
				instance: {},
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
		let details = JSON.stringify(
			getEventRenderDetails(event as HighlightEvent).displayValue,
		)?.replaceAll(/^"|"$/g, '')

		if (!!(event as ParsedErrorObject).error_group_secure_id) {
			details = getErrorBody((event as ParsedErrorObject).event)
		}
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
