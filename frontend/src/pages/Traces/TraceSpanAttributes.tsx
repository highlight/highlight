import { useEffect, useMemo } from 'react'

import { JsonViewerV2 } from '@/components/JsonViewer/JsonViewerV2'
import { findMatchingAttributes } from '@/components/JsonViewer/utils'
import { FlameGraphSpan, formatTraceAttributes } from '@/pages/Traces/utils'
import analytics from '@/util/analytics'
import { SearchExpression } from '@/components/Search/Parser/listener'

type Props = {
	span: FlameGraphSpan
	query?: string
	queryParts?: SearchExpression[]
	onSubmitQuery?: (query: string) => void
}

export const TraceSpanAttributes: React.FC<Props> = ({
	span,
	query,
	queryParts,
	onSubmitQuery,
}) => {
	const attributes: { [key: string]: any } = { ...span }
	const formattedSpan = formatTraceAttributes(attributes)

	const matchedAttributes = useMemo(
		() =>
			queryParts ? findMatchingAttributes(queryParts, formattedSpan) : {},
		[queryParts, formattedSpan],
	)

	useEffect(() => {
		analytics.track('trace_span-attributes_view')
	}, [span.spanID])

	return (
		<JsonViewerV2
			allExpanded
			attribute={formattedSpan}
			matchedAttributes={matchedAttributes}
			query={query}
			setQuery={onSubmitQuery}
		/>
	)
}
