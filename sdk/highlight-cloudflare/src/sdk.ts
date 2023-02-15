/* Required to patch missing performance API in Cloudflare Workers. */
import 'opentelemetry-sdk-workers/performance'

import { WorkersSDK } from 'opentelemetry-sdk-workers'
import { Resource } from '@opentelemetry/resources'
import { OTLPProtoTraceExporter } from 'opentelemetry-sdk-workers/exporters/OTLPProtoTraceExporter'
import { OTLPProtoLogExporter } from 'opentelemetry-sdk-workers/exporters/OTLPProtoLogExporter'

const HIGHLIGHT_PROJECT_ENV = 'HIGHLIGHT_PROJECT_ID'
const HIGHLIGHT_REQUEST_HEADER = 'X-Highlight-Request'
const HIGHLIGHT_OTLP_BASE = 'https://otel.highlight.io'

export interface HighlightEnv {
	[HIGHLIGHT_PROJECT_ENV]: string
}

export interface HighlightInterface {
	_createSDK: (
		request: Request,
		env: HighlightEnv,
		ctx: ExecutionContext,
	) => WorkersSDK
	consumeError: (
		request: Request,
		env: HighlightEnv,
		ctx: ExecutionContext,
		error: Error,
	) => void
	sendResponse: (
		request: Request,
		env: HighlightEnv,
		ctx: ExecutionContext,
		response: Response,
	) => void
}

export const H: HighlightInterface = {
	_createSDK: (
		request: Request,
		{ [HIGHLIGHT_PROJECT_ENV]: projectID }: HighlightEnv,
		ctx: ExecutionContext,
		service?: string,
	) => {
		const [sessionID, requestID] = (
			request.headers.get(HIGHLIGHT_REQUEST_HEADER) || ''
		).split('/')
		const endpoints = { default: HIGHLIGHT_OTLP_BASE }
		return new WorkersSDK(request, ctx, {
			service: service || 'cloudflare-worker',
			consoleLogEnabled: true,
			traceExporter: new OTLPProtoTraceExporter({
				url: `${endpoints.default}/v1/traces`,
			}),
			logExporter: new OTLPProtoLogExporter({
				url: `${endpoints.default}/v1/logs`,
			}),
			resource: new Resource({
				highlight_project_id: projectID,
				highlight_session_id: sessionID,
				highlight_trace_id: requestID,
			}),
		})
	},

	consumeError: (
		request: Request,
		env: HighlightEnv,
		ctx: ExecutionContext,
		error: Error,
	) => {
		const sdk = H._createSDK(request, env, ctx)
		sdk.captureException(error)
	},

	sendResponse: (
		request: Request,
		env: HighlightEnv,
		ctx: ExecutionContext,
		response: Response,
	) => {
		const sdk = H._createSDK(request, env, ctx)
		sdk.sendResponse(response)
	},
}
