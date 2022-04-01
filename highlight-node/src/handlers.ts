import * as http from 'http';
import { NodeOptions } from '.';
import { H } from './sdk';
import { HIGHLIGHT_REQUEST_HEADER } from './sdk';

/** JSDoc */
interface MiddlewareError extends Error {
    status?: number | string;
    statusCode?: number | string;
    status_code?: number | string;
    output?: {
        statusCode?: number | string;
    };
}

/**
 * Express compatible error handler.
 * Exposed as `Handlers.errorHandler`
 */
export function errorHandler(
    options: NodeOptions = {}
): (
    error: MiddlewareError,
    req: http.IncomingMessage,
    res: http.ServerResponse,
    next: (error: MiddlewareError) => void
) => void {
    return async (
        error: MiddlewareError,
        req: http.IncomingMessage,
        res: http.ServerResponse,
        next: (error: MiddlewareError) => void
    ) => {
        try {
            if (req.headers && req.headers[HIGHLIGHT_REQUEST_HEADER]) {
                const [secureSessionId, requestId] =
                    `${req.headers[HIGHLIGHT_REQUEST_HEADER]}`.split('/');
                if (secureSessionId && requestId) {
                    if (!H.isInitialized()) {
                        H.init(options);
                    }
                    H.consumeEvent(secureSessionId);
                    if (error instanceof Error) {
                        H.consumeError(error, secureSessionId, requestId);
                    }
                }
            }
            next(error);
        } catch {
            next(error);
        }
    };
}

// this code was assisted by https://github.com/getsentry/sentry-javascript/blob/master/packages/node/src/handlers.ts
