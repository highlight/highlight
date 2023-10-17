import { FlameChartNode } from 'flame-chart-js'

import { Trace, TraceError } from '@/graph/generated/schemas'

export const getFirstSpan = (trace: Trace[]) => {
	return trace.reduce((acc, span) => {
		const spanTime = new Date(span.timestamp)
		const accTime = acc.timestamp ? new Date(acc.timestamp) : new Date()
		return spanTime < accTime ? span : acc
	}, {} as Trace)
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
export const getTraceDuration = (trace: Trace[]) => {
	const firstSpan = getFirstSpan(trace)
	const firstSpanStartMs = new Date(firstSpan.timestamp).getTime()
	const finalSpan = getFinalSpan(trace)
	const finalSpanMs =
		new Date(finalSpan.timestamp).getTime() + finalSpan.duration

	return Math.round(finalSpanMs - firstSpanStartMs)
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

	if (dayString) {
		return `${dayString} ${hourString} ${minuteString} ${secondString}`
	} else if (hourString) {
		return `${hourString} ${minuteString} ${secondString}`
	} else if (minuteString) {
		return `${minuteString} ${secondString}`
	} else if (secondString) {
		return `${secondString} ${millisecondString}`
	} else {
		return `${millisecondString}`
	}
}

export type FlameGraphSpan = {
	children?: FlameGraphSpan[]
} & Trace &
	FlameChartNode

export const organizeSpans = (
	spans: Trace[],
	errors?: TraceError[],
	selectedSpan?: Trace,
) => {
	// Object is not modifieable, so we need to clone it to add children
	const tempSpans = JSON.parse(JSON.stringify(spans)) as FlameGraphSpan[]

	const sortedTrace = tempSpans.reduce((acc, span) => {
		const parentSpanID = span.parentSpanID
		const isSelected = selectedSpan?.spanID === span.spanID
		const hasErrors = errors?.some((e) => e.span_id === span.spanID)
		span.name = span.spanName
		// span.color = isSelected ? '#744ED4' : '#E7DEFC'
		// span.color = hasErrors ? '#ff0000' : span.color

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
