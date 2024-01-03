import { Trace } from '@/graph/generated/schemas'

export const getFirstSpan = (trace: Trace[]) => {
	return trace.find((span) => !span.parentSpanID)
}

// Returns the trace duration in nanoseconds
export const getTraceTimes = (trace: Trace[]) => {
	const startTime = Math.min(
		...trace.map((span) => new Date(span.timestamp).getTime() * 1000000),
	)
	const endTime = Math.max(
		...trace.map((span) => {
			const startTime = new Date(span.timestamp).getTime() * 1000000
			return startTime + span.duration
		}),
	)

	return {
		startTime: startTime / 1000000, // milliseconds
		duration: endTime - startTime, // nanoseconds
	}
}

export const getTraceDurationString = (duration: number) => {
	const nanoseconds = Math.floor(duration)
	const microseconds = Math.floor(nanoseconds / 1000)
	const milliseconds = Math.floor(nanoseconds / 1000000)
	const seconds = Math.floor(milliseconds / 1000)
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)
	const days = Math.floor(hours / 24)

	const dayString = days > 0 ? `${days}d` : ''
	const hourString = hours > 0 ? `${hours % 24}h` : ''
	const minuteString = minutes > 0 ? `${minutes % 60}m` : ''
	const secondString = seconds > 0 ? `${seconds % 60}s` : ''
	const millisecondString = milliseconds > 0 ? `${milliseconds % 1000}ms` : ''
	const microsecondString = microseconds > 0 ? `${microseconds % 1000}µs` : ''

	if (dayString) {
		return `${dayString} ${hourString} ${minuteString} ${secondString}`
	} else if (hourString) {
		return `${hourString} ${minuteString} ${secondString}`
	} else if (minuteString) {
		return `${minuteString} ${secondString}`
	} else if (secondString) {
		return `${secondString} ${millisecondString}`
	} else if (millisecondString) {
		return millisecondString
	} else {
		return microsecondString
	}
}

export type FlameGraphSpan = {
	depth: number
	parent?: FlameGraphSpan
	children?: FlameGraphSpan[]
} & Trace

// Organizes spans into a tree structure based on their parentSpanID. Spans
// without a parentSpanID are considered root spans. Spans with a parentSpanID
// are added as children to the span with the matching spanID.
export const organizeSpansWithChildren = (spans: Partial<FlameGraphSpan>[]) => {
	// Object is not modifieable, so we need to clone it to add children
	const tempSpans = JSON.parse(JSON.stringify(spans)) as FlameGraphSpan[]

	const sortedTrace = tempSpans.reduce((acc, span) => {
		const parentSpanID = span.parentSpanID

		if (parentSpanID) {
			const parentSpan = tempSpans.find(
				(s) => s.spanID === parentSpanID,
			) as FlameGraphSpan

			if (parentSpan) {
				if (parentSpan.children) {
					parentSpan.children.push(span)
				} else {
					parentSpan.children = [span]
				}
			} else {
				acc.push(span)
			}
		} else {
			acc.push(span)
		}
		return acc
	}, [] as FlameGraphSpan[])

	return sortedTrace
}

// Organizes spans into levels based on their start and end times. Spans that
// overlap are bumped to the next level.
export const organizeSpansForFlameGraph = (
	trace: Partial<FlameGraphSpan>[],
) => {
	const rootSpans = trace.filter((span) => !span.parentSpanID)
	const spans = [[]]

	rootSpans.forEach((rootSpan) =>
		organizeSpanInLevel(rootSpan!, trace, spans, 0),
	)

	return spans as FlameGraphSpan[][]
}

const organizeSpanInLevel = (
	span: Partial<FlameGraphSpan>,
	trace: Partial<FlameGraphSpan>[],
	spans: Partial<FlameGraphSpan>[][],
	depthIndex: number,
	parent?: Partial<FlameGraphSpan>,
) => {
	spans[depthIndex] = spans[depthIndex] ?? []

	const isOverlapping = spans[depthIndex].some((s) =>
		spanOverlaps(s as Trace, span as Trace),
	)

	if (isOverlapping) {
		organizeSpanInLevel(span, trace, spans, depthIndex + 1, parent)
		return
	} else {
		spans[depthIndex].push({
			...span,
			depth: depthIndex,
			parent: parent as FlameGraphSpan,
		})
	}

	const children = trace.filter(
		(s) => s.parentSpanID && s.parentSpanID === span.spanID,
	)

	if (children.length > 0) {
		children.forEach((child) => {
			organizeSpanInLevel(child, trace, spans, depthIndex + 1, {
				...span,
				depth: depthIndex,
			})
		})
	}
}

export const spanOverlaps = (span1: Trace, span2: Trace) => {
	const span1StartTime = span1.startTime
	const span2StartTime = span2.startTime
	const span1EndTime = span1StartTime + span1.duration
	const span2EndTime = span2StartTime + span2.duration

	return (
		(span1StartTime >= span2StartTime && span1StartTime <= span2EndTime) ||
		(span1EndTime >= span2StartTime && span1EndTime <= span2EndTime) ||
		(span1StartTime <= span2StartTime && span1EndTime >= span2EndTime)
	)
}
