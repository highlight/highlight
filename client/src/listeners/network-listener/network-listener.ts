import { FetchListener } from './utils/fetch-listener';
import { RequestResponsePair } from './utils/models';
import { sanitizeRequest, sanitizeResponse } from './utils/network-sanitizer';
import { XHRListener } from './utils/xhr-listener';

export type NetworkListenerCallback = (
    requestResponsePair: RequestResponsePair
) => void;

interface NetworkListenerArguments {
    xhrCallback: NetworkListenerCallback;
    fetchCallback: NetworkListenerCallback;
    headersToRedact: string[];
}

export const NetworkListener = ({
    xhrCallback,
    fetchCallback,
    headersToRedact,
}: NetworkListenerArguments) => {
    const removeXHRListener = XHRListener((requestResponsePair) => {
        xhrCallback(
            sanitizeRequestResponsePair(requestResponsePair, headersToRedact)
        );
    });
    const removeFetchListener = FetchListener((requestResponsePair) => {
        fetchCallback(
            sanitizeRequestResponsePair(requestResponsePair, headersToRedact)
        );
    });

    return () => {
        removeXHRListener();
        removeFetchListener();
    };
};

const sanitizeRequestResponsePair = (
    { request, response }: RequestResponsePair,
    headersToRedact: string[]
): RequestResponsePair => {
    return {
        request: sanitizeRequest(request, headersToRedact),
        response: sanitizeResponse(response, headersToRedact),
    };
};
