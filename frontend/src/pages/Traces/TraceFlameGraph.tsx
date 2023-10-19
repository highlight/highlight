import {
	Box,
	ButtonIcon,
	IconSolidZoomIn,
	IconSolidZoomOut,
	Text,
} from '@highlight-run/ui'
import { useCallback, useMemo, useRef, useState } from 'react'

import { Trace, TraceError } from '@/graph/generated/schemas'
import { TraceFlameGraphNode } from '@/pages/Traces/TraceFlameGraphNode'
import {
	FlameGraphSpan,
	getFirstSpan,
	getMaxDepth,
	getTraceDurationString,
	organizeSpans,
} from '@/pages/Traces/utils'

const MAX_TICKS = 6
export const ticksHeight = 24
export const outsidePadding = 4
export const lineHeight = 18

type Props = {
	errors: TraceError[]
	hoveredSpan: FlameGraphSpan | undefined
	selectedSpan: FlameGraphSpan | undefined
	startTime: number
	trace: Trace[]
	totalDuration: number
	onSpanSelect: (span?: FlameGraphSpan) => void
	onSpanMouseEnter: (span?: FlameGraphSpan) => void
}

export const TraceFlameGraph: React.FC<Props> = ({
	errors,
	hoveredSpan,
	selectedSpan,
	startTime,
	totalDuration,
	trace,
	onSpanSelect,
	onSpanMouseEnter,
}) => {
	const svgContainerRef = useRef<HTMLDivElement>(null)
	const [tooltipCoordinates, setTooltipCoordinates] = useState({
		x: 0,
		y: 0,
	})
	const [zoom, setZoom] = useState(1)
	// TODO: Make dynamic. Consider using auto sizer.
	const width = 660

	const traces = useMemo(() => {
		if (!trace) return []
		const sortableTraces = [...trace]

		if (!selectedSpan) {
			const firstSpan = getFirstSpan(sortableTraces)

			if (firstSpan) {
				onSpanSelect(firstSpan as FlameGraphSpan)
			}
		}

		return organizeSpans(sortableTraces)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trace])

	const height = useMemo(() => {
		if (!traces.length) return 260

		const maxDepth = getMaxDepth(traces)
		const lineHeightWithPadding = lineHeight + 4
		return maxDepth * lineHeightWithPadding + ticksHeight + outsidePadding
	}, [traces])

	const ticks = useMemo(() => {
		if (!totalDuration) return []

		const length = Math.round(MAX_TICKS * zoom)
		return Array.from({ length }).map((_, index) => {
			const percent = index / (length - 1)
			const tickDuration = totalDuration * percent
			const time = getTraceDurationString(tickDuration)

			return {
				time: time.trim() === '' ? '0ms' : time,
				percent,
				x: width * percent * zoom,
			}
		})
	}, [totalDuration, zoom, width])

	const setTooltipCoordinatesImpl = useCallback((e: React.MouseEvent) => {
		const elementBounds = e.currentTarget.getBoundingClientRect()
		const y = elementBounds.top - 60
		const x = e.clientX

		setTooltipCoordinates({ x, y })
	}, [])

	const handleZoom = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
		additionalZoom: number,
	) => {
		e.preventDefault()
		e.stopPropagation()

		const newZoom = Math.max(1, Math.round(zoom + additionalZoom))
		const currentScrollPosition = svgContainerRef.current?.scrollLeft ?? 0
		const visibleCenter = currentScrollPosition + width / 2
		const newVisibleCenter = visibleCenter * (newZoom / zoom)
		const isScrolledAllTheWayToTheLeft = currentScrollPosition <= 1
		const isScrolledAllTheWayToTheRight =
			currentScrollPosition >= width * zoom - (width + 2)
		const newScrollPosition = isScrolledAllTheWayToTheRight
			? width * newZoom - width
			: isScrolledAllTheWayToTheLeft
			? currentScrollPosition
			: newVisibleCenter - width / 2

		setZoom(newZoom)
		setTimeout(() => {
			svgContainerRef.current?.scrollTo(newScrollPosition, 0)
		})
	}

	return (
		<Box
			backgroundColor="raised"
			borderRadius="6"
			border="dividerWeak"
			position="relative"
		>
			<Box
				display="flex"
				gap="2"
				position="absolute"
				style={{
					bottom: 4,
					left: 4,
				}}
			>
				<ButtonIcon
					size="xSmall"
					kind="secondary"
					icon={<IconSolidZoomIn />}
					onClick={(e) => handleZoom(e, 1)}
				>
					Zoom In
				</ButtonIcon>
				<ButtonIcon
					size="xSmall"
					kind="secondary"
					icon={<IconSolidZoomOut />}
					onClick={(e) => handleZoom(e, -1)}
				>
					Zoom Out
				</ButtonIcon>
			</Box>
			<Box
				ref={svgContainerRef}
				overflowY="scroll"
				style={{
					maxHeight: 300,
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height={height}
					width={width * zoom}
					style={{ display: 'block' }}
				>
					<line
						stroke="#e4e2e4"
						x1={0}
						y1={ticksHeight}
						x2={width * zoom}
						y2={ticksHeight}
					/>

					{ticks.map((tick) => {
						const isFirstTick = tick.percent === 0
						const isLastTick = tick.percent === 1
						const x = isFirstTick
							? outsidePadding
							: isLastTick
							? tick.x - outsidePadding
							: tick.x

						return (
							<g key={tick.time}>
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
					{traces.map((span, index) => {
						return (
							<TraceFlameGraphNode
								key={index}
								errors={errors}
								span={span}
								totalDuration={totalDuration}
								startTime={startTime}
								depth={0}
								height={height}
								width={width}
								zoom={zoom}
								selectedSpan={selectedSpan}
								setHoveredSpan={onSpanMouseEnter}
								setSelectedSpan={onSpanSelect}
								setTooltipCoordinates={
									setTooltipCoordinatesImpl
								}
							/>
						)
					})}
				</svg>
				{hoveredSpan && (
					// TODO: Move tooltip component outside the graph to prevent rerenders.
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
							{getTraceDurationString(hoveredSpan.start) || '0ms'}
						</Text>
					</Box>
				)}
			</Box>
		</Box>
	)
}
