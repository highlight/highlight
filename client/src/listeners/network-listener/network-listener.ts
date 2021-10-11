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
    backendUrl: string;
    tracingOrigins: string[];
    urlBlocklist: string[];
    sessionID: number;
}

export const NetworkListener = ({
    xhrCallback,
    fetchCallback,
    headersToRedact,
    backendUrl,
    tracingOrigins,
    urlBlocklist,
    sessionID,
}: NetworkListenerArguments) => {
    const removeXHRListener = XHRListener(
        (requestResponsePair) => {
            console.log("got an xhr callback");
            xhrCallback(
                sanitizeRequestResponsePair(
                    requestResponsePair,
                    headersToRedact
                )
            );
        },
        backendUrl,
        tracingOrigins,
        urlBlocklist,
        sessionID,
    );
    const removeFetchListener = FetchListener(
        (requestResponsePair) => {
            console.log("got a fetch callback");
            fetchCallback(
                sanitizeRequestResponsePair(
                    requestResponsePair,
                    headersToRedact
                )
            );
        },
        backendUrl,
        tracingOrigins,
        urlBlocklist
    );

    return () => {
        removeXHRListener();
        removeFetchListener();
    };
};

const sanitizeRequestResponsePair = (
    { request, response, ...rest }: RequestResponsePair,
    headersToRedact: string[]
): RequestResponsePair => {
    return {
        request: sanitizeRequest(request, headersToRedact),
        response: sanitizeResponse(response, headersToRedact),
        ...rest,
    };
};
