import { addCustomEvent, record } from '@highlight-run/rrweb';
import {
    eventWithTime,
    listenerHandler,
} from '@highlight-run/rrweb/dist/types';
import { ConsoleListener } from './listeners/console-listener';
import { ErrorListener } from './listeners/error-listener';
import { PathListener } from './listeners/path-listener';
import { GraphQLClient } from 'graphql-request';
import {
    Sdk,
    getSdk,
    PushPayloadMutationVariables,
    PushPayloadDocument,
} from './graph/generated/operations';
import StackTrace from 'stacktrace-js';
import stringify from 'json-stringify-safe';
import { print } from 'graphql';

import {
    ConsoleMessage,
    ErrorMessage,
    NetworkResourceContent,
} from '../../frontend/src/util/shared-types';
import { ViewportResizeListener } from './listeners/viewport-resize-listener';
import { SegmentIntegrationListener } from './listeners/segment-integration-listener';
import { ClickListener } from './listeners/click-listener/click-listener';
import { FocusListener } from './listeners/focus-listener/focus-listener';
import packageJson from '../package.json';
import 'clientjs';

export const HighlightWarning = (context: string, msg: any) => {
    console.warn(`Highlight Warning: (${context}): `, { output: msg });
};
class Logger {
    debug: boolean | undefined;
    constructor(debug?: boolean) {
        this.debug = debug;
    }
    log(...data: any[]) {
        if (this.debug) {
            console.log.apply(console, data);
        }
    }
}

export type DebugOptions = {
    clientInteractions?: boolean;
    domRecording?: boolean;
};

export type HighlightClassOptions = {
    organizationID: number | string;
    debug?: boolean | DebugOptions;
    backendUrl?: string;
    disableNetworkRecording?: boolean;
    disableConsoleRecording?: boolean;
    enableSegmentIntegration?: boolean;
    enableStrictPrivacy?: boolean;
    firstloadVersion?: string;
    environment?: 'development' | 'production' | 'staging' | string;
    appVersion?: string;
};

/**
 * Subset of HighlightClassOptions that is stored with the session. These fields are stored for debugging purposes.
 */
type HighlightClassOptionsInternal = Omit<
    HighlightClassOptions,
    'firstloadVersion'
>;

type PropertyType = {
    type?: 'track' | 'session';
    source?: Source;
};

type Source = 'segment' | undefined;

type SessionData = {
    sessionID: number;
    sessionStartTime?: number;
    userIdentifier?: string;
    userObject?: Object;
};

/**
 * The amount of time between sending the client-side payload to Highlight backend client.
 * In milliseconds.
 */
const SEND_FREQUENCY = 1000 * 5;

/**
 * Maximum length of a session
 */
const MAX_SESSION_LENGTH = 4 * 60 * 60 * 1000;

export class Highlight {
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
    /** The end-user's app version. This isn't Highlight's version. */
    appVersion: string | undefined;
    _optionsInternal: HighlightClassOptionsInternal;
    _backendUrl: string;
    _recordingStartTime: number = 0;

    static create(options: HighlightClassOptions): Highlight {
        return new Highlight(options);
    }

    constructor(options: HighlightClassOptions) {
        if (typeof options?.debug === 'boolean') {
            this.debugOptions = options.debug
                ? { clientInteractions: true }
                : {};
        } else {
            this.debugOptions = options?.debug ?? {};
        }
        this.ready = false;
        this.state = 'NotRecording';
        this.disableNetworkRecording = options.disableNetworkRecording;
        this.disableConsoleRecording = options.disableConsoleRecording;
        this.enableSegmentIntegration = options.enableSegmentIntegration;
        this.enableStrictPrivacy = options.enableStrictPrivacy || false;
        this.logger = new Logger(this.debugOptions.clientInteractions);
        this._backendUrl =
            options?.backendUrl ||
            process.env.PUBLIC_GRAPH_URI ||
            'https://public.highlight.run';
        const client = new GraphQLClient(`${this._backendUrl}`, {
            headers: {},
        });
        this.graphqlSDK = getSdk(client);
        this.environment = options.environment || 'production';
        this.appVersion = options.appVersion;

        if (typeof options.organizationID === 'string') {
            this.organizationID = options.organizationID;
        } else if (typeof options.organizationID === 'number') {
            this.organizationID = options.organizationID.toString();
        } else {
            this.organizationID = '';
        }
        this.firstloadVersion = options.firstloadVersion || 'unknown';
        this.sessionData = {
            sessionID: 0,
            sessionStartTime: Date.now(),
        };
        // We only want to store a subset of the options for debugging purposes. Firstload version is stored as another field so we don't need to store it here.
        const { firstloadVersion: _, ...optionsInternal } = options;
        this._optionsInternal = optionsInternal;
        this.listeners = [];
        this.events = [];
        this.errors = [];
        this.networkContents = [];
        this.messages = [];
    }

    async identify(user_identifier: string, user_object = {}, source?: Source) {
        if (source === 'segment') {
            addCustomEvent(
                'Segment Identify',
                stringify({ user_identifier, ...user_object })
            );
        } else {
            addCustomEvent(
                'Identify',
                stringify({ user_identifier, ...user_object })
            );
        }
        this.sessionData.userIdentifier = user_identifier.toString();
        this.sessionData.userObject = user_object;
        await this.graphqlSDK.identifySession({
            session_id: this.sessionData.sessionID.toString(),
            user_identifier: this.sessionData.userIdentifier,
            user_object: user_object,
        });
        const sourceString = source === 'segment' ? source : 'default';
        this.logger.log(
            `Identify (${user_identifier}, source: ${sourceString}) w/ obj: ${stringify(
                user_object
            )} @ ${process.env.PUBLIC_GRAPH_URI}`
        );
    }

    async pushCustomError(message: string, payload?: string) {
        const result = await StackTrace.get();
        const frames = result.slice(1);
        this.errors.push({
            event: message,
            type: 'custom',
            url: window.location.href,
            source: frames[0].fileName ?? '',
            lineNumber: frames[0].lineNumber ?? 0,
            columnNumber: frames[0].columnNumber ?? 0,
            stackTrace: frames,
            timestamp: new Date().toISOString(),
            payload: payload,
        });
    }

    async addProperties(properties_obj = {}, typeArg?: PropertyType) {
        // Session properties are custom properties that the Highlight snippet adds (visited-url, referrer, etc.)
        if (typeArg?.type === 'session') {
            await this.graphqlSDK.addSessionProperties({
                session_id: this.sessionData.sessionID.toString(),
                properties_object: properties_obj,
            });
            this.logger.log(
                `AddSessionProperties to session (${
                    this.sessionData.sessionID
                }) w/ obj: ${JSON.stringify(properties_obj)} @ ${
                    process.env.PUBLIC_GRAPH_URI
                }`
            );
        }
        // Track properties are properties that users define; rn, either through segment or manually.
        else {
            if (typeArg?.source === 'segment') {
                addCustomEvent<string>(
                    'Segment Track',
                    stringify(properties_obj)
                );
            } else {
                addCustomEvent<string>('Track', stringify(properties_obj));
            }
            await this.graphqlSDK.addTrackProperties({
                session_id: this.sessionData.sessionID.toString(),
                properties_object: properties_obj,
            });
            const sourceString =
                typeArg?.source === 'segment' ? typeArg.source : 'default';
            this.logger.log(
                `AddTrackProperties to session (${
                    this.sessionData.sessionID
                }, source: ${sourceString}) w/ obj: ${stringify(
                    properties_obj
                )} @ ${process.env.PUBLIC_GRAPH_URI}`
            );
        }
    }
    // TODO: (organization_id is only here because of old clients, we should figure out how to version stuff).
    async initialize(organization_id?: number | string) {
        var org_id = '';
        if (typeof organization_id === 'number') {
            org_id = organization_id.toString();
        } else if (typeof organization_id === 'string') {
            org_id = organization_id;
        } else {
            org_id = '0';
        }
        try {
            if (organization_id) {
                this.organizationID = org_id;
            }
            let storedSessionData = JSON.parse(
                window.sessionStorage.getItem('sessionData') || '{}'
            );
            let reloaded = false;

            const recordingStartTime = window.sessionStorage.getItem(
                'highlightRecordingStartTime'
            );
            if (!recordingStartTime) {
                this._recordingStartTime = new Date().getTime();
                window.sessionStorage.setItem(
                    'highlightRecordingStartTime',
                    this._recordingStartTime.toString()
                );
            } else {
                this._recordingStartTime = parseInt(recordingStartTime, 10);
            }

            // To handle the 'Duplicate Tab' function, remove id from storage until page unload
            window.sessionStorage.removeItem('sessionData');
            if (storedSessionData && storedSessionData.sessionID) {
                this.sessionData = storedSessionData;
                reloaded = true;
            } else {
                // @ts-ignore
                const client = new ClientJS();
                let fingerprint = 0;
                if ('getFingerprint' in client) {
                    fingerprint = client.getFingerprint();
                }
                const gr = await this.graphqlSDK.initializeSession({
                    organization_verbose_id: this.organizationID,
                    enable_strict_privacy: this.enableStrictPrivacy,
                    clientVersion: packageJson['version'],
                    firstloadVersion: this.firstloadVersion,
                    clientConfig: JSON.stringify(this._optionsInternal),
                    environment: this.environment,
                    id: fingerprint.toString(),
                    appVersion: this.appVersion,
                });
                this.sessionData.sessionID = parseInt(
                    gr?.initializeSession?.id || '0'
                );
                const organization_id = gr?.initializeSession?.organization_id;
                this.logger.log(
                    `Loaded Highlight
  Remote: ${process.env.PUBLIC_GRAPH_URI}
  Org ID: ${organization_id}
  Verbose Org ID: ${this.organizationID}
  SessionID: ${this.sessionData.sessionID}
  Session Data:
  `,
                    gr.initializeSession
                );
                if (this.sessionData.userIdentifier) {
                    this.identify(
                        this.sessionData.userIdentifier,
                        this.sessionData.userObject
                    );
                }
            }
            setTimeout(() => {
                this._save();
            }, SEND_FREQUENCY);
            const emit = (event: eventWithTime) => {
                this.events.push(event);
            };
            emit.bind(this);
            const recordStop = record({
                ignoreClass: 'highlight-ignore',
                blockClass: 'highlight-block',
                emit,
                enableStrictPrivacy: this.enableStrictPrivacy,
                maskAllInputs: this.enableStrictPrivacy,
            });
            if (recordStop) {
                this.listeners.push(recordStop);
            }
            addCustomEvent('Viewport', {
                height: window.innerHeight,
                width: window.innerWidth,
            });

            const highlightThis = this;
            if (this.enableSegmentIntegration) {
                this.listeners.push(
                    SegmentIntegrationListener((obj: any) => {
                        if (obj.type === 'track') {
                            const properties: { [key: string]: string } = {};
                            properties['segment-event'] = obj.event;
                            highlightThis.addProperties(properties, {
                                type: 'track',
                                source: 'segment',
                            });
                        } else if (obj.type === 'identify') {
                            highlightThis.identify(
                                obj.userId,
                                obj.traits,
                                'segment'
                            );
                        }
                    })
                );
            }

            if (document.referrer) {
                addCustomEvent<string>('Referrer', document.referrer);
                highlightThis.addProperties(
                    { referrer: document.referrer },
                    { type: 'session' }
                );
            }
            this.listeners.push(
                PathListener((url: string) => {
                    if (reloaded) {
                        addCustomEvent<string>('Reload', url);
                        reloaded = false;
                        highlightThis.addProperties(
                            { reload: true },
                            { type: 'session' }
                        );
                    } else {
                        addCustomEvent<string>('Navigate', url);
                    }
                    highlightThis.addProperties(
                        { 'visited-url': url },
                        { type: 'session' }
                    );
                })
            );
            if (!this.disableConsoleRecording) {
                this.listeners.push(
                    ConsoleListener((c: ConsoleMessage) => {
                        if (c.type == 'Error' && c.value && c.trace)
                            highlightThis.errors.push({
                                event: stringify(c.value),
                                type: 'console.error',
                                url: window.location.href,
                                source: c.trace[0].fileName
                                    ? c.trace[0].fileName
                                    : '',
                                lineNumber: c.trace[0].lineNumber
                                    ? c.trace[0].lineNumber
                                    : 0,
                                columnNumber: c.trace[0].columnNumber
                                    ? c.trace[0].columnNumber
                                    : 0,
                                stackTrace: c.trace,
                                timestamp: new Date().toISOString(),
                            });
                        highlightThis.messages.push(c);
                    })
                );
            }
            this.listeners.push(
                ErrorListener((e: ErrorMessage) => highlightThis.errors.push(e))
            );
            this.listeners.push(
                ViewportResizeListener((viewport) => {
                    addCustomEvent('Viewport', viewport);
                })
            );
            this.listeners.push(
                ClickListener((clickTarget) => {
                    if (clickTarget) {
                        addCustomEvent('Click', clickTarget);
                    }
                })
            );
            this.listeners.push(
                FocusListener((focusTarget) => {
                    if (focusTarget) {
                        addCustomEvent('Focus', focusTarget);
                    }
                })
            );
            // Send the payload as the page closes. navigator.sendBeacon guarantees that a request will be made.
            window.addEventListener('beforeunload', () => {
                const payload = this._getPayload();
                let blob = new Blob(
                    [
                        JSON.stringify({
                            query: print(PushPayloadDocument),
                            variables: payload,
                        }),
                    ],
                    {
                        type: 'application/json',
                    }
                );
                navigator.sendBeacon(`${this._backendUrl}`, blob);
            });
            this.ready = true;
            this.state = 'Recording';
        } catch (e) {
            HighlightWarning('initializeSession', e);
        }
        window.addEventListener('beforeunload', () => {
            addCustomEvent('Page Unload', '');
            window.sessionStorage.setItem(
                'sessionData',
                JSON.stringify(this.sessionData)
            );
        });
    }

    /**
     * Stops Highlight from recording.
     * @param manual The end user requested to stop recording.
     */
    stopRecording(manual?: boolean) {
        if (manual) {
            addCustomEvent(
                'Stop',
                'H.stop() was called which stops Highlight from recording.'
            );
        }
        this.state = 'NotRecording';
        this.listeners.forEach((stop: listenerHandler) => stop());
        this.listeners = [];
    }

    getCurrentSessionTimestamp() {
        return this._recordingStartTime;
    }

    // Reset the events array and push to a backend.
    async _save() {
        try {
            if (!this.sessionData.sessionID) {
                return;
            }
            const payload = this._getPayload();
            await this.graphqlSDK.PushPayload(payload);
            this.errors = [];
            this.messages = [];
            this.networkContents = [];
            // Listeners are cleared when the user calls stop() manually.
            if (this.listeners.length === 0) {
                return;
            }
            if (
                this.listeners &&
                this.sessionData.sessionStartTime &&
                Date.now() - this.sessionData.sessionStartTime >
                    MAX_SESSION_LENGTH
            ) {
                this.sessionData.sessionStartTime = Date.now();
                this.stopRecording();
                this.initialize(this.organizationID);
                return;
            }
        } catch (e) {
            HighlightWarning('_save', e);
        }
        setTimeout(() => {
            this._save();
        }, SEND_FREQUENCY);
    }

    _getPayload(): PushPayloadMutationVariables {
        var resources: Array<any> = [];
        if (!this.disableNetworkRecording) {
            // get all resources that don't include 'api.highlight.run'
            resources = performance
                .getEntriesByType('resource')
                .filter(
                    (r) =>
                        !r.name.includes(
                            process.env.PUBLIC_GRAPH_URI ??
                                'https://api.highlight.run'
                        ) || !r.name.includes('highlight.run')
                );
        }

        const resourcesString = stringify({ resources: resources });
        const messagesString = stringify({ messages: this.messages });
        this.logger.log(
            `Sending: ${this.events.length} events, ${this.messages.length} messages, ${resources.length} network resources, ${this.errors.length} errors \nTo: ${process.env.PUBLIC_GRAPH_URI}\nOrg: ${this.organizationID}\nSessionID: ${this.sessionData.sessionID}`
        );
        if (!this.disableNetworkRecording) {
            performance.clearResourceTimings();
        }

        // We are creating a weak copy of the events. rrweb could have pushed more events to this.events while we send the request with the events as a payload.
        // Originally, we would clear this.events but this could lead to a race condition.
        // Example Scenario:
        // 1. Create the events payload from this.events (with N events)
        // 2. rrweb pushes to this.events (with M events)
        // 3. Network request made to push payload (Only includes N events)
        // 4. this.events is cleared (we lose M events)
        const events = [...this.events];
        this.events = this.events.slice(events.length);

        return {
            session_id: this.sessionData.sessionID.toString(),
            events: { events },
            messages: messagesString,
            resources: resourcesString,
            errors: this.errors,
        };
    }
}

(window as any).Highlight = Highlight;

declare global {
    interface Console {
        defaultLog: any;
        defaultError: any;
        defaultWarn: any;
        defaultDebug: any;
    }
}
