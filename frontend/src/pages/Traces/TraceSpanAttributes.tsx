import { useEffect, useMemo } from 'react'
import { useQueryParam } from 'use-query-params'

import { JsonViewerV2 } from '@/components/JsonViewer/JsonViewerV2'
import { findMatchingAttributes } from '@/components/JsonViewer/utils'
import { QueryParam } from '@/components/Search/SearchForm/SearchForm'
import { parseSearch } from '@/components/Search/utils'
import { FlameGraphSpan, formatTraceAttributes } from '@/pages/Traces/utils'
import analytics from '@/util/analytics'

type Props = {
	span: FlameGraphSpan
}

export const TraceSpanAttributes: React.FC<Props> = ({ span }) => {
	const [query] = useQueryParam('query', QueryParam)
	const queryParts = useMemo(() => parseSearch(query).queryParts, [query])
	const attributes: { [key: string]: any } = { ...span }

	const formattedSpan = formatTraceAttributes(attributes)

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
