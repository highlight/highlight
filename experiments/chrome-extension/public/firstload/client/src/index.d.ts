import { eventWithTime, listenerHandler } from '@highlight-run/rrweb/dist/types';
import { Sdk, PushPayloadMutationVariables } from './graph/generated/operations';
import { ConsoleMessage, ErrorMessage, NetworkResourceContent } from '../../frontend/src/util/shared-types';
import 'clientjs';
export declare const HighlightWarning: (context: string, msg: any) => void;
declare class Logger {
    debug: boolean | undefined;
    constructor(debug?: boolean);
    log(...data: any[]): void;
}
export declare type DebugOptions = {
    clientInteractions?: boolean;
    domRecording?: boolean;
};
export declare type HighlightClassOptions = {
    organizationID: number | string;
    debug?: boolean | DebugOptions;
    backendUrl?: string;
    disableNetworkRecording?: boolean;
    disableConsoleRecording?: boolean;
    enableSegmentIntegration?: boolean;
    enableStrictPrivacy?: boolean;
    firstloadVersion?: string;
    environment?: 'development' | 'production' | 'staging' | string;
};
/**
 * Subset of HighlightClassOptions that is stored with the session. These fields are stored for debugging purposes.
 */
declare type HighlightClassOptionsInternal = Omit<HighlightClassOptions, 'firstloadVersion'>;
declare type PropertyType = {
    type?: 'track' | 'session';
    source?: Source;
};
declare type Source = 'segment' | undefined;
declare type SessionData = {
    sessionID: number;
    sessionStartTime?: number;
    userIdentifier?: string;
    userObject?: Object;
};
export declare class Highlight {
    organizationID: string;
    graphqlSDK: Sdk;
    events: eventWithTime[];
    errors: ErrorMessage[];
    messages: ConsoleMessage[];
    networkContents: NetworkResourceContent[];
    sessionData: SessionData;
    /** @deprecated Use state instead. Ready should be removed when Highlight releases 2.0. */
    ready: boolean;
    state: 'NotRecording' | 'Recording';
    logger: Logger;
    disableNetworkRecording: boolean | undefined;
    disableConsoleRecording: boolean | undefined;
    enableSegmentIntegration: boolean | undefined;
    enableStrictPrivacy: boolean;
    debugOptions: DebugOptions;
    listeners: listenerHandler[];
    firstloadVersion: string;
    environment: string;
    _optionsInternal: HighlightClassOptionsInternal;
    _backendUrl: string;
    _recordingStartTime: number;
    static create(options: HighlightClassOptions): Highlight;
    constructor(options: HighlightClassOptions);
    identify(user_identifier: string, user_object?: {}, source?: Source): Promise<void>;
    pushCustomError(message: string, payload?: string): Promise<void>;
    addProperties(properties_obj?: {}, typeArg?: PropertyType): Promise<void>;
    initialize(organization_id?: number | string): Promise<void>;
    /**
     * Stops Highlight from recording.
     * @param manual The end user requested to stop recording.
     */
    stopRecording(manual?: boolean): void;
    getCurrentSessionTimestamp(): number;
    _save(): Promise<void>;
    _getPayload(): PushPayloadMutationVariables;
}
declare global {
    interface Console {
        defaultLog: any;
        defaultError: any;
        defaultWarn: any;
        defaultDebug: any;
    }
}
export {};
