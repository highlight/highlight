import { useEffect } from 'react'

import JsonViewer from '@/components/JsonViewer/JsonViewer'
import {
	FlameGraphSpan,
	formatDateWithNanoseconds,
	humanizeDuration,
} from '@/pages/Traces/utils'
import analytics from '@/util/analytics'

type Props = {
	span: FlameGraphSpan
}

export const TraceSpanAttributes: React.FC<Props> = ({ span }) => {
	let attributes: { [key: string]: any } = { ...span }

	// Drop any attributes we don't want to display
	delete attributes.__typename
	delete attributes.children
	delete (attributes as any).projectID

	// Convert timestamp to a formatted date/time
	if (attributes.timestamp) {
		attributes.timestamp = formatDateWithNanoseconds(attributes.timestamp)
	}

	// Move properties of traceAttributes to the top level
	if (attributes.traceAttributes) {
		attributes = { ...attributes, ...attributes.traceAttributes }
		delete attributes.traceAttributes
	}

	// Move these attributes down to the bottom of the list
	const traceID = attributes.traceID
	const spanID = attributes.spanID
	const spanKind = attributes.spanKind
	const statusCode = attributes.statusCode
	const host = attributes.host
	const os = attributes.os
	const process = attributes.process
	delete attributes.traceID
	delete attributes.spanID
	delete attributes.spanKind
	delete attributes.statusCode
	delete attributes.host
	delete attributes.os
	delete attributes.process
	attributes.traceID = traceID
	attributes.spanID = spanID
	attributes.spanKind = spanKind
	attributes.statusCode = statusCode
	attributes.host = host
	attributes.os = os
	attributes.process = process

	// Display duration as the appropriate unit: min, s, ms, us, ns
	if (attributes.duration) {
		attributes.duration = humanizeDuration(attributes.duration)
	}

	attributes = cleanAttributes(attributes)

	useEffect(() => {
		analytics.track('trace_span-attributes_view')
	}, [spanID])

	return <JsonViewer src={attributes} collapsed={false} />
}

const cleanAttributes = (attributes: any): any => {
	const copy = { ...attributes }

	Object.keys(copy).forEach((key) => {
		const value = copy[key as keyof typeof copy]

		if (!value) {
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
