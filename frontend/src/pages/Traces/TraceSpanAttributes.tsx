import { useEffect, useMemo } from 'react'
import { useQueryParam } from 'use-query-params'

import { JsonViewerV2 } from '@/components/JsonViewer/JsonViewerV2'
import { findMatchingAttributes } from '@/components/JsonViewer/utils'
import { QueryParam } from '@/components/Search/SearchForm/SearchForm'
import { parseSearch } from '@/components/Search/utils'
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
	const [query] = useQueryParam('query', QueryParam)
	const queryParts = useMemo(() => parseSearch(query).queryParts, [query])
	const attributes: { [key: string]: any } = { ...span }

	const formattedSpan = cleanAttributes({
		timestamp: formatDateWithNanoseconds(attributes.timestamp),
		parent_span_id: attributes.parentSpanID,
		secure_session_id: attributes.secureSessionID,
		span_name: attributes.spanName,
		duration: humanizeDuration(attributes.duration),
		service_name: attributes.serviceName,
		service_version: attributes.serviceVersion,
		environment: attributes.environment,
		start_time: attributes.startTime,
		...attributes.traceAttributes,
		trace_id: attributes.traceID,
		span_id: attributes.spanID,
		span_kind: attributes.spanKind,
		status_code: attributes.statusCode,
		host: attributes.host,
		os: attributes.os,
		process: attributes.process,
	})

	const matchedAttributes = findMatchingAttributes(queryParts, formattedSpan)

	useEffect(() => {
		analytics.track('trace_span-attributes_view')
	}, [span.spanID])

	return (
		<JsonViewerV2
			allExpanded
			attribute={formattedSpan}
			matchedAttributes={matchedAttributes}
			queryParts={queryParts}
		/>
	)
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
