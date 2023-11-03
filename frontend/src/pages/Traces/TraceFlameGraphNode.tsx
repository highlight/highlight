import { memo } from 'react'

import {
	lineHeight,
	outsidePadding,
	ticksHeight,
} from '@/pages/Traces/TraceFlameGraph'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { FlameGraphSpan, getTraceDurationString } from '@/pages/Traces/utils'

type Props = {
	depth: number
	span: FlameGraphSpan
	height: number
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
	({
		depth,
		span,
		height,
		selectedSpanID,
		width,
		zoom,
		setTooltipCoordinates,
	}) => {
		const {
			errors,
			totalDuration,
			selectedSpan,
			setHoveredSpan,
			setSelectedSpan,
		} = useTrace()
		const spanWidth = (span.duration / totalDuration) * width * zoom
		const offsetX =
			(span.startTime / totalDuration) * width * zoom + outsidePadding
		const offsetY = depth
			? depth * (lineHeight + 3) + (ticksHeight + outsidePadding)
			: ticksHeight + outsidePadding
		const isSelectedSpan = selectedSpan?.spanID === span.spanID
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
							hasError && !isSelectedSpan ? '4' : undefined
						}
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

				{span.children?.map((childSpan: FlameGraphSpan) => (
					<TraceFlameGraphNode
						key={`${childSpan.parentSpanID}-${childSpan.spanID}`}
						depth={depth + 1}
						span={childSpan}
						height={height}
						selectedSpanID={selectedSpanID}
						width={width}
						zoom={zoom}
						setTooltipCoordinates={setTooltipCoordinates}
					/>
				))}
			</>
		)
	},
	(prevProps, nextProps) => {
		return prevProps.zoom === nextProps.zoom
	},
)
