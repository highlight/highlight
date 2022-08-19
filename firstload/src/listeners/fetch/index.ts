import { HighlightFetchWindow } from '../../../../client/src/listeners/network-listener/utils/fetch-listener';
import { HighlightPublicInterface } from '../../types/types';

type HighlightWindow = Window & {
    H: HighlightPublicInterface;
} & HighlightFetchWindow;

declare var window: HighlightWindow;

export const initializeFetchListener = () => {
    if (!(typeof window === 'undefined' || typeof document === 'undefined')) {
        window._originalFetch = window.fetch;
        window._fetchProxy = (input, init) => {
            return window._originalFetch(input, init);
        };

        window._highlightFetchPatch = (
            input: RequestInfo,
            init: RequestInit | undefined
        ) => {
            return window._fetchProxy.call(window || global, input, init);
        };

        window.fetch = window._highlightFetchPatch;
    }
};
