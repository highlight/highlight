import { HighlightPublicInterface } from '../..';
import { HighlightFetchWindow } from '../../../../client/src/listeners/network-listener/utils/fetch-listener';

type HighlightWindow = Window & {
    H: HighlightPublicInterface;
} & HighlightFetchWindow;

declare var window: HighlightWindow;

export const initializeFetchListener = () => {
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
};
