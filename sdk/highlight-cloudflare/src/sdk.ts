/* Required to patch missing performance API in Cloudflare Workers. */
import '@highlight-run/opentelemetry-sdk-workers/performance'

import { OTLPProtoLogExporter } from '@highlight-run/opentelemetry-sdk-workers/exporters/OTLPProtoLogExporter'
import { OTLPProtoTraceExporter } from '@highlight-run/opentelemetry-sdk-workers/exporters/OTLPProtoTraceExporter'
import { Resource } from '@opentelemetry/resources'
import type { ResourceAttributes } from '@opentelemetry/resources/build/src/types'
import { WorkersSDK } from '@highlight-run/opentelemetry-sdk-workers'

const HIGHLIGHT_PROJECT_ENV = 'HIGHLIGHT_PROJECT_ID'
const HIGHLIGHT_REQUEST_HEADER = 'X-Highlight-Request'
const HIGHLIGHT_OTLP_BASE = 'https://otel.highlight.io:4318'

export const RECORDED_CONSOLE_METHODS = [
	'debug',
	'error',
	'info',
	'log',
	'warn',
] as const

export interface HighlightEnv {
	[HIGHLIGHT_PROJECT_ENV]: string
	HIGHLIGHT_OTLP_ENDPOINT?: string
}

type Metric = {
	secureSessionId: string
	name: string
	value: number
	requestId: string
	tags?: { name: string; value: string }[]
}

export interface HighlightInterface {
	init: (
		request: Request,
		env: HighlightEnv,
		ctx: ExecutionContext,
		service?: string,
	) => WorkersSDK
	isInitialized: () => boolean
	consumeError: (error: Error) => void
	sendResponse: (response: Response) => void
	setAttributes: (attributes: ResourceAttributes) => void
	recordMetric: (metric: Metric) => void
}

let sdk: WorkersSDK
let projectID: string

export const H: HighlightInterface = {
	// Initialize the highlight SDK. This monkeypatches the console methods to start sending console logs to highlight.
	init: (
		request: Request,
		{
			[HIGHLIGHT_PROJECT_ENV]: _projectID,
			HIGHLIGHT_OTLP_ENDPOINT: otlpEndpoint,
		}: HighlightEnv,
		ctx: ExecutionContext,
		service?: string,
	) => {
		const { secureSessionId, requestId } = extractRequestMetadata(request)

		projectID = _projectID

		const endpoints = { default: otlpEndpoint || HIGHLIGHT_OTLP_BASE }
		sdk = new WorkersSDK(request, ctx, {
			service: service || 'cloudflare-worker',
			consoleLogEnabled: false,
			traceExporter: new OTLPProtoTraceExporter({
				url: `${endpoints.default}/v1/traces`,
			}),
			logExporter: new OTLPProtoLogExporter({
				url: `${endpoints.default}/v1/logs`,
			}),
			// @ts-ignore
			resource: new Resource({
				['highlight.project_id']: projectID,
				['highlight.session_id']: secureSessionId,
				['highlight.trace_id']: requestId,
			}),
		})

		for (const m of RECORDED_CONSOLE_METHODS) {
			const originalConsoleMethod = console[m]

			console[m] = (message: string, ...args: unknown[]) => {
				sdk.logger[m].apply(sdk.logger, [message, ...args])
				originalConsoleMethod.apply(originalConsoleMethod, [
					message,
					...args,
				])
			}
		}
		return sdk
	},

	isInitialized: () => !!sdk,

	// Capture a javascript exception as an error in highlight.
	consumeError: (error: Error) => {
		if (!sdk) {
			console.error(
				'please call H.init(...) before calling H.sendResponse(...)',
			)
			return
		}

		sdk.captureException(error)
	},

	// Capture a cloudflare response as a trace in highlight.
	sendResponse: (response: Response) => {
		if (!sdk) {
			console.error(
				'please call H.init(...) before calling H.sendResponse(...)',
			)
			return
		}
		sdk.sendResponse(response)
	},

	// Set custom attributes on the errors and logs reported to highlight.
	// Setting a key previously set will update the value.
	setAttributes: (attributes: ResourceAttributes) => {
		if (!sdk) {
			console.error(
				'please call H.init(...) before calling H.setAttributes(...)',
			)
			return
		}

		// @ts-ignore
		sdk.traceProvider.resource = sdk.traceProvider.resource.merge(
			new Resource(attributes),
		)
	},

	recordMetric: ({ secureSessionId, name, value, requestId, tags }) => {
		if (!sdk.requestTracer) return
		const span = sdk.requestTracer.startSpan('highlight-ctx')
		span.addEvent('metric', {
			['highlight.project_id']: projectID,
			['metric.name']: name,
			['metric.value']: value,
			...(secureSessionId
				? {
						['highlight.session_id']: secureSessionId,
				  }
				: {}),
			...(requestId
				? {
						['highlight.trace_id']: requestId,
				  }
				: {}),
		})
		for (const t of tags || []) {
			span.setAttribute(t.name, t.value)
		}
		span.end()
	},
}

export function extractRequestMetadata(request: Request) {
	const [secureSessionId, requestId] = (
		request.headers.get(HIGHLIGHT_REQUEST_HEADER) || ''
	).split('/')

	return { secureSessionId, requestId }
}
