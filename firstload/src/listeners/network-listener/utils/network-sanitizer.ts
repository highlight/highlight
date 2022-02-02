import { Request, Response, Headers } from './models';

export const sanitizeRequest = (
    request: Request,
    headersToRedact: string[]
): Request => {
    // GET requests don't have a body so no need to sanitize them.
    //     if (request.verb !== 'GET') {
    //         const newBody = sanitizeBody(request.body);
    //     }
    const newHeaders = sanitizeHeaders(headersToRedact, request.headers);

    return {
        ...request,
        headers: newHeaders,
    };
};

export const sanitizeResponse = (
    response: Response,
    headersToRedact: string[]
): Response => {
    const newHeaders = sanitizeHeaders(headersToRedact, response.headers);

    return {
        ...response,
        headers: newHeaders,
    };
};

const sanitizeHeaders = (headersToRedact: string[], headers?: Headers) => {
    const newHeaders = { ...headers };

    Object.keys(newHeaders)?.forEach((header: string) => {
        if (
            [...SENSITIVE_HEADERS, ...headersToRedact].includes(
                header?.toLowerCase()
            )
        ) {
            newHeaders[header] = '[REDACTED]';
        }
    });

    return newHeaders;
};

/** These are known headers that are secrets. */
const SENSITIVE_HEADERS = ['authorization', 'cookie', 'proxy-authorization'];

/** Known URLs that contains secrets. */
export const DEFAULT_URL_BLOCKLIST = [
    'https://www.googleapis.com/identitytoolkit',
    'https://securetoken.googleapis.com',
];
