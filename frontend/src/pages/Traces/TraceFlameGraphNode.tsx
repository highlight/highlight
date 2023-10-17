import moment from 'moment'
import React from 'react'

import { TraceError } from '@/graph/generated/schemas'
import { FlameGraphSpan } from '@/pages/Traces/utils'

type Props = {
	depth: number
	errors: TraceError[]
	span: FlameGraphSpan
	startTime: moment.Moment
	totalDuration: number
}

const lineHeight = 3.5
const fontSize = 1.75

export const TraceFlameGraphNode: React.FC<Props> = ({
	depth,
	errors,
	span,
	startTime,
	totalDuration,
}) => {
	const width = (span.duration / totalDuration) * 100
	const diff = moment(span.timestamp).diff(startTime, 'ms').valueOf() * 10000
	const offsetX = (diff / totalDuration) * 100
	const offsetY = depth ? depth * (lineHeight + 0.3) : 0
	// const error = errors.find((error) => error.span_id === span.spanID)

	{
		/*
	TODO: Update positioning to follow the mouse:
	https://github.com/ariakit/ariakit/issues/373
	*/
	}
	return (
		<>
			<rect
				key={span.spanID}
				// onClick={() => setSelectedSpan(span)}
				// onMouseOver={() => setHoveredSpan(span)}
				// onMouseOut={() =>
				// 	setHoveredSpan(undefined)
				// }
				x={`${offsetX}%`}
				y={offsetY}
				fill="#744ED4"
				rx="0.5"
				height={lineHeight}
				width={width}
				data-parent-id={span.parentSpanID}
			/>

			<text
				fill="#fff"
				x={offsetX + lineHeight / 2.5}
				y={offsetY + lineHeight / 1.5}
				fontSize={fontSize}
			>
				{span.spanName}
			</text>
			{/* <text fill="#fff" x={offsetX} y={offsetY}>
					{getTraceDurationString(span.duration / 1000)}
				</text> */}

			{span.children?.map((childSpan) => (
				<TraceFlameGraphNode
					key={childSpan.spanID}
					depth={depth + 1}
					errors={errors}
					span={childSpan}
					startTime={startTime}
					totalDuration={totalDuration}
				/>
			))}
		</>
	)
}
