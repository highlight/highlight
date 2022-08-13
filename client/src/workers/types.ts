import { eventWithTime } from '@highlight-run/rrweb/typings/types';
import {
    ConsoleMessage,
    ErrorMessage,
} from '../../../frontend/src/util/shared-types';

export type HighlightClientWorkerParams = {
    backend: string;
    id: number;
    sessionSecureID: string;
    isBeacon: boolean;
    hasSessionUnloaded: boolean;
    highlightLogs: string;
    events: eventWithTime[];
    messages: ConsoleMessage[];
    errors: ErrorMessage[];
    resourcesString: string;
};

export type HighlightClientWorkerResponse = {
    id: number;
    eventsSize: number;
};
