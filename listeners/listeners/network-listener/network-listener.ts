import { SessionData } from '../../index';
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
    tracingOrigins: boolean | (string | RegExp)[];
    urlBlocklist: string[];
    sessionData: SessionData;
}

export const NetworkListener = ({
    xhrCallback,
    fetchCallback,
    headersToRedact,
    backendUrl,
    tracingOrigins,
    urlBlocklist,
    sessionData,
}: NetworkListenerArguments) => {
    const removeXHRListener = XHRListener(
        (requestResponsePair) => {
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
        sessionData,
    );
    const removeFetchListener = FetchListener(
        (requestResponsePair) => {
            fetchCallback(
                sanitizeRequestResponsePair(
                    requestResponsePair,
                    headersToRedact
                )
            );
        },
        backendUrl,
        tracingOrigins,
        urlBlocklist,
        sessionData,
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
