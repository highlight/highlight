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

// TODO: Update with new colors once new theme vars are in place. Will also need
// to add disabled colors once we have disabled spans.
const spanThemes: {
	[key in ThemeKey]: {
		background: string
		border: string
		color: string
		selectedBackground: string
		selectedColor: string
		errorBorder: string
		errorBorderSelected: string
	}
} = {
	purple: {
		background: 'rgba(247, 237, 254, 1)',
		border: 'rgba(209, 175, 236, 1)',
		color: 'rgba(129, 69, 181, 1)',
		selectedBackground: 'rgba(142, 78, 198, 1)',
		selectedColor: '#fff',
		errorBorder: 'rgba(190, 147, 228, 1)',
		errorBorderSelected: 'rgba(190, 147, 228, 1)',
	},
	red: {
		background: 'rgba(255, 239, 239, 1)',
		border: 'rgba(243, 174, 175, 1)',
		color: 'rgba(205, 43, 49, 1)',
		selectedBackground: 'rgba(229, 72, 77, 1)',
		selectedColor: '#fff',
		errorBorder: 'rgba(235, 144, 145, 1)',
		errorBorderSelected: 'rgba(235, 144, 145, 1)',
	},
	green: {
		background: 'rgba(233, 246, 233, 1)',
		border: 'rgba(148, 206, 154, 1)',
		color: 'rgba(42, 126, 59, 1)',
		selectedBackground: 'rgba(70, 167, 88, 1)',
		selectedColor: '#fff',
		errorBorder: 'rgba(101, 186, 116, 1)',
		errorBorderSelected: 'rgba(101, 186, 116, 1)',
	},
	yellow: {
		background: 'rgba(255, 250, 184, 1)',
		border: 'rgba(228, 199, 103, 1)',
		color: 'rgba(158, 108, 0, 1)',
		selectedBackground: 'rgba(255, 230, 41, 1)',
		selectedColor: 'rgba(158, 108, 0, 1)',
		errorBorder: 'rgba(213, 174, 57, 1)',
		errorBorderSelected: 'rgba(213, 174, 57, 1)',
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
		const theme = getSpanTheme(span)
		const fill = isSelectedSpan
			? theme.selectedBackground
			: theme.background
		const color = isSelectedSpan ? theme.selectedColor : theme.color
		const stroke = isSelectedSpan ? theme.selectedBackground : theme.border

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
									lineHeight: `${lineHeight}px`,
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
		return (
			prevProps.zoom === nextProps.zoom &&
			prevProps.width === nextProps.width
		)
	},
)

export const getSpanTheme = (span?: FlameGraphSpan) => {
	if (!span) return spanThemes['purple']

	const isDbSpan = !!span.traceAttributes?.db?.system
	const isFrontendSpan =
		span.traceAttributes?.highlight?.type === 'http.request'
	const themeName = isDbSpan ? 'yellow' : isFrontendSpan ? 'green' : 'purple'

	return spanThemes[themeName] ?? spanThemes['purple']
}
