// utils/app-router-highlight.config.ts:

import { SpanContext, context, propagation, trace } from '@opentelemetry/api'

import { AppRouterHighlight, HighlightEnv, H } from '@highlight-run/next/server'
import { CONSTANTS } from '../../constants'
import { TraceState } from '@opentelemetry/core'

type HighlightHandler = ReturnType<typeof AppRouterHighlight>
type HandlerFunction = Parameters<HighlightHandler>[0]

const env: HighlightEnv = {
	projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	serviceName: 'vercel-app-router',
	environment: 'e2e-test',
	enableFsInstrumentation: true,
	disableConsoleRecording: true,
	debug: true,
}

export const withAppRouterHighlight = withPropagation(AppRouterHighlight(env))

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
