import { eventWithTime } from '@highlight-run/rrweb/dist/types';
export type HighlightEvent = eventWithTime & { identifier: string };

export type HighlightPerformancePayload = {
    jsHeapSizeLimit: number;
    usedJSHeapSize: number;
    relativeTimestamp: number;
    fps: number;
};
