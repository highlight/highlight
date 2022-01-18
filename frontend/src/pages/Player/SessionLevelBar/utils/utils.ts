import { customEvent } from '@highlight-run/rrweb/dist/types';

import { HighlightEvent } from '../../HighlightEvent';

/**
 * Finds the first event of a type.
 * Assumes the events are sorted by timestamp.
 * @param events Replayer Events
 * @param type A list of events to find the first of. Will return the first match in the list.
 */
export const findFirstEventOfType = (
    events: HighlightEvent[],
    type: string[]
) => {
    return events.find((e) => {
        const event = e as customEvent<string>;
        if (type.includes(event.data.tag)) {
            return event.data.payload;
        }
    });
};

export const findLatestUrl = (
    urlEvents: customEvent<string>[],
    currentTime: number
) => {
    if (urlEvents.length === 0) {
        return '-';
    }
    let latestUrl = urlEvents[0].data.payload;
    let i = 0;

    while (i < urlEvents.length) {
        const urlEvent = urlEvents[i];
        // timestamp always exists
        // @ts-expect-error
        if (urlEvent.timestamp > currentTime) {
            break;
        }
        latestUrl = urlEvent.data.payload;
        i++;
    }

    return latestUrl;
};

export const getAllUrlEvents = (events: HighlightEvent[]) => {
    const urlEvents = events.filter((event) => {
        if (event.type !== 5) {
            return false;
        }

        if (event.data.tag === 'Navigate' || event.data.tag === 'Reload') {
            return true;
        }
    });

    return urlEvents as customEvent<string>[];
};
