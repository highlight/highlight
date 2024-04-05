// utils/app-router-highlight.config.ts:

import { context, propagation, SpanContext, trace } from '@opentelemetry/api'

import { AppRouterHighlight, H } from '@highlight-run/next/server'
import { TraceState } from '@opentelemetry/core'
import { highlightConfig } from '@/highlight.config'

type HighlightHandler = ReturnType<typeof AppRouterHighlight>
type HandlerFunction = Parameters<HighlightHandler>[0]

export const withAppRouterHighlight = withPropagation(
	AppRouterHighlight({
		...highlightConfig,
		serviceName: highlightConfig.serviceName + '-app-router',
	}),
)

function withPropagation(highlightHandler: HighlightHandler) {
	return (originalHandler: HandlerFunction) =>
		highlightHandler(async (request, ctx) => {
			const output: { traceparent?: string; tracestate?: string } = {}
			const activeSpan = trace.getActiveSpan()

			if (!activeSpan) {
				return originalHandler(request, ctx)
			}

			const spanContext: SpanContext = {
				...activeSpan.spanContext(),
				traceState: new TraceState('a=b,c=d'),
			}

			const newContext = trace.setSpanContext(
				context.active(),
				spanContext,
			)

			propagation.inject(newContext, output)

			const span = await H.startActiveSpan('propagation-test', {})

			request.headers.set('traceparent', output.traceparent ?? '')
			request.headers.set('tracestate', output.tracestate ?? '')

			const result = await originalHandler(request, ctx)

			span.end()

			return result
		})
}
