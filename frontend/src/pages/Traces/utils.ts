import moment from 'moment'

import { Trace } from '@/graph/generated/schemas'

export const getFirstSpan = (trace: Trace[]) => {
	const rootSpans = trace.filter((span) => !span.parentSpanID)
	const spans = rootSpans.length > 0 ? rootSpans : [...trace]
	const sortedTrace = spans.sort(
		(a, b) =>
			new Date(a.timestamp).getTime() -
			a.duration -
			(new Date(b.timestamp).getTime() - b.duration),
	)

	return sortedTrace[0]
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
		endTime: endTime / 1000000, // milliseconds
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
	} else if (microsecondString) {
		return microsecondString
	} else {
		return `${nanoseconds}ns`
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
	const spans = [[]]
	const spanIDs = new Set(trace.flat().map((span) => span.spanID))
	const rootSpans = trace
		.filter((span) => !spanIDs.has(span.parentSpanID))
		.sort(traceSortFn)

	if (rootSpans.length === 0) {
		rootSpans.push(getFirstSpan(trace as Trace[]))
	}

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

// Transform a raw value to a human readable string with nanosecond precision.
// Use the highest unit that results in a value greater than 1.
export const humanizeDuration = (nanoseconds: number): string => {
	const microsecond = 1000
	const millisecond = microsecond * 1000
	const second = millisecond * 1000
	const minute = second * 60
	const hour = minute * 60

	if (nanoseconds >= hour) {
		const hours = nanoseconds / hour
		return `${Number(hours.toFixed(1))}h`
	} else if (nanoseconds >= minute) {
		const minutes = nanoseconds / minute
		return `${Number(minutes.toFixed(1))}m`
	} else if (nanoseconds >= second) {
		const seconds = nanoseconds / second
		return `${Number(seconds.toFixed(1))}s`
	} else if (nanoseconds >= millisecond) {
		const milliseconds = nanoseconds / millisecond
		return `${Number(milliseconds.toFixed(1))}ms`
	} else if (nanoseconds >= microsecond) {
		const microseconds = nanoseconds / microsecond
		return `${Number(microseconds.toFixed(1))}µs`
	} else {
		return `${nanoseconds}ns`
	}
}

export const formatDateWithNanoseconds = (dateString: string) => {
	const [dateTime, nanoseconds] = dateString.split('.')
	const [nanoWithoutZ] = nanoseconds ? nanoseconds.split('Z') : ['']
	const momentDate = moment(dateTime)
	const formattedDateTime = momentDate.format('M/D/YYYY, h:mm:ss')
	const amPm = momentDate.format('a')
	return `${formattedDateTime}.${nanoWithoutZ} ${amPm}`
}

export const formatTraceAttributes = (attributes: { [key: string]: any }) => {
	const { host, os, process, ...otherTraceAttributes } =
		attributes.traceAttributes

	return cleanAttributes({
		timestamp: formatDateWithNanoseconds(attributes.timestamp),
		parent_span_id: attributes.parentSpanID,
		secure_session_id: attributes.secureSessionID,
		span_name: attributes.spanName,
		duration: humanizeDuration(attributes.duration),
		service_name: attributes.serviceName,
		service_version: attributes.serviceVersion,
		environment: attributes.environment,
		start_time: attributes.startTime,
		...otherTraceAttributes,
		trace_id: attributes.traceID,
		span_id: attributes.spanID,
		span_kind: attributes.spanKind,
		status_code: attributes.statusCode,
		events: attributes.events?.map(({ __typename, ...other }: any) => ({
			...other,
		})),
		host,
		os,
		process,
	})
}

export const cleanAttributes = (attributes: any): any => {
	const copy = { ...attributes }

	Object.keys(copy).forEach((key) => {
		const value = copy[key as keyof typeof copy]

		if (value === undefined || value === '') {
			// Remove empty attributes
			delete copy[key]
		} else if (typeof value === 'string' && !isNaN(Number(value))) {
			// Convert all stringified numbers to numbers
			copy[key] = Number(value)
		} else if (typeof value === 'object' && value !== null) {
			// If the value is an object, call the function again
			copy[key] = cleanAttributes(value)
		}
	})

	return copy
}

export const traceSortFn = (
	a: Partial<FlameGraphSpan>,
	b: Partial<FlameGraphSpan>,
) => {
	// Subtract the duration from the start time to ensure that the longer
	// span is at the root of the flame graph if there is a match.
	const startA = new Date(a.timestamp ?? 0).getTime() - (a.duration ?? 0)
	const startB = new Date(b.timestamp ?? 0).getTime() - (b.duration ?? 0)

	return startA - startB
}
