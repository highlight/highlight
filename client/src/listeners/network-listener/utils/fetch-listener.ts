import { getBodyThatShouldBeRecorded } from '../utils/xhr-listener';
import { NetworkListenerCallback } from '../network-listener';
import {
    RequestResponsePair,
    Request as HighlightRequest,
    Response as HighlightResponse,
} from './models';
import {
    createNetworkRequestId,
    getHighlightRequestHeader,
    HIGHLIGHT_REQUEST_HEADER,
    shouldNetworkRequestBeRecorded,
    shouldNetworkRequestBeTraced,
} from './utils';

export interface HighlightFetchWindow {
    _originalFetch: (
        input: RequestInfo,
        init?: RequestInit | undefined
    ) => Promise<Response>;
    _highlightFetchPatch: (
        input: RequestInfo,
        init?: RequestInit | undefined
    ) => Promise<Response>;
    /** The implementation for the fetch patch. The implementation can be hot swapped at any time. */
    _fetchProxy: (
        input: RequestInfo,
        init?: RequestInit | undefined
    ) => Promise<Response>;
}

declare var window: HighlightFetchWindow & Window;

export const FetchListener = (
    callback: NetworkListenerCallback,
    backendUrl: string,
    tracingOrigins: boolean | (string | RegExp)[],
    urlBlocklist: string[],
    sessionSecureID: string,
    bodyKeysToRecord?: string[]
) => {
    const originalFetch = window._originalFetch || window.fetch;

    window._fetchProxy = function (input, init) {
        const { method, url } = getFetchRequestProperties(input, init);
        if (!shouldNetworkRequestBeRecorded(url, backendUrl, tracingOrigins)) {
            return originalFetch.call(this, input, init);
        }

        const requestId = createNetworkRequestId();
        if (shouldNetworkRequestBeTraced(url, tracingOrigins)) {
            init = init || {};
            // Pre-existing headers could be one of three different formats; this reads all of them.
            let headers = new Headers(init.headers);
            headers.set(
                HIGHLIGHT_REQUEST_HEADER,
                getHighlightRequestHeader(sessionSecureID, requestId)
            );
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
            request.headers = Object.fromEntries(
                new Headers(init?.headers).entries()
            );
            request.body = getBodyThatShouldBeRecorded(
                init?.body,
                bodyKeysToRecord
            );
        }

        let responsePromise = originalFetch.call(this, input, init);
        logRequest(
            responsePromise,
            request,
            callback,
            shouldRecordHeaderAndBody,
            bodyKeysToRecord
        );
        return responsePromise;
    };

    return () => {
        window.fetch = originalFetch;
    };
};

export const getFetchRequestProperties = (
    input: RequestInfo,
    init?: RequestInit
) => {
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
    shouldRecordHeaderAndBody: boolean,
    bodyKeysToRecord?: string[]
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
                    /**
                     * We are using the TextDecoder because it supports a larger number of use cases.
                     * Using just `response.text()` sometimes causes the body to fail due to the request being aborted.
                     * https://stackoverflow.com/questions/41946457/getting-text-from-fetch-response-object
                     */
                    const clone = response.clone();
                    const body = clone.body;
                    if (body) {
                        let reader = body.getReader();
                        let utf8Decoder = new TextDecoder();
                        let nextChunk;

                        let result = '';

                        while (!(nextChunk = await reader.read()).done) {
                            let partialData = nextChunk.value;
                            result += utf8Decoder.decode(partialData);
                        }
                        text = result;
                        text = getBodyThatShouldBeRecorded(
                            text,
                            bodyKeysToRecord
                        );
                    } else {
                        text = '';
                    }
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
