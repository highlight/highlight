import type { Attributes } from '@opentelemetry/api'
import * as http from 'http'
import { NodeOptions } from '.'
import { H } from './sdk.js'
import {
	ATTR_HTTP_REQUEST_METHOD,
	ATTR_HTTP_ROUTE,
	ATTR_HTTP_RESPONSE_HEADER,
	ATTR_HTTP_REQUEST_HEADER,
	ATTR_HTTP_RESPONSE_STATUS_CODE,
} from '@opentelemetry/semantic-conventions'

/** JSDoc */
interface MiddlewareError extends Error {
	status?: number | string
	statusCode?: number | string
	status_code?: number | string
	output?: {
		statusCode?: number | string
	}
}

function processErrorImpl(
	options: NodeOptions,
	req: { headers?: http.IncomingHttpHeaders },
	error: Error,
	metadata?: Attributes,
): void {
	if (!H.isInitialized()) {
		H.init(options)
		H._debug('initialized H')
	}

	const { secureSessionId, requestId } = H.parseHeaders(req.headers ?? {})
	H._debug('processError', 'extracted from headers', {
		secureSessionId,
		requestId,
	})

	H.consumeError(error, secureSessionId, requestId, metadata)
	H._debug('consumed error', error)
}

/**
 * Express compatible middleware.
 * Exposed as `Handlers.errorHandler`.
 * `metadata` accepts structured tags that should be attached to every error.
 */
export function middleware(
	options: NodeOptions,
	metadata?: Attributes,
): (
	req: http.IncomingMessage,
	res: http.ServerResponse,
	next: () => void,
) => void {
	H._debug('setting up middleware')
	return (
		req: http.IncomingMessage,
		res: http.ServerResponse,
		next: () => void,
	) => {
		H._debug('middleware handling request')
		H.runWithHeaders(
			`${req.method?.toUpperCase()} - ${req.url}`,
			req.headers,
			() => next(),
			{
				attributes: {
					[ATTR_HTTP_REQUEST_METHOD]: req.method,
					[ATTR_HTTP_ROUTE]: req.url,
					[ATTR_HTTP_RESPONSE_STATUS_CODE]: res.statusCode,
					...(metadata ?? {}),
				},
			},
		)
	}
}

/**
 * Express compatible error handler.
 * Exposed as `Handlers.errorHandler`.
 * `metadata` accepts structured tags that should be attached to every error.
 */
export function errorHandler(
	options: NodeOptions,
	metadata?: Attributes,
): (
	error: MiddlewareError,
	req: http.IncomingMessage,
	res: http.ServerResponse,
	next: (error: MiddlewareError) => void,
) => void {
	H._debug('setting up error handler')
	return (
		error: MiddlewareError,
		req: http.IncomingMessage,
		res: http.ServerResponse,
		next: (error: MiddlewareError) => void,
	) => {
		H._debug('error handling request')
		try {
			processErrorImpl(options, req, error, metadata)
		} finally {
			next(error)
		}
	}
}

// this code was assisted by https://github.com/getsentry/sentry-javascript/blob/master/packages/node/src/handlers.ts

/**
 * A TRPC compatible error handler for logging errors to Highlight.
 * `metadata` accepts structured tags that should be attached to every error.
 */
export async function trpcOnError(
	{
		error,
		req,
	}: { error: Error; req: { headers?: http.IncomingHttpHeaders } },
	options: NodeOptions,
	metadata?: Attributes,
): Promise<void> {
	try {
		if (!H.isInitialized()) {
			H.init(options)
		}
		processErrorImpl(options, req, error, metadata)
		await H.flush()
	} catch (e) {
		console.warn('highlight-node trpcOnError error:', e)
	}
}

declare type Headers = { [name: string]: string | undefined }

const makeHandler = (
	name: string,
	origHandler: (...args: any) => any,
	options: NodeOptions,
	metadata: Attributes | undefined,
	headersExtractor: (...args: any) => Headers | undefined,
) => {
	return async (...args: any) => {
		if (!H.isInitialized()) {
			H.init(options)
		}
		const headers = headersExtractor(args)
		try {
			if (headers) {
				return H.runWithHeaders(name, headers, async () =>
					origHandler(...args),
				)
			} else {
				return origHandler(...args)
			}
		} catch (e) {
			try {
				if (e instanceof Error) {
					processErrorImpl(options, { headers }, e, metadata)

					await H.flush()
				}
			} catch (e) {
				console.warn('highlight-node serverlessFunction error:', e)
			}

			// Rethrow the error here to allow any other error handling to happen
			throw e
		}
	}
}

/**
 * A wrapper for logging errors to Highlight for Firebase HTTP functions.
 * `metadata` accepts structured tags that should be attached to every error.
 */
declare type FirebaseHttpFunctionHandler = (
	req: any,
	resp: any,
) => void | Promise<void>
export function firebaseHttpFunctionHandler(
	origHandler: FirebaseHttpFunctionHandler,
	options: NodeOptions,
	metadata?: Attributes,
): FirebaseHttpFunctionHandler {
	return makeHandler(
		'firebase.http',
		origHandler,
		options,
		metadata,
		(req, res) => req.headers,
	)
}

/**
 * A wrapper for logging errors to Highlight for Firebase callable functions.
 * `metadata` accepts structured tags that should be attached to every error.
 */
declare type FirebaseCallableFunctionHandler = (data: any, context: any) => any
export function firebaseCallableFunctionHandler(
	origHandler: FirebaseCallableFunctionHandler,
	options: NodeOptions,
	metadata?: Attributes,
): FirebaseCallableFunctionHandler {
	return makeHandler(
		'firebase.cb',
		origHandler,
		options,
		metadata,
		(data, ctx) => ctx.rawRequest,
	)
}

/**
 * A wrapper for logging errors to Highlight for AWS Lambda and other serverless functions.
 * `metadata` accepts structured tags that should be attached to every error.
 */
declare type ServerlessCallableFunctionHandler = (event?: any) => any
export function serverlessFunction(
	origHandler: ServerlessCallableFunctionHandler,
	options: NodeOptions,
	metadata?: Attributes,
): ServerlessCallableFunctionHandler {
	return makeHandler(
		'serverless',
		origHandler,
		options,
		metadata,
		(event) => event?.headers,
	)
}
