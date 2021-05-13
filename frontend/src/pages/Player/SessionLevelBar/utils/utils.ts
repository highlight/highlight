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
