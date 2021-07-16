import { Request, Response, Headers } from './models';

export const sanitizeRequest = (request: Request): Request => {
    // GET requests don't have a body so no need to sanitize them.
    //     if (request.verb !== 'GET') {
    //         const newBody = sanitizeBody(request.body);
    //     }
    const newHeaders = sanitizeHeaders(request.headers);

    return {
        ...request,
        headers: newHeaders,
    };
};

export const sanitizeResponse = (response: Response): Response => {
    const newHeaders = sanitizeHeaders(response.headers);

    return {
        ...response,
        headers: newHeaders,
    };
};

const sanitizeHeaders = (headers?: Headers) => {
    const newHeaders = { ...headers };

    Object.keys(newHeaders)?.forEach((header: string) => {
        if (SENSITIVE_HEADERS.includes(header?.toLowerCase())) {
            newHeaders[header] = '[REDACTED]';
        }
    });

    return newHeaders;
};

/** These are known headers that are secrets. */
const SENSITIVE_HEADERS = ['authorization', 'cookie', 'proxy-authorization'];
