/* Required to patch missing performance API in Cloudflare Workers. */
import 'opentelemetry-sdk-workers/performance'

import { WorkersSDK } from 'opentelemetry-sdk-workers'
import { Resource } from '@opentelemetry/resources'
import { OTLPProtoTraceExporter } from 'opentelemetry-sdk-workers/exporters/OTLPProtoTraceExporter'
import { OTLPProtoLogExporter } from 'opentelemetry-sdk-workers/exporters/OTLPProtoLogExporter'
import type { ResourceAttributes } from '@opentelemetry/resources/build/src/types'

const HIGHLIGHT_PROJECT_ENV = 'HIGHLIGHT_PROJECT_ID'
const HIGHLIGHT_REQUEST_HEADER = 'X-Highlight-Request'
const HIGHLIGHT_OTLP_BASE = 'https://otel.highlight.io'

export const RECORDED_CONSOLE_METHODS = [
	'debug',
	'error',
	'info',
	'log',
	'warn',
] as const

export interface HighlightEnv {
	[HIGHLIGHT_PROJECT_ENV]: string
}

export interface HighlightInterface {
	init: (
		request: Request,
		env: HighlightEnv,
		ctx: ExecutionContext,
	) => WorkersSDK
	consumeError: (error: Error) => void
	sendResponse: (response: Response) => void
	setAttributes: (attributes: ResourceAttributes) => void
}

let sdk: WorkersSDK

export const H: HighlightInterface = {
	init: (
		request: Request,
		{ [HIGHLIGHT_PROJECT_ENV]: projectID }: HighlightEnv,
		ctx: ExecutionContext,
		service?: string,
	) => {
		const [sessionID, requestID] = (
			request.headers.get(HIGHLIGHT_REQUEST_HEADER) || ''
		).split('/')
		const endpoints = { default: HIGHLIGHT_OTLP_BASE }
		sdk = new WorkersSDK(request, ctx, {
			service: service || 'cloudflare-worker',
			consoleLogEnabled: false,
			traceExporter: new OTLPProtoTraceExporter({
				url: `${endpoints.default}/v1/traces`,
			}),
			logExporter: new OTLPProtoLogExporter({
				url: `${endpoints.default}/v1/logs`,
			}),
			resource: new Resource({
				['highlight.project_id']: projectID,
				['highlight.session_id']: sessionID,
				['highlight.trace_id']: requestID,
			}),
		})
		for (const m of RECORDED_CONSOLE_METHODS) {
			console[m] = sdk.logger[m]
		}
		return sdk
	},

	consumeError: (error: Error) => {
		if (!sdk) {
			console.error(
				'please call H.init(...) before calling H.sendResponse(...)',
			)
			return
		}
		sdk.captureException(error)
	},

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
		// @ts-ignore
		sdk.traceProvider.resource = sdk.traceProvider.resource.merge(
			new Resource(attributes),
		)
	},
}
