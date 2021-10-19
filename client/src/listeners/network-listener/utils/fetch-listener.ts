import { SessionData } from '../../../index';
import { NetworkListenerCallback } from '../network-listener';
import {
    RequestResponsePair,
    Request as HighlightRequest,
    Response as HighlightResponse,
} from './models';
import { createNetworkRequestId, getHighlightRequestHeader, HIGHLIGHT_REQUEST_HEADER, shouldNetworkRequestBeRecorded, shouldNetworkRequestBeTraced } from './utils';

export const FetchListener = (
    callback: NetworkListenerCallback,
    backendUrl: string,
    tracingOrigins: string[],
    urlBlocklist: string[],
    sessionData: SessionData
) => {
    const originalFetch = window.fetch;

    window.fetch = function (input, init) {
        const { method, url } = getRequestProperties(input, init);
        if (!shouldNetworkRequestBeRecorded(url, backendUrl, tracingOrigins)) {
            return originalFetch.call(this, input, init);
        }

        const requestId = createNetworkRequestId();
        if (shouldNetworkRequestBeTraced(url, tracingOrigins)) {
            init = init || {};
            // Pre-existing headers could be one of three different formats; this reads all of them.
            let headers = new Headers(init.headers);
            headers.set(HIGHLIGHT_REQUEST_HEADER, getHighlightRequestHeader(sessionData, requestId))
            init.headers = Object.fromEntries(headers.entries());
        }

        const request: HighlightRequest = {
            id: requestId,
            headers: {},
            body: undefined,
            url,
            verb: method,
        };
        const shouldRecordHeaderAndBody = !urlBlocklist.some((blockedUrl) =>
            url.toLowerCase().includes(blockedUrl)
        );
        if (shouldRecordHeaderAndBody) {
            request.headers = Object.fromEntries((new Headers(init?.headers).entries()));
            request.body = init?.body;
        }

        let responsePromise = originalFetch.call(this, input, init);
        logRequest(
            responsePromise,
            request,
            callback,
            shouldRecordHeaderAndBody
        );
        return responsePromise;
    };

    return () => {
        window.fetch = originalFetch;
    };
};

const getRequestProperties = (input: RequestInfo, init?: RequestInit) => {
    const method =
        (init && init.method) ||
        (typeof input === 'object' && input.method) ||
        'GET';
    const url = (typeof input === 'object' && input.url) || (input as string);

    return {
        method,
        url,
    };
};

/** Logs the Fetch request once it resolves. */
const logRequest = (
    responsePromise: Promise<Response>,
    requestPayload: HighlightRequest,
    callback: NetworkListenerCallback,
    shouldRecordHeaderAndBody: boolean
) => {
    const onPromiseResolveHandler = async (response: Response | Error) => {
        let responsePayload: HighlightResponse = {
            body: undefined,
            headers: undefined,
            status: 0,
            size: 0,
        };
        let requestHandled = false;

        if ('stack' in response || response instanceof Error) {
            responsePayload = {
                ...responsePayload,
                body: response.message,
                status: 0,
                size: undefined,
            };

            requestHandled = true;
        } else if ('status' in response) {
            responsePayload = {
                ...responsePayload,
                status: response.status,
            };

            if (shouldRecordHeaderAndBody) {
                let text: string;
                try {
                    text = await response.clone().text();
                } catch (e) {
                    text = `Unable to clone response: ${e as string}`;
                }

                responsePayload.body = text;
                responsePayload.headers = response.headers;
                responsePayload.size = text.length * 8;
            }

            requestHandled = true;
        }

        if (requestHandled) {
            const event: RequestResponsePair = {
                request: requestPayload,
                response: responsePayload,
                urlBlocked: !shouldRecordHeaderAndBody,
            };

            callback(event);
        }
    };
    responsePromise.then(onPromiseResolveHandler);
};
