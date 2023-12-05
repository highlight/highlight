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
import { TraceFlameGraphNode } from '@/pages/Traces/TraceFlameGraphNode'
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

const MAX_VISIBLE_TICKS = 6
const MAX_TICKS = 20
const MAX_ZOOM = 1000
export const ticksHeight = 24
export const outsidePadding = 4
export const lineHeight = 18
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
	const [zoom, setZoom] = useState(1)
	const [x, setX] = useState(0)
	const [width, setWidth] = useState<number | undefined>(undefined)
	const [tooltipCoordinates, setTooltipCoordinates] = useState({
		x: 0,
		y: 0,
	})

	const height = useMemo(() => {
		if (!traces.length) return 260

		const maxDepth = traces.length
		const lineHeightWithPadding = lineHeight + 4
		return maxDepth * lineHeightWithPadding + ticksHeight + outsidePadding
	}, [traces])

	const ticks = useMemo(() => {
		if (!totalDuration || !width) return []

		const length = Math.round(MAX_VISIBLE_TICKS * zoom)
		const timeUnit =
			timeUnits.find(
				({ divider }) => totalDuration / length / divider > 1,
			) ?? timeUnits[timeUnits.length - 2]

		const scrollPercent =
			x / Math.max(svgContainerRef.current!.scrollWidth, 1)
		const ticksVisibleAtX = Math.round(length * scrollPercent)
		const minIndex = Math.max(ticksVisibleAtX - MAX_TICKS / 2, 0)
		const maxIndex = Math.min(ticksVisibleAtX + MAX_TICKS / 2, length - 1)

		const ticks = []
		for (let index = minIndex; index <= maxIndex; index++) {
			const percent = index / (length - 1)
			const tickDuration = totalDuration * percent
			const displayDuration =
				Math.round((tickDuration / timeUnit!.divider) * 10) / 10
			const time = `${displayDuration}${timeUnit!.unit}` ?? '0ms'

			ticks.push({
				time,
				percent,
				x: width * percent * zoom,
			})
		}

		return ticks
	}, [totalDuration, zoom, width, x])

	const setTooltipCoordinatesImpl = useCallback((e: React.MouseEvent) => {
		const elementBounds = e.currentTarget.getBoundingClientRect()
		const y = elementBounds.top - 60
		const x = e.clientX

		setTooltipCoordinates({ x, y })
	}, [])

	const updateZoom = useCallback(
		(newZoom: number, scrollPosition?: number) => {
			setZoom((prevZoom) => {
				const newScrollPosition =
					scrollPosition ??
					(svgContainerRef.current?.scrollLeft ?? 0) *
						(newZoom / prevZoom)

				setTimeout(() => {
					svgContainerRef.current?.scrollTo(newScrollPosition, 0)
					setX(newScrollPosition)
				}, 0)

				return newZoom
			})
		},
		[],
	)

	const handleZoom = useCallback(
		(dz: number) => {
			const change = dz * (zoom / 4)
			const newZoom = Math.min(
				Math.max(zoom + change / MAX_ZOOM, 1),
				MAX_ZOOM,
			)

			updateZoom(newZoom)
		},
		[updateZoom, zoom],
	)
	const throttledZoom = useRef(throttle(handleZoom, 50))

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

			if (ctrlKey || metaKey) {
				event.preventDefault()
				event.stopPropagation()

				throttledZoom.current(deltaY)
			}
		},
		{ passive: false },
	)

	useEffect(() => {
		setZoom(1)

		if (svgContainerRef.current) {
			setWidth(svgContainerRef.current?.clientWidth)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
			e.preventDefault()
			e.stopPropagation()

			if (!dragging) return

			const { clientX } = e
			const { left } = svgContainerRef.current!.getBoundingClientRect()

			setCurrentDragX(clientX - left + x)
		},
		[dragging, x],
	)

	const handleMouseUp = useCallback(
		(e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
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

	if (loading) {
		return (
			<Box
				backgroundColor="raised"
				borderRadius="6"
				border="dividerWeak"
				style={{ height: 150 }}
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
				{width && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						height={height + 20}
						width={width * zoom}
						style={{ display: 'block' }}
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
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

				{hoveredSpan && (
					<Box
						position="fixed"
						display="flex"
						flexDirection="column"
						gap="6"
						style={{
							left: tooltipCoordinates.x - 10,
							top: tooltipCoordinates.y + 5,
							backgroundColor: '#fff',
							padding: '4px 8px',
							borderRadius: '4px',
							zIndex: 1000,
						}}
						shadow="small"
						border="dividerWeak"
					>
						<Text weight="bold" lines="1">
							{hoveredSpan.spanName}
						</Text>
						<Text lines="1">
							Duration:{' '}
							{getTraceDurationString(hoveredSpan.duration)}
						</Text>
						<Text lines="1">
							Start:{' '}
							{getTraceDurationString(hoveredSpan.startTime) ||
								'0ms'}
						</Text>
					</Box>
				)}
			</Box>

			<Box p="2" borderTop="dividerWeak">
				<Stack gap="2" direction="row" align="center">
					<ButtonIcon
						onClick={() => handleZoom(-1000)}
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
						onClick={() => handleZoom(1000)}
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
