import { Box, Text } from '@highlight-run/ui'
import { throttle } from 'lodash'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import { useHTMLElementEvent } from '@/hooks/useHTMLElementEvent'
import { TraceFlameGraphNode } from '@/pages/Traces/TraceFlameGraphNode'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { getMaxDepth, getTraceDurationString } from '@/pages/Traces/utils'

const MAX_TICKS = 6
export const ticksHeight = 24
export const outsidePadding = 4
export const lineHeight = 18
const defaultCanvasWidth = 660
const timeUnits = [
	{ unit: 'h', divider: 1e9 * 60 * 60 },
	{ unit: 'm', divider: 1e9 * 60 },
	{ unit: 's', divider: 1e9 },
	{ unit: 'ms', divider: 1000000 },
	{ unit: 'μs', divider: 1000 },
]

export const TraceFlameGraph: React.FC = () => {
	const { hoveredSpan, selectedSpan, totalDuration, traces } = useTrace()
	const svgContainerRef = useRef<HTMLDivElement>(null)
	const [zoom, setZoom] = useState(1)
	const [width, setWidth] = useState(defaultCanvasWidth)
	const [tooltipCoordinates, setTooltipCoordinates] = useState({
		x: 0,
		y: 0,
	})

	const setWidthImpl = useCallback(() => {
		if (svgContainerRef.current?.clientWidth) {
			setWidth(svgContainerRef.current?.clientWidth)
		}
	}, [])
	useLayoutEffect(setWidthImpl, [setWidthImpl])

	const height = useMemo(() => {
		if (!traces.length) return 260

		const maxDepth = getMaxDepth(traces)
		const lineHeightWithPadding = lineHeight + 4
		return maxDepth * lineHeightWithPadding + ticksHeight + outsidePadding
	}, [traces])

	const ticks = useMemo(() => {
		if (!totalDuration) return []

		const length = Math.round(MAX_TICKS * zoom)
		const timeUnit =
			timeUnits.find(
				({ divider }) => totalDuration / length / divider > 1,
			) ?? timeUnits[timeUnits.length - 2]
		return Array.from({ length }).map((_, index) => {
			const percent = index / (length - 1)
			const tickDuration = totalDuration * percent
			const displayDuration =
				Math.round((tickDuration / timeUnit!.divider) * 10) / 10
			const time = `${displayDuration}${timeUnit!.unit}` ?? '0ms'

			return {
				time,
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

	const handleZoom = useCallback((dz: number) => {
		setZoom((prevZoom) => {
			const newZoom = Math.max(1, prevZoom + dz)
			const newScrollPosition =
				(svgContainerRef.current?.scrollLeft ?? 0) *
				(newZoom / prevZoom)

			setTimeout(() => {
				svgContainerRef.current?.scrollTo(newScrollPosition, 0)
			}, 0)

			return newZoom
		})
	}, [])

	const throttledZoom = useRef(throttle((dz: number) => handleZoom(dz), 50))

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
		setWidthImpl()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [traces])

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
				style={{
					maxHeight: 300,
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height={height + 20}
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

					{ticks.map((tick, index) => {
						const isFirstTick = tick.percent === 0
						const isLastTick = tick.percent === 1
						const x = isFirstTick
							? outsidePadding
							: isLastTick
							? tick.x - outsidePadding
							: tick.x

						return (
							<g key={`${tick.time}-${index}`}>
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
					{Object.entries(traces).map(([index, span]) => {
						return (
							<TraceFlameGraphNode
								key={index}
								span={span}
								depth={0}
								height={height}
								width={width}
								zoom={zoom}
								selectedSpanID={selectedSpan?.spanID}
								setTooltipCoordinates={
									setTooltipCoordinatesImpl
								}
							/>
						)
					})}
				</svg>

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
		</Box>
	)
}
