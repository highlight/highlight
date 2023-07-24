/* Required to patch missing performance API in Cloudflare Workers. */
import 'opentelemetry-sdk-workers/performance'

import { OTLPProtoLogExporter } from 'opentelemetry-sdk-workers/exporters/OTLPProtoLogExporter'
import { OTLPProtoTraceExporter } from 'opentelemetry-sdk-workers/exporters/OTLPProtoTraceExporter'
import { Resource } from '@opentelemetry/resources'
import type { ResourceAttributes } from '@opentelemetry/resources/build/src/types'
import { WorkersSDK } from 'opentelemetry-sdk-workers'

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
	// Initialize the highlight SDK. This monkeypatches the console methods to start sending console logs to highlight.
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

	// Capture a javascript exception as an error in highlight.
	consumeError: (error: Error) => {
		if (!sdk) {
			console.error(
				'please call H.init(...) before calling H.sendResponse(...)',
			)
			return
		}
		console.log('H.consumeError', error)
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
}
