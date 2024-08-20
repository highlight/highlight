import {
	Box,
	ButtonIcon,
	IconSolidMinus,
	IconSolidPlus,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import clsx from 'clsx'
import { debounce, throttle } from 'lodash'
import {
	BaseSyntheticEvent,
	DragEventHandler,
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import LoadingBox from '@/components/LoadingBox'
import { useHTMLElementEvent } from '@/hooks/useHTMLElementEvent'
import { ZOOM_SCALING_FACTOR } from '@/pages/Player/Toolbar/TimelineIndicators/TimelineIndicatorsBarGraph/TimelineIndicatorsBarGraph'
import {
	getSpanTheme,
	TraceFlameGraphNode,
} from '@/pages/Traces/TraceFlameGraphNode'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { getTraceDurationString } from '@/pages/Traces/utils'
import {
	styledHorizontalScrollbar,
	styledVerticalScrollbar,
} from '@/style/common.css'

import * as styles from './TraceFlameGraph.css'

// Empty image to replace drag image
const dragImg = new Image()
dragImg.src =
	'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const DEFAULT_HEIGHT = 150
const MAX_VISIBLE_TICKS = 6
const MAX_TICKS = 20
const MAX_ZOOM = 1000
export const ticksHeight = 24
export const outsidePadding = 4
export const lineHeight = 20
const timeUnits = [
	{ unit: 'h', divider: 1e9 * 60 * 60 },
	{ unit: 'm', divider: 1e9 * 60 },
	{ unit: 's', divider: 1e9 },
	{ unit: 'ms', divider: 1000000 },
	{ unit: 'μs', divider: 1000 },
]

export const TraceFlameGraph: React.FC = () => {
	const zoomBar = useRef<HTMLDivElement>(null)
	const { hoveredSpan, loading, totalDuration, traces } = useTrace()
	const svgContainerRef = useRef<HTMLDivElement>(null)
	const tooltipRef = useRef<HTMLDivElement>(null)
	const [zoom, setZoom] = useState(1)
	const [x, setX] = useState(0)
	const [width, setWidth] = useState<number | undefined>(undefined)
	const hoveredSpanTheme = getSpanTheme(hoveredSpan)
	const [tooltipCoordinates, setTooltipCoordinates] = useState({
		x: 0,
		y: 0,
	})

	const height = useMemo(() => {
		if (!traces.length || !width) return DEFAULT_HEIGHT - 60

		const maxDepth = traces.length
		const lineHeightWithPadding = lineHeight + 4
		return maxDepth * lineHeightWithPadding + ticksHeight + outsidePadding
	}, [traces.length, width])

	const ticks = useMemo(() => {
		if (!totalDuration || !width || !svgContainerRef.current) return []

		const length = Math.round(MAX_VISIBLE_TICKS * zoom)
		const timeUnit =
			timeUnits.find(
				({ divider }) => totalDuration / length / divider > 1,
			) ?? timeUnits[timeUnits.length - 2]

		const scrollPercent =
			x / Math.max(svgContainerRef.current.scrollWidth, 1)
		const ticksVisibleAtX = Math.round(length * scrollPercent)
		const minIndex = Math.max(ticksVisibleAtX - MAX_TICKS / 2, 0)
		const maxIndex = Math.min(ticksVisibleAtX + MAX_TICKS / 2, length - 1)

		const tcks = []
		for (let index = minIndex; index <= maxIndex; index++) {
			const percent = index / (length - 1)
			const tickDuration = totalDuration * percent
			const displayDuration =
				Math.round((tickDuration / timeUnit!.divider) * 10) / 10
			const time = `${displayDuration}${timeUnit!.unit}` ?? '0ms'

			tcks.push({
				time,
				percent,
				x: width * percent * zoom,
			})
		}

		return tcks
	}, [totalDuration, zoom, width, x])

	const setTooltipCoordinatesImpl = useCallback((e: React.MouseEvent) => {
		const y = window.innerHeight - e.clientY
		const x = window.innerWidth - e.clientX

		setTooltipCoordinates({ x, y })
	}, [])

	const updateZoom = useCallback(
		(newZoom: number, scrollPosition?: number) => {
			setZoom((prevZoom) => {
				const newScrollPosition =
					scrollPosition ??
					(svgContainerRef.current?.scrollLeft ?? 0) *
						(newZoom / prevZoom)

				requestAnimationFrame(() => {
					svgContainerRef.current?.scrollTo(newScrollPosition, 0)
					setX(newScrollPosition)
				})

				return newZoom
			})
		},
		[],
	)

	const handleZoomFactorChange = useCallback(
		(dz: number, mouseX?: number) => {
			setZoom((prevZoom) => {
				const factor = dz < 0 ? 1 - dz : 1 / (1 + dz)
				const newZoom = Math.min(
					Math.max(prevZoom * factor, 1),
					MAX_ZOOM,
				)

				let newScrollPosition =
					((svgContainerRef.current?.scrollLeft ?? 0) +
						(svgContainerRef.current?.clientWidth ?? 0) / 2) *
						(newZoom / prevZoom) -
					(svgContainerRef.current?.clientWidth ?? 0) / 2

				if (mouseX !== undefined) {
					const scrollX = svgContainerRef.current?.scrollLeft ?? 0
					const mouseOffset =
						mouseX -
						svgContainerRef.current!.getBoundingClientRect().left
					const contentX = mouseOffset + scrollX
					const newContentX = contentX * (newZoom / prevZoom)
					newScrollPosition = newContentX - mouseOffset
				}

				requestAnimationFrame(() => {
					svgContainerRef.current?.scrollTo(newScrollPosition, 0)
					setX(newScrollPosition)
				})

				return newZoom
			})
		},
		[],
	)

	const throttledHandleZoomFactorChange = useMemo(
		() => throttle(handleZoomFactorChange, 50),
		[handleZoomFactorChange],
	)

	const handleScroll = useCallback(
		(currentTarget: BaseSyntheticEvent['currentTarget']) => {
			const scrollLeft = currentTarget?.scrollLeft
			if (scrollLeft !== undefined) {
				setX(currentTarget.scrollLeft)
			}
		},
		[],
	)

	const handleDrag: DragEventHandler<HTMLElement> = useCallback(
		(e) => {
			e.preventDefault()
			e.stopPropagation()

			const { clientX } = e
			if (!clientX) return

			const { left, width } = zoomBar.current!.getBoundingClientRect()
			const percent = Math.max(0, Math.min(1, (clientX - left) / width))
			updateZoom(Math.max(percent * MAX_ZOOM, 1))
		},
		[updateZoom],
	)
	const throttledDragHandler = useRef(throttle(handleDrag, 50))

	useHTMLElementEvent(
		svgContainerRef.current,
		'wheel',
		(event: WheelEvent) => {
			const { deltaY, ctrlKey, metaKey } = event

			// Some browers report ctrlKey as true when using a pinch gesture on a
			// trackpad. This is where the pinch to zoom functionality comes from.
			if ((ctrlKey || metaKey) && deltaY !== 0) {
				event.preventDefault()
				event.stopPropagation()

				throttledHandleZoomFactorChange(
					deltaY / ZOOM_SCALING_FACTOR,
					event.clientX,
				)
			}
		},
		{ passive: false },
	)

	useEffect(() => {
		setZoom(1)
	}, [loading])

	useEffect(() => {
		if (svgContainerRef.current) {
			const handleResize = debounce((entries: ResizeObserverEntry[]) => {
				setWidth(entries[0].contentRect.width)
			}, 50)

			const resizeObserver = new ResizeObserver(handleResize)
			resizeObserver.observe(svgContainerRef.current)

			return () => {
				resizeObserver.disconnect()
			}
		}

		// Pass loading to trigger again in case ref wasn't ready on initial render
	}, [loading])

	const [dragging, setDragging] = useState(false)
	const [initialDragX, setInitialDragX] = useState(0)
	const [currentDragX, setCurrentDragX] = useState(0)

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
			e.preventDefault()
			e.stopPropagation()

			const { clientX } = e
			const { left } = svgContainerRef.current!.getBoundingClientRect()
			const svgX = clientX - left + x

			setDragging(true)
			setInitialDragX(svgX)
			setCurrentDragX(svgX)
		},
		[x],
	)

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
			if (!dragging) {
				return
			}

			e.preventDefault()
			e.stopPropagation()

			const { clientX } = e
			const { left, width } =
				svgContainerRef.current!.getBoundingClientRect()
			const newX = clientX - left + x
			const boundedX = Math.max(0, Math.min(newX, width * zoom))

			setCurrentDragX(boundedX)
		},
		[dragging, x, zoom],
	)

	const handleMouseUp = useCallback(
		(e: MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()

			setDragging(false)
			setCurrentDragX(0)
			setInitialDragX(0)

			const { left } = svgContainerRef.current!.getBoundingClientRect()
			const svgX = e.clientX - left + x
			const deltaX = Math.abs(svgX - initialDragX)

			if (deltaX <= 1) return

			const newZoom = Math.max(
				Math.min(((width! * zoom) / (deltaX * zoom)) * zoom, MAX_ZOOM),
				1,
			)
			const newScrollPosition =
				(Math.min(initialDragX, currentDragX) / zoom) * newZoom
			updateZoom(newZoom, newScrollPosition)
		},
		[currentDragX, initialDragX, updateZoom, width, x, zoom],
	)

	useEffect(() => {
		const onMouseUp = (e: MouseEvent) => {
			handleMouseUp(e)
		}

		if (dragging) {
			window.addEventListener('mouseup', onMouseUp)
		}

		return () => {
			window.removeEventListener('mouseup', onMouseUp)
		}
	}, [dragging, handleMouseUp])

	if (loading) {
		return (
			<Box
				backgroundColor="raised"
				borderRadius="6"
				border="dividerWeak"
				style={{ height: DEFAULT_HEIGHT }}
			>
				<LoadingBox />
			</Box>
		)
	}

	return (
		<Box
			backgroundColor="raised"
			borderRadius="6"
			border="dividerWeak"
			position="relative"
		>
			<Box
				ref={svgContainerRef}
				overflowX="scroll"
				cssClass={clsx(
					styledVerticalScrollbar,
					styledHorizontalScrollbar,
					styles.flameGraph,
				)}
				onScroll={({ currentTarget }) => {
					debounce(handleScroll, 50)(currentTarget)
				}}
			>
				{!!width && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height={height + 20}
						width={width * zoom}
						style={{ display: 'block' }}
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
					>
						<line
							stroke="#e4e2e4"
							x1={0}
							y1={ticksHeight}
							x2={width * zoom}
							y2={ticksHeight}
						/>

						{ticks.map((tick, index) => {
							const isFirstTick = tick.percent === 0
							const isLastTick = tick.percent === 1
							const x = isFirstTick
								? outsidePadding
								: isLastTick
									? tick.x - outsidePadding
									: tick.x

							return (
								<g
									key={`${tick.time}-${index}`}
									pointerEvents="none"
								>
									<line
										x1={x}
										y1={ticksHeight - 8}
										x2={x}
										y2={ticksHeight - 2}
										stroke="#e4e2e4"
									/>

									<text
										x={x}
										y={12}
										fill="#6f6e77"
										fontSize={10}
										textAnchor={
											isFirstTick
												? 'start'
												: isLastTick
													? 'end'
													: 'middle'
										}
									>
										{tick.time}
									</text>
								</g>
							)
						})}
						{traces.map((spans, index) => {
							return (
								<Fragment key={index}>
									{spans.map((span) => {
										return (
											<TraceFlameGraphNode
												key={span.spanID}
												span={span}
												width={
													width - outsidePadding * 2
												}
												zoom={zoom}
												setTooltipCoordinates={
													setTooltipCoordinatesImpl
												}
											/>
										)
									})}
								</Fragment>
							)
						})}

						{dragging && (
							<rect
								fill="rgba(255, 255, 255, 0.5)"
								x={
									currentDragX < initialDragX
										? currentDragX
										: initialDragX
								}
								y={ticksHeight}
								height={height}
								width={Math.abs(currentDragX - initialDragX)}
							/>
						)}
					</svg>
				)}

				{!!hoveredSpan && (
					<Box
						ref={tooltipRef}
						position="fixed"
						display="flex"
						flexDirection="column"
						gap="8"
						style={{
							right: tooltipCoordinates.x,
							bottom: tooltipCoordinates.y + 8,
							minWidth: 224,
							zIndex: 1000,
						}}
						shadow="small"
						backgroundColor="white"
						border="dividerWeak"
						borderRadius="6"
						px="8"
						py="10"
					>
						<Text
							lines="1"
							size="small"
							weight="medium"
							color="default"
						>
							{hoveredSpan.spanName}
						</Text>
						<Stack gap="4" direction="row">
							<Box
								borderRadius="4"
								p="4"
								style={{
									backgroundColor:
										hoveredSpanTheme.background,
									border: `1px solid ${hoveredSpanTheme.background}`,
									color: hoveredSpanTheme.color,
								}}
							>
								<Text weight="medium">
									{hoveredSpan.serviceName}
								</Text>
							</Box>
							<Box
								backgroundColor="white"
								borderRadius="4"
								border="dividerWeak"
								p="4"
							>
								<Text color="default" weight="medium">
									{getTraceDurationString(
										hoveredSpan.duration,
									)}
								</Text>
							</Box>
						</Stack>
					</Box>
				)}
			</Box>

			<Box p="2" borderTop="dividerWeak">
				<Stack gap="2" direction="row" align="center">
					<ButtonIcon
						onClick={() => handleZoomFactorChange(0.5)}
						kind="secondary"
						emphasis="low"
						size="xSmall"
						icon={<IconSolidMinus />}
					/>
					<Box
						ref={zoomBar}
						backgroundColor="surfaceNeutral"
						borderRadius="8"
						cursor="pointer"
						position="relative"
						userSelect="none"
						onClick={throttledDragHandler.current}
						style={{
							height: 8,
							width: 80,
						}}
					>
						<Box
							backgroundColor="white"
							border="dividerStrong"
							borderRadius="8"
							borderWidth="medium"
							cursor="pointer"
							position="absolute"
							draggable
							onDragStart={(e) => {
								e.dataTransfer.setDragImage(dragImg, 0, 0)
							}}
							onDrag={throttledDragHandler.current}
							style={{
								height: 10,
								width: 10,
								top: -1,
								left: `${
									(zoom / MAX_ZOOM) * 100 -
									(zoom / MAX_ZOOM) * 10
								}%`,
							}}
						/>
					</Box>
					<ButtonIcon
						onClick={() => handleZoomFactorChange(-0.5)}
						kind="secondary"
						emphasis="low"
						size="xSmall"
						icon={<IconSolidPlus />}
					/>
				</Stack>
			</Box>
		</Box>
	)
}
