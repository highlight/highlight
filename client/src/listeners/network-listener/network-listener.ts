import { FetchListener } from './utils/fetch-listener';
import { RequestResponsePair } from './utils/models';
import { XHRListener } from './utils/xhr-listener';

export type NetworkListenerCallback = (
    requestResponsePair: RequestResponsePair
) => void;

interface NetworkListenerArguments {
    xhrCallback: NetworkListenerCallback;
    fetchCallback: NetworkListenerCallback;
}

export const NetworkListener = ({
    xhrCallback,
    fetchCallback,
}: NetworkListenerArguments) => {
    const removeXHRListener = XHRListener(xhrCallback);
    const removeFetchListener = FetchListener(fetchCallback);

    return () => {
        removeXHRListener();
        removeFetchListener();
    };
};
