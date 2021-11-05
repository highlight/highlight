import { HighlightPublicInterface } from '../..';
import { HighlightFetchWindow } from '../../../../client/src/listeners/network-listener/utils/fetch-listener';

type HighlightWindow = Window & {
    H: HighlightPublicInterface;
} & HighlightFetchWindow;

declare var window: HighlightWindow;

export const initializeFetchListener = () => {
    // Only run this on Highlight local development and production.
    // This check will be removed before we release backend errors to everyone.
    if (
        window?.location.host === 'localhost:3000' ||
        window?.location.host === 'app.highlight.run'
    ) {
        if (window) {
            window._originalFetch = window.fetch;
            window._fetchProxy = (input, init) => {
                return window._originalFetch(input, init);
            };

            window._highlightFetchPatch = (
                input: RequestInfo,
                init: RequestInit | undefined
            ) => {
                return window._fetchProxy.call(this, input, init);
            };

            window.fetch = window._highlightFetchPatch;
        }
    } else {
        if (window) {
            window._originalFetch = window.fetch;
            window._fetchProxy = (input, init) => {
                return window._originalFetch(input, init);
            };
        }
    }
};
