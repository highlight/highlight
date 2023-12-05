import { memo } from 'react'

import {
	lineHeight,
	outsidePadding,
	ticksHeight,
} from '@/pages/Traces/TraceFlameGraph'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { FlameGraphSpan, getTraceDurationString } from '@/pages/Traces/utils'

type Props = {
	span: FlameGraphSpan
	width: number
	zoom: number
	selectedSpanID?: string
	setTooltipCoordinates: (e: React.MouseEvent) => void
}

type ThemeKey = 'purple' | 'red' | 'green' | 'yellow'

const spanThemes: {
	[key in ThemeKey]: {
		background: string
		border: string
		color: string
		selectedBackend: string
		selectedColor: string
	}
} = {
	purple: {
		background: '#e7defc',
		border: '#6346af',
		color: '#6346af',
		selectedBackend: '#6346af',
		selectedColor: '#fff',
	},
	red: {
		background: '#fdd8d8',
		border: '#cd2b31',
		color: '#cd2b31',
		selectedBackend: '#cd2b31',
		selectedColor: '#fff',
	},
	green: {
		background: '#ccebd7',
		border: '#30a46c',
		color: '#18794E',
		selectedBackend: '#30a46c',
		selectedColor: '#fff',
	},
	yellow: {
		background: '#ffe3a2',
		border: '#ffb224',
		color: '#ad5700',
		selectedBackend: '#ee9d2b',
		selectedColor: '#fff',
	},
}

const minWidthToDisplayText = 20
const fontSize = 12

export const TraceFlameGraphNode = memo<Props>(
	({ span, width, zoom, setTooltipCoordinates }) => {
		const {
			errors,
			hoveredSpan,
			totalDuration,
			selectedSpan,
			setHoveredSpan,
			setSelectedSpan,
		} = useTrace()
		const spanWidth = (span.duration / totalDuration) * width * zoom
		const offsetX =
			(span.startTime / totalDuration) * width * zoom + outsidePadding
		const offsetY = span.depth
			? span.depth * (lineHeight + 3) + (ticksHeight + outsidePadding)
			: ticksHeight + outsidePadding
		const isSelectedSpan = selectedSpan?.spanID === span.spanID
		const isHoveredSpan = hoveredSpan?.spanID === span.spanID
		const hasError = errors.find((error) => error.span_id === span.spanID)
		const isDbSpan = !!span.traceAttributes?.db?.system
		const isFrontendSpan =
			span.traceAttributes?.highlight?.type === 'http.request'
		const themeName = isDbSpan
			? 'yellow'
			: isFrontendSpan
			? 'green'
			: 'purple'
		const theme = spanThemes[themeName] ?? spanThemes['purple']
		const fill = isSelectedSpan ? theme.selectedBackend : theme.background
		const color = isSelectedSpan ? theme.selectedColor : theme.color
		const stroke = isSelectedSpan ? theme.selectedBackend : theme.border

		const distanceFromParent = span.parent?.depth
			? span.depth - span.parent.depth
			: 0
		const parentOffsetX = span.parent?.startTime
			? offsetX -
			  ((span.parent.startTime / totalDuration) * width * zoom +
					outsidePadding)
			: undefined
		const parentOffsetY = span.parent?.depth
			? offsetY -
			  (span.parent.depth * (lineHeight + 3) +
					(ticksHeight + outsidePadding)) -
			  lineHeight / 2
			: undefined

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
						strokeDasharray={
							hasError && !isSelectedSpan ? '3' : undefined
						}
						strokeWidth="1"
						rx="3"
						height={lineHeight}
						width={spanWidth}
						data-parent-id={span.parentSpanID}
					/>

					{distanceFromParent > 1 &&
						parentOffsetX &&
						parentOffsetY && (
							<line
								x1={1}
								y1={1}
								x2={-parentOffsetX}
								y2={-parentOffsetY}
								stroke={stroke}
								strokeWidth="1"
								opacity={
									isHoveredSpan || isSelectedSpan ? 1 : 0.15
								}
								pointerEvents="none"
							/>
						)}

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
									marginLeft: '4px',
									marginRight: '4px',
									lineHeight: '1.5',
									padding: '0',
									fontWeight: '500',
									textAlign: 'left',
									transition: 'all ease-in-out 200ms',
									userSelect: 'none',
								}}
							>
								{hasError && '⚠️ '}
								{span.spanName} (
								{getTraceDurationString(span.duration)})
							</div>
						</foreignObject>
					)}
				</g>
			</>
		)
	},
	(prevProps, nextProps) => {
		return prevProps.zoom === nextProps.zoom
	},
)
