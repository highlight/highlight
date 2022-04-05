import { HighlightPublicInterface } from '../types/types';

interface SegmentContext {
    payload: any;
    next: any;
    integrations: any;
}

const HighlightSegmentMiddleware = ({ next, payload }: SegmentContext) => {
    if (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined' &&
        'H' in window
    ) {
        if (payload.obj.type === 'track') {
            const trackEventName = payload.obj.event;
            const trackEventProperties = payload.obj.properties;
            window.H.track(trackEventName, trackEventProperties);
        }
    }

    next(payload);
};

export default HighlightSegmentMiddleware;

interface HighlightWindow extends Window {
    H: HighlightPublicInterface;
}

declare var window: HighlightWindow;
