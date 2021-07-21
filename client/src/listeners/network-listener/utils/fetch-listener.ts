import { NetworkListenerCallback } from '../network-listener';
import {
    RequestResponsePair,
    Request as HighlightRequest,
    Response as HighlightResponse,
} from './models';
import { isHighlightNetworkResourceFilter } from './utils';

export const FetchListener = (
    callback: NetworkListenerCallback,
    backendUrl: string
) => {
    const originalFetch = window.fetch;

    window.fetch = function (input, init) {
        const { method, url } = getRequestProperties(input, init);
        const request: HighlightRequest = {
            headers: init?.headers as any,
            body: init?.body,
            url,
            verb: method,
        };
        let responsePromise: Promise<Response>;

        responsePromise = originalFetch.call(this, input, init);

        if (!isHighlightNetworkResourceFilter(url, backendUrl)) {
            logRequest(responsePromise, request, callback);
        }

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
    callback: NetworkListenerCallback
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
            let text: string;
            try {
                text = await response.clone().text();
            } catch (e) {
                // const reader = response.body?.getReader();
                // let td = new TextDecoder();
                // if (reader) {
                //     let codedArr = await reader.read();
                //     let textBasedResult = td.decode(codedArr.value);
                //     console.log(textBasedResult);
                // }
                // const data = await response.arrayBuffer();
                // console.log(data);
                text = `Unable to clone response: ${e as string}`;
            }

            responsePayload = {
                ...responsePayload,
                body: text,
                headers: response.headers,
                status: response.status,
                size: text.length * 8,
            };

            requestHandled = true;
        }

        if (requestHandled) {
            const event: RequestResponsePair = {
                request: requestPayload,
                response: responsePayload,
            };

            callback(event);
        }
    };
    responsePromise.then(onPromiseResolveHandler);
};
