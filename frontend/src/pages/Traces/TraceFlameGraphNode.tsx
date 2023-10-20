import { memo } from 'react'

import { Trace, TraceError } from '@/graph/generated/schemas'
import {
	lineHeight,
	outsidePadding,
	ticksHeight,
} from '@/pages/Traces/TraceFlameGraph'
import { FlameGraphSpan, getTraceDurationString } from '@/pages/Traces/utils'

type Props = {
	depth: number
	errors: TraceError[]
	span: FlameGraphSpan
	startTime: number
	totalDuration: number
	height: number
	width: number
	selectedSpan: FlameGraphSpan | Trace | undefined
	zoom: number
	setHoveredSpan: (span?: FlameGraphSpan) => void
	setSelectedSpan: (span?: FlameGraphSpan) => void
	setTooltipCoordinates: (e: React.MouseEvent) => void
}

const minWidthToDisplayText = 20
const fontSize = 10

export const TraceFlameGraphNode = memo<Props>(
	({
		depth,
		errors,
		span,
		startTime,
		totalDuration,
		height,
		width,
		selectedSpan,
		zoom,
		setHoveredSpan,
		setSelectedSpan,
		setTooltipCoordinates,
	}) => {
		width = width - outsidePadding * 2
		const spanWidth = (span.duration / totalDuration) * width * zoom
		const offsetX =
			(span.start / totalDuration) * width * zoom + outsidePadding
		const offsetY = depth
			? depth * (lineHeight + 3) + (ticksHeight + outsidePadding)
			: ticksHeight + outsidePadding
		const isSelectedSpan = selectedSpan?.spanID === span.spanID
		const error = errors.find((error) => error.span_id === span.spanID)
		const fill = isSelectedSpan ? '#744ed4' : '#e7defc'
		const color = isSelectedSpan ? '#fff' : '#744ed4'
		const stroke = error ? '#f00' : '#f9f8f9'

		return (
			<>
				<g
					transform={`translate(${offsetX}, ${offsetY})`}
					onClick={() => setSelectedSpan(span)}
					onMouseOver={() => setHoveredSpan(span)}
					onMouseOut={() => setHoveredSpan(undefined)}
					onMouseMove={(e) => setTooltipCoordinates(e)}
				>
					<rect
						key={span.spanID}
						fill={fill}
						stroke={stroke}
						strokeWidth="1"
						rx="4"
						height={lineHeight}
						width={spanWidth}
						data-parent-id={span.parentSpanID}
					/>

					{spanWidth > minWidthToDisplayText && (
						<foreignObject
							fontSize={fontSize}
							height={lineHeight}
							width={spanWidth}
							style={{
								transition: 'color ease-in-out 200ms',
								display: 'block',
								pointerEvents: 'none',
							}}
						>
							<div
								style={{
									color,
									pointerEvents: 'none',
									whiteSpace: 'nowrap',
									textOverflow: 'ellipsis',
									overflow: 'hidden',
									fontSize: '12px',
									fontFamily: 'sans-serif',
									marginLeft: '4px',
									marginRight: '4px',
									lineHeight: '1.5',
									padding: '0',
									fontWeight: '400',
									textAlign: 'left',
									transition: 'all ease-in-out 200ms',
									userSelect: 'none',
								}}
							>
								{span.spanName} (
								{getTraceDurationString(span.duration)})
							</div>
						</foreignObject>
					)}
				</g>

				{span.children?.map((childSpan: FlameGraphSpan) => (
					<TraceFlameGraphNode
						key={childSpan.spanID}
						depth={depth + 1}
						errors={errors}
						span={childSpan}
						startTime={startTime}
						totalDuration={totalDuration}
						height={height}
						width={width}
						selectedSpan={selectedSpan}
						zoom={zoom}
						setHoveredSpan={setHoveredSpan}
						setSelectedSpan={setSelectedSpan}
						setTooltipCoordinates={setTooltipCoordinates}
					/>
				))}
			</>
		)
	},
	(prevProps, nextProps) => {
		return (
			prevProps.zoom === nextProps.zoom &&
			prevProps.selectedSpan?.spanID === nextProps.selectedSpan?.spanID
		)
	},
)
