import { RequestResponsePair } from './utils/models';
import { XHRListener } from './utils/xhr-listener';

export const NetworkListener = (
    callback: (requestResponsePair: RequestResponsePair) => void
) => {
    const removeXHRListener = XHRListener(callback);

    return () => {
        removeXHRListener();
    };
};
