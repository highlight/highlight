import { eventWithTime } from '@highlight-run/rrweb/typings/types';
import {
    ConsoleMessage,
    ErrorMessage,
} from '../../../frontend/src/util/shared-types';

export type Source = 'segment' | undefined;

export type PropertyType = {
    type?: 'track' | 'session';
    source?: Source;
};

export enum MessageType {
    Initialize,
    AsyncEvents,
    Identify,
    Properties,
    Metrics,
    Feedback,
}

export type InitializeMessage = {
    type: MessageType.Initialize;
    organizationID: string;
    enableStrictPrivacy: boolean;
    enableRecordingNetworkContents: boolean;
    clientVersion: string;
    firstloadVersion: string;
    clientConfig: any;
    environment: string;
    id: string;
    appVersion: string;
    clientID: string;
};

export type AsyncEventsMessage = {
    type: MessageType.AsyncEvents;
    id: number;
    isBeacon: boolean;
    hasSessionUnloaded: boolean;
    highlightLogs: string;
    events: eventWithTime[];
    messages: ConsoleMessage[];
    errors: ErrorMessage[];
    resourcesString: string;
};

export type AsyncEventsResponse = {
    type: MessageType.AsyncEvents;
    id: number;
    eventsSize: number;
};

export type IdentifyMessage = {
    type: MessageType.Identify;
    userIdentifier: string;
    userObject: any;
    source?: Source;
};

export type PropertiesMessage = {
    type: MessageType.Properties;
    propertiesObject: any;
    propertyType?: PropertyType;
};

export type MetricsMessage = {
    type: MessageType.Metrics;
    metrics: {
        name: string;
        value: string;
        category: 'WebVital' | 'Device';
        group: string;
        timestamp: Date;
    }[];
};

export type FeedbackMessage = {
    type: MessageType.Feedback;
    verbatim: string;
    timestamp: string;
    userName?: string;
    userEmail?: string;
};

export type HighlightClientWorkerParams = {
    backend: string;
    sessionSecureID: string;
    message:
        | InitializeMessage
        | AsyncEventsMessage
        | IdentifyMessage
        | PropertiesMessage
        | MetricsMessage
        | FeedbackMessage;
};

export type HighlightClientWorkerResponse = {
    response?: AsyncEventsResponse;
};
