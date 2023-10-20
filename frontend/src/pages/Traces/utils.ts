import { Trace } from '@/graph/generated/schemas'

export const getFirstSpan = (trace: Trace[]) => {
	return trace.find((span) => !span.parentSpanID)
}

export const getFinalSpan = (trace: Trace[]) => {
	return trace.reduce((acc, span) => {
		const endTime =
			new Date(span.timestamp).getTime() + span.duration / 1000
		const accEndTime = acc.timestamp
			? new Date(acc.timestamp).getTime() + acc.duration / 1000
			: 0
		return endTime > accEndTime ? span : acc
	}, {} as Trace)
}

// Returns the trace duration in milliseconds
export const getTraceTimes = (trace: Trace[]) => {
	const startTime = Math.min(
		...trace.map((span) => new Date(span.timestamp).getTime()),
	)
	const endTime = Math.max(
		...trace.map((span) => {
			const endTime = new Date(span.timestamp).getTime()
			return endTime + span.duration
		}),
	)

	return {
		startTime,
		endTime,
		duration: endTime - startTime,
	}
}

export const getTraceDurationString = (duration: number) => {
	const nanoseconds = Math.floor(duration)
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
	const nanosecondString = nanoseconds > 0 ? `${nanoseconds % 1000000}ns` : ''

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
		return nanosecondString
	}
}

export type FlameGraphSpan = {
	name: string
	start: number // nanoseconds since start of trace
	children?: FlameGraphSpan[]
} & Trace

export const organizeSpans = (spans: Trace[]) => {
	// Object is not modifieable, so we need to clone it to add children
	const startTime = new Date(spans[0].timestamp).getTime() * 1000000
	const tempSpans = JSON.parse(JSON.stringify(spans)) as FlameGraphSpan[]

	const sortedTrace = tempSpans.reduce((acc, span) => {
		const parentSpanID = span.parentSpanID
		span.name = span.spanName
		const spanStart = new Date(span.timestamp).getTime() * 1000000
		span.start = spanStart - startTime

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

export const getMaxDepth = (spans: FlameGraphSpan[]) => {
	return spans.reduce((acc, span) => {
		const depth = getDepth(span)
		return depth > acc ? depth : acc
	}, 1)
}

const getDepth = (span: FlameGraphSpan, depth = 1): number => {
	if (span.children) {
		return span.children.reduce((acc, child) => {
			const childDepth = getDepth(child, depth + 1)
			return childDepth > acc ? childDepth : acc
		}, depth)
	} else {
		return depth
	}
}
