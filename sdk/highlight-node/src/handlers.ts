import * as http from 'http'
import { NodeOptions } from '.'
import { H, HIGHLIGHT_REQUEST_HEADER } from './sdk.js'

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
): void {
	let secureSessionId: string | undefined
	let requestId: string | undefined
	if (req.headers && req.headers[HIGHLIGHT_REQUEST_HEADER]) {
		;[secureSessionId, requestId] =
			`${req.headers[HIGHLIGHT_REQUEST_HEADER]}`.split('/')
	}
	H._debug('processError', 'extracted from headers', {
		secureSessionId,
		requestId,
	})

	if (!H.isInitialized()) {
		H.init(options)
		H._debug('initialized H')
	}
	H.consumeError(error, secureSessionId, requestId)
	H._debug('consumed error', error)
}

/**
 * Express compatible error handler.
 * Exposed as `Handlers.errorHandler`
 */
export function errorHandler(
	options: NodeOptions,
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
		H._debug('handling request')
		try {
			processErrorImpl(options, req, error)
		} finally {
			next(error)
		}
	}
}

// this code was assisted by https://github.com/getsentry/sentry-javascript/blob/master/packages/node/src/handlers.ts

/**
 * A TRPC compatible error handler for logging errors to Highlight.
 */
export async function trpcOnError(
	{
		error,
		req,
	}: { error: Error; req: { headers?: http.IncomingHttpHeaders } },
	options: NodeOptions,
): Promise<void> {
	try {
		if (!H.isInitialized()) {
			H.init(options)
		}
		processErrorImpl(options, req, error)
		await H.flush()
	} catch (e) {
		console.warn('highlight-node trpcOnError error:', e)
	}
}

/**
 * A wrapper for logging errors to Highlight for Firebase HTTP functions
 */
declare type FirebaseHttpFunctionHandler = (
	req: any,
	resp: any,
) => void | Promise<void>
export function firebaseHttpFunctionHandler(
	origHandler: FirebaseHttpFunctionHandler,
	options: NodeOptions,
): FirebaseHttpFunctionHandler {
	return async (req, res) => {
		try {
			return await origHandler(req, res)
		} catch (e) {
			try {
				if (e instanceof Error) {
					if (!H.isInitialized()) {
						H.init(options)
					}
					processErrorImpl(options, req, e)
					await H.flush()
				}
			} catch (e) {
				console.warn(
					'highlight-node firebaseHttpFunctionHandler error:',
					e,
				)
			}

			// Rethrow the error here to allow any other error handling to happen
			throw e
		}
	}
}

/**
 * A wrapper for logging errors to Highlight for Firebase callable functions
 */
declare type FirebaseCallableFunctionHandler = (data: any, context: any) => any
export function firebaseCallableFunctionHandler(
	origHandler: FirebaseCallableFunctionHandler,
	options: NodeOptions,
): FirebaseCallableFunctionHandler {
	return async (data, context) => {
		try {
			return await origHandler(data, context)
		} catch (e) {
			try {
				if (e instanceof Error) {
					if (!H.isInitialized()) {
						H.init(options)
					}
					processErrorImpl(options, context.rawRequest, e)
					await H.flush()
				}
			} catch (e) {
				console.warn(
					'highlight-node firebaseCallableFunctionHandler error:',
					e,
				)
			}

			// Rethrow the error here to allow any other error handling to happen
			throw e
		}
	}
}
