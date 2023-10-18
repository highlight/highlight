import moment from 'moment'

import { Trace, TraceError } from '@/graph/generated/schemas'
import { FlameGraphSpan } from '@/pages/Traces/utils'

type Props = {
	depth: number
	errors: TraceError[]
	span: FlameGraphSpan
	startTime: string
	totalDuration: number
	height: number
	width: number
	hoveredSpan: FlameGraphSpan | undefined
	selectedSpan: FlameGraphSpan | Trace | undefined
	zoom: number
	setHoveredSpan: (span?: FlameGraphSpan) => void
	setSelectedSpan: (span?: FlameGraphSpan) => void
}

const minWidthToDisplay = 1
const minWidthToDisplayText = 20
const lineHeight = 18
const fontSize = 10

export const TraceFlameGraphNode: React.FC<Props> = ({
	depth,
	errors,
	span,
	startTime,
	totalDuration,
	height,
	width,
	hoveredSpan,
	selectedSpan,
	zoom,
	setHoveredSpan,
	setSelectedSpan,
}) => {
	// TODO: Handle overlapping spans... GetErrorGroupsClickhouse is a good one to
	// test with since it has a lot of spans and many with the same parent.
	// Consider looking at https://react-flame-graph.vercel.app/ again.
	// Demo: https://stackblitz.com/edit/stackblitz-starters-ashwqh?description=React%20%20%20TypeScript%20starter%20project&file=src%2Ftrace.ts,src%2FApp.tsx&title=React%20Starter
	// This other compnoent seems to handle overlapping spans better.
	const spanWidth = (span.duration / totalDuration) * width * zoom
	const diff =
		moment(span.timestamp).diff(moment(startTime), 'ms').valueOf() * 1000000
	if (depth > 3) {
		// debugger
	}
	const offsetX = (diff / totalDuration) * width * zoom
	const offsetY = depth ? depth * (lineHeight + 4) : 0
	const isHoveredSpan = hoveredSpan?.spanID === span.spanID
	const isSelectedSpan = selectedSpan?.spanID === span.spanID
	const error = errors.find((error) => error.span_id === span.spanID)
	const fill = isSelectedSpan ? '#744ed4' : '#e7defc'
	const color = isSelectedSpan ? '#fff' : '#744ed4'
	const stroke = error ? '#f00' : fill
	// console.log(':::', span.spanName, depth, offsetX, spanWidth, span.duration)

	// if (spanWidth < minWidthToDisplay) {
	// 	console.log('::: span', span.spanName, spanWidth)
	// 	return null
	// }

	return (
		<>
			<g
				onClick={() => setSelectedSpan(span)}
				onMouseOver={() => setHoveredSpan(span)}
				onMouseOut={() => setHoveredSpan(undefined)}
			>
				<rect
					key={span.spanID}
					x={offsetX}
					y={offsetY}
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
						x={offsetX + lineHeight / 3}
						y={offsetY}
						fontSize={fontSize}
						height={lineHeight}
						width={spanWidth}
						style={{
							transition: 'all ease-in-out 200ms',
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
							{span.spanName}
						</div>
					</foreignObject>
				)}
				{/* <text fill="#fff" x={offsetX} y={offsetY}>
					{getTraceDurationString(span.duration / 1000000)}
				</text> */}
			</g>

			{span.children?.map((childSpan) => (
				<TraceFlameGraphNode
					key={childSpan.spanID}
					depth={depth + 1}
					errors={errors}
					span={childSpan}
					startTime={startTime}
					totalDuration={totalDuration}
					height={height}
					width={width}
					hoveredSpan={hoveredSpan}
					selectedSpan={selectedSpan}
					zoom={zoom}
					setHoveredSpan={setHoveredSpan}
					setSelectedSpan={setSelectedSpan}
				/>
			))}
		</>
	)
}
