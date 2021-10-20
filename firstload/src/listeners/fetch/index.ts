import { HighlightPublicInterface } from '../..';
import { getFetchRequestProperties } from '../../../../client/src/listeners/network-listener/utils/fetch-listener';
import {
    createNetworkRequestId,
    getHighlightRequestHeader,
    HIGHLIGHT_REQUEST_HEADER,
    shouldNetworkRequestBeRecorded,
    shouldNetworkRequestBeTraced,
} from '../../../../client/src/listeners/network-listener/utils/utils';
import { SESSION_STORAGE_KEYS } from '../../../../client/src/utils/sessionStorage/sessionStorageKeys';

interface HighlightWindow extends Window {
    H: HighlightPublicInterface;
}

declare var window: HighlightWindow;

export const initializeFetchListener = () => {
    // Only run this on Highlight local development and production.
    // This check will be removed before we release backend errors to everyone.
    if (
        !(
            window.location.host === 'localhost:3000' ||
            window.location.host === 'app.highlight.run'
        )
    ) {
        return () => {};
    }
    const originalFetch = window.fetch;

    window.fetch = function (input, init) {
        const { url } = getFetchRequestProperties(input, init);
        const { options } = window?.H;

        const sessionSecureId = window.sessionStorage.getItem(
            SESSION_STORAGE_KEYS.SESSION_SECURE_ID
        );

        // `sessionSecureId` will be defined after client has loaded and been initialized.
        if (sessionSecureId && options) {
            if (
                !shouldNetworkRequestBeRecorded(
                    url,
                    options.backendUrl || '',
                    options.tracingOrigins || []
                )
            ) {
                return originalFetch.call(this, input, init);
            }

            if (
                options.tracingOrigins?.length &&
                shouldNetworkRequestBeTraced(url, options.tracingOrigins)
            ) {
                init = init || {};
                // Pre-existing headers could be one of three different formats; this reads all of them.
                let headers = new Headers(init.headers);
                const requestId = createNetworkRequestId();
                headers.set(
                    HIGHLIGHT_REQUEST_HEADER,
                    getHighlightRequestHeader(sessionSecureId, requestId)
                );
                init.headers = Object.fromEntries(headers.entries());
            }
        }

        const responsePromise = originalFetch.call(this, input, init);

        return responsePromise;
    };

    return () => {
        window.fetch = originalFetch;
    };
};
