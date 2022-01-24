import { addCustomEvent, record } from '@highlight-run/rrweb';
import {
    eventWithTime,
    listenerHandler,
} from '@highlight-run/rrweb/dist/types';
import { ConsoleListener } from './listeners/console-listener';
import { ErrorListener } from './listeners/error-listener';
import { PathListener } from './listeners/path-listener';
import { GraphQLClient } from 'graphql-request';
import ErrorStackParser from 'error-stack-parser';
import {
    Sdk,
    getSdk,
    PushPayloadMutationVariables,
    PushPayloadDocument,
} from './graph/generated/operations';
import StackTrace from 'stacktrace-js';
import stringify from 'json-stringify-safe';
import { graphql, print } from 'graphql';

import {
    ConsoleMessage,
    ErrorMessage,
} from '../../frontend/src/util/shared-types';
import { ViewportResizeListener } from './listeners/viewport-resize-listener';
import { SegmentIntegrationListener } from './listeners/segment-integration-listener';
import { ClickListener } from './listeners/click-listener/click-listener';
import { FocusListener } from './listeners/focus-listener/focus-listener';
import packageJson from '../package.json';
import 'clientjs';
import { NetworkListener } from './listeners/network-listener/network-listener';
import { RequestResponsePair } from './listeners/network-listener/utils/models';
import {
    matchPerformanceTimingsWithRequestResponsePair,
    shouldNetworkRequestBeRecorded,
} from './listeners/network-listener/utils/utils';
import { DEFAULT_URL_BLOCKLIST } from './listeners/network-listener/utils/network-sanitizer';
import { SESSION_STORAGE_KEYS } from './utils/sessionStorage/sessionStorageKeys';
import SessionShortcutListener from './listeners/session-shortcut/session-shortcut-listener';
import { WebVitalsListener } from './listeners/web-vitals-listener/web-vitals-listener';
import {
    FeedbackWidgetOptions,
    initializeFeedbackWidget,
} from './ui/feedback-widget/feedback-widget';
import { getPerformanceMethods } from './utils/performance/performance';
import { ERRORS_TO_IGNORE, ERROR_PATTERNS_TO_IGNORE } from './constants/errors';

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
            console.log.apply(console, [`[${Date.now()}]`, ...data]);
        }
    }
}

export type DebugOptions = {
    clientInteractions?: boolean;
    domRecording?: boolean;
};

export type NetworkRecordingOptions = {
    /**
     * Enables recording of network requests.
     * The data includes the URLs, the size of the request, and how long the request took.
     * @default true
     */
    enabled?: boolean;
    /**
     * This enables recording XMLHttpRequest and Fetch headers and bodies.
     * @default false
     */
    recordHeadersAndBody?: boolean;
    /**
     * Request and response headers where the value is not recorded.
     * The header value is replaced with '[REDACTED]'.
     * These headers are case-insensitive.
     * `recordHeadersAndBody` needs to be enabled.
     * @example
     * networkHeadersToRedact: ['Secret-Header', 'Plain-Text-Password']
     */
    networkHeadersToRedact?: string[];
    /**
     * URLs to not record headers and bodies for.
     * To disable recording headers and bodies for all URLs, set `recordHeadersAndBody` to `false`.
     * @default ['https://www.googleapis.com/identitytoolkit', 'https://securetoken.googleapis.com']
     */
    urlBlocklist?: string[];
};

export type SessionShortcutOptions = false | string;

export type IntegrationOptions = {
    mixpanel?: MixpanelIntegrationOptions;
    amplitude?: AmplitudeIntegrationOptions;
};

export interface MixpanelIntegrationOptions {
    projectToken: string;
}

export interface AmplitudeIntegrationOptions {
    apiKey: string;
}

export type HighlightClassOptions = {
    organizationID: number | string;
    debug?: boolean | DebugOptions;
    backendUrl?: string;
    tracingOrigins?: boolean | (string | RegExp)[];
    disableNetworkRecording?: boolean;
    networkRecording?: boolean | NetworkRecordingOptions;
    disableConsoleRecording?: boolean;
    enableSegmentIntegration?: boolean;
    enableStrictPrivacy?: boolean;
    enableCanvasRecording?: boolean;
    firstloadVersion?: string;
    environment?: 'development' | 'production' | 'staging' | string;
    appVersion?: string;
    sessionShortcut?: SessionShortcutOptions;
    feedbackWidget?: FeedbackWidgetOptions;
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

export type SessionData = {
    sessionID: number;
    sessionSecureID: string;
    projectID: number;
    sessionStartTime?: number;
    lastPushTime?: number;
    userIdentifier?: string;
    userObject?: Object;
};

/**
 *  The amount of time to wait until sending the first payload.
 */
const FIRST_SEND_FREQUENCY = 1000 * 1;
/**
 * The amount of time between sending the client-side payload to Highlight backend client.
 * In milliseconds.
 */
const SEND_FREQUENCY = 1000 * 2;
/**
 * The amount of time allowed after the last push before creating a new session.
 * In milliseconds.
 */
const SESSION_PUSH_THRESHOLD = 1000 * 55;

/**
 * Maximum length of a session
 */
const MAX_SESSION_LENGTH = 4 * 60 * 60 * 1000;

const MAX_PUBLIC_GRAPH_RETRY_ATTEMPTS = 5;

const HIGHLIGHT_URL = 'app.highlight.run';

export class Highlight {
    /** Determines if the client is running on a Highlight property (e.g. frontend). */
    isRunningOnHighlight: boolean;
    /** Verbose project ID that is exposed to users. Legacy users may still be using ints. */
    organizationID: string;
    graphqlSDK: Sdk;
    events: eventWithTime[];
    errors: ErrorMessage[];
    messages: ConsoleMessage[];
    xhrNetworkContents: RequestResponsePair[] = [];
    fetchNetworkContents: RequestResponsePair[] = [];
    tracingOrigins: boolean | (string | RegExp)[] = [];
    networkHeadersToRedact: string[] = [];
    urlBlocklist: string[] = [];
    sessionData: SessionData;
    ready: boolean;
    state: 'NotRecording' | 'Recording';
    /**
     * The number of requests to public graph that have failed in a row.
     */
    numberOfFailedRequests = 0;
    logger: Logger;
    disableNetworkRecording: boolean | undefined;
    enableRecordingNetworkContents: boolean;
    disableConsoleRecording: boolean | undefined;
    enableSegmentIntegration: boolean | undefined;
    enableStrictPrivacy: boolean;
    enableCanvasRecording: boolean;
    debugOptions: DebugOptions;
    listeners: listenerHandler[];
    firstloadVersion: string;
    environment: string;
    sessionShortcut: SessionShortcutOptions = false;
    /** The end-user's app version. This isn't Highlight's version. */
    appVersion: string | undefined;
    _optionsInternal: HighlightClassOptionsInternal;
    _backendUrl: string;
    _recordingStartTime: number = 0;
    _isOnLocalHost: boolean = false;
    _onToggleFeedbackFormVisibility: () => void;
    pushPayloadTimerId: ReturnType<typeof setTimeout> | undefined;
    feedbackWidgetOptions: FeedbackWidgetOptions;
    hasSessionUnloaded: boolean;

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

        // Old versions of `firstload` use `disableNetworkRecording`. We fork here to ensure backwards compatibility.
        if (options?.disableNetworkRecording !== undefined) {
            this.disableNetworkRecording = options?.disableNetworkRecording;
            this.enableRecordingNetworkContents = false;
            this.networkHeadersToRedact = [];
            this.urlBlocklist = [];
        } else if (typeof options?.networkRecording === 'boolean') {
            this.disableNetworkRecording = !options.networkRecording;
            this.enableRecordingNetworkContents = false;
            this.networkHeadersToRedact = [];
            this.urlBlocklist = [];
        } else {
            if (options.networkRecording?.enabled !== undefined) {
                this.disableNetworkRecording = !options.networkRecording
                    .enabled;
            } else {
                this.disableNetworkRecording = false;
            }
            this.enableRecordingNetworkContents =
                options.networkRecording?.recordHeadersAndBody || false;
            this.networkHeadersToRedact =
                options.networkRecording?.networkHeadersToRedact?.map(
                    (header) => header.toLowerCase()
                ) || [];
            this.urlBlocklist =
                options.networkRecording?.urlBlocklist?.map((url) =>
                    url.toLowerCase()
                ) || [];
            this.urlBlocklist = [
                ...this.urlBlocklist,
                ...DEFAULT_URL_BLOCKLIST,
            ];
        }

        this.ready = false;
        this.state = 'NotRecording';
        this.disableConsoleRecording =
            // Disable recording the console on localhost.
            // We're doing this because on some development builds, the console ends up in an infinite loop.
            window.location.hostname === 'localhost' ||
            options.disableConsoleRecording;
        this.enableSegmentIntegration = options.enableSegmentIntegration;
        this.enableStrictPrivacy = options.enableStrictPrivacy || false;
        this.enableCanvasRecording = options.enableCanvasRecording || false;
        this.logger = new Logger(this.debugOptions.clientInteractions);
        this._backendUrl =
            options?.backendUrl ||
            process.env.PUBLIC_GRAPH_URI ||
            'https://pub.highlight.run';
        this.tracingOrigins = options.tracingOrigins || [];
        const client = new GraphQLClient(`${this._backendUrl}`, {
            headers: {},
        });
        const graphQLRequestWrapper = async <T,>(
            requestFn: () => Promise<T>,
            retries: number = 0
        ): Promise<T> => {
            const MAX_RETRIES = 5;
            const INITIAL_BACKOFF = 300;
            try {
                return await requestFn();
            } catch (error: any) {
                if (error?.response?.status >= 500 && retries < MAX_RETRIES) {
                    await new Promise((resolve) =>
                        setTimeout(
                            resolve,
                            INITIAL_BACKOFF * Math.pow(2, retries)
                        )
                    );
                    return await graphQLRequestWrapper(requestFn, retries + 1);
                }
                throw error;
            }
        };
        this.graphqlSDK = getSdk(client, graphQLRequestWrapper);
        this.environment = options.environment || 'production';
        this.appVersion = options.appVersion;

        if (typeof options.organizationID === 'string') {
            this.organizationID = options.organizationID;
        } else if (typeof options.organizationID === 'number') {
            this.organizationID = options.organizationID.toString();
        } else {
            this.organizationID = '';
        }
        this.isRunningOnHighlight =
            this.organizationID === '1' || this.organizationID === '1jdkoe52';
        this._isOnLocalHost = window.location.hostname === 'localhost';
        this.firstloadVersion = options.firstloadVersion || 'unknown';
        this.sessionShortcut = options.sessionShortcut || false;
        this.feedbackWidgetOptions = {
            enabled: options.feedbackWidget?.enabled || false,
            subTitle: options.feedbackWidget?.subTitle,
            submitButtonLabel: options.feedbackWidget?.submitButtonLabel,
            title: options.feedbackWidget?.title,
        };
        this._onToggleFeedbackFormVisibility = () => {};
        this.sessionData = {
            sessionID: 0,
            sessionSecureID: '',
            projectID: 0,
            sessionStartTime: Date.now(),
        };
        // We only want to store a subset of the options for debugging purposes. Firstload version is stored as another field so we don't need to store it here.
        const { firstloadVersion: _, ...optionsInternal } = options;
        this._optionsInternal = optionsInternal;
        this.listeners = [];
        this.events = [];
        this.errors = [];
        this.messages = [];
        this.hasSessionUnloaded = false;

        if (window.Intercom) {
            window.Intercom('onShow', () => {
                window.Intercom('update', {
                    highlightSessionURL: this.getCurrentSessionURL(),
                });
            });
        }
    }

    async identify(user_identifier: string, user_object = {}, source?: Source) {
        if (!user_identifier || user_identifier === '') {
            console.warn(
                `Highlight's identify() call was passed an empty identifier.`,
                { user_identifier, user_object }
            );
            return;
        }
        if (!this._shouldSendRequest()) {
            return;
        }
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
        window.sessionStorage.setItem(
            'highlightIdentifier',
            user_identifier.toString()
        );
        window.sessionStorage.setItem(
            'highlightUserObject',
            JSON.stringify(user_object)
        );
        try {
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
            this.numberOfFailedRequests = 0;
        } catch (e) {
            if (this._isOnLocalHost) {
                console.error(e);
            }
            this.numberOfFailedRequests += 1;
        }
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

    async consumeCustomError(error: Error, message?: string, payload?: string) {
        let res: ErrorStackParser.StackFrame[] = [];
        try {
            res = ErrorStackParser.parse(error);
        } catch (e) {
            if (this._isOnLocalHost) {
                console.error(e);
            }
        }
        this.errors.push({
            event: message ? message + ':' + error.message : error.message,
            type: 'custom',
            url: window.location.href,
            source: '',
            lineNumber: res[0]?.lineNumber ? res[0]?.lineNumber : 0,
            columnNumber: res[0]?.columnNumber ? res[0]?.columnNumber : 0,
            stackTrace: res,
            timestamp: new Date().toISOString(),
            payload: payload,
        });
    }

    async addProperties(properties_obj = {}, typeArg?: PropertyType) {
        if (!this._shouldSendRequest()) {
            return;
        }
        // Session properties are custom properties that the Highlight snippet adds (visited-url, referrer, etc.)
        if (typeArg?.type === 'session') {
            try {
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
                this.numberOfFailedRequests = 0;
            } catch (e) {
                if (this._isOnLocalHost) {
                    console.error(e);
                }
                this.numberOfFailedRequests += 1;
            }
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
            try {
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
                this.numberOfFailedRequests = 0;
            } catch (e) {
                if (this._isOnLocalHost) {
                    console.error(e);
                }
                this.numberOfFailedRequests += 1;
            }
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
            if (this.feedbackWidgetOptions.enabled) {
                const {
                    onToggleFeedbackFormVisibility,
                } = initializeFeedbackWidget(this.feedbackWidgetOptions);
                this._onToggleFeedbackFormVisibility = onToggleFeedbackFormVisibility;
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
            if (
                storedSessionData &&
                storedSessionData.sessionID &&
                storedSessionData.lastPushTime &&
                Date.now() - storedSessionData.lastPushTime <
                    SESSION_PUSH_THRESHOLD
            ) {
                this.sessionData = storedSessionData;
                reloaded = true;
            } else {
                // @ts-ignore
                const client = new ClientJS();
                let fingerprint = 0;
                if ('getFingerprint' in client) {
                    fingerprint = client.getFingerprint();
                }
                try {
                    const gr = await this.graphqlSDK.initializeSession({
                        organization_verbose_id: this.organizationID,
                        enable_strict_privacy: this.enableStrictPrivacy,
                        enable_recording_network_contents: this
                            .enableRecordingNetworkContents,
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
                    this.sessionData.sessionSecureID =
                        gr?.initializeSession?.secure_id || '';
                    window.sessionStorage.setItem(
                        SESSION_STORAGE_KEYS.SESSION_SECURE_ID,
                        this.sessionData.sessionSecureID
                    );
                    this.sessionData.projectID = parseInt(
                        gr?.initializeSession?.project_id || '0'
                    );
                    this.logger.log(
                        `Loaded Highlight
  Remote: ${process.env.PUBLIC_GRAPH_URI}
  Friendly Project ID: ${this.organizationID}
  Short Project ID: ${this.sessionData.projectID}
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
                    this.numberOfFailedRequests = 0;
                    const { getDeviceDetails } = getPerformanceMethods();
                    if (getDeviceDetails) {
                        const deviceDetails = getDeviceDetails();

                        this.graphqlSDK.addDeviceMetric({
                            session_id: this.sessionData.sessionID.toString(),
                            metric: {
                                name: 'DeviceMemory',
                                value: deviceDetails.deviceMemory,
                            },
                        });
                    }
                } catch (e) {
                    if (this._isOnLocalHost) {
                        console.error(e);
                    }
                    this.numberOfFailedRequests += 1;
                }
            }
            if (this.pushPayloadTimerId) {
                clearTimeout(this.pushPayloadTimerId);
            }
            this.pushPayloadTimerId = setTimeout(() => {
                this._save();
            }, FIRST_SEND_FREQUENCY);
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
                recordCanvas: this.enableCanvasRecording,
                keepIframeSrcFn: (_src) => {
                    return true;
                },
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
                            // Removes the starting and end quotes
                            // Example: "boba" -> boba
                            const trimmedUserId = obj.userId.replace(
                                /^"(.*)"$/,
                                '$1'
                            );

                            highlightThis.identify(
                                trimmedUserId,
                                obj.traits,
                                'segment'
                            );
                        }
                    })
                );
            }

            if (document.referrer) {
                // Don't record the referrer if it's the same origin.
                // Non-single page apps might have the referrer set to the same origin.
                // If we record this then the referrer data will not be useful.
                // Most users will want to see referrers outside of their website/app.
                // This will be a configuration set in `H.init()` later.
                if (
                    !(
                        window &&
                        document.referrer.includes(window.location.origin)
                    )
                ) {
                    addCustomEvent<string>('Referrer', document.referrer);
                    highlightThis.addProperties(
                        { referrer: document.referrer },
                        { type: 'session' }
                    );
                }
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
                    ConsoleListener(
                        (c: ConsoleMessage) => {
                            if (
                                (c.type === 'Error' || c.type === 'error') &&
                                c.value &&
                                c.trace
                            ) {
                                const errorValue = stringify(c.value);
                                if (
                                    ERRORS_TO_IGNORE.includes(errorValue) ||
                                    ERROR_PATTERNS_TO_IGNORE.some((pattern) =>
                                        errorValue.includes(pattern)
                                    )
                                ) {
                                    return;
                                }
                                highlightThis.errors.push({
                                    event: errorValue,
                                    type: 'console.error',
                                    url: window.location.href,
                                    source: c.trace[0]?.fileName
                                        ? c.trace[0].fileName
                                        : '',
                                    lineNumber: c.trace[0]?.lineNumber
                                        ? c.trace[0].lineNumber
                                        : 0,
                                    columnNumber: c.trace[0]?.columnNumber
                                        ? c.trace[0].columnNumber
                                        : 0,
                                    stackTrace: c.trace,
                                    timestamp: new Date().toISOString(),
                                });
                            } else {
                                highlightThis.messages.push(c);
                            }
                        },
                        {
                            lengthThreshold: 1000,
                            level: [
                                'assert',
                                'count',
                                'countReset',
                                'debug',
                                'dir',
                                'dirxml',
                                'error',
                                'group',
                                'groupCollapsed',
                                'groupEnd',
                                'info',
                                'log',
                                'table',
                                'time',
                                'timeEnd',
                                'timeLog',
                                'trace',
                                'warn',
                            ],
                            logger: 'console',
                            stringifyOptions: {
                                depthOfLimit: 10,
                                numOfKeysLimit: 100,
                                stringLengthLimit: 1000,
                            },
                        }
                    )
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

            this.listeners.push(
                WebVitalsListener((data) => {
                    const { name, value } = data;
                    try {
                        this.graphqlSDK.addWebVitals({
                            session_id: this.sessionData.sessionID.toString(),
                            metric: { name, value },
                        });
                    } catch {}
                })
            );

            if (this.sessionShortcut) {
                SessionShortcutListener(this.sessionShortcut, () => {
                    window.open(
                        this.getCurrentSessionURLWithTimestamp(),
                        '_blank'
                    );
                });
            }

            if (
                !this.disableNetworkRecording &&
                this.enableRecordingNetworkContents
            ) {
                this.listeners.push(
                    NetworkListener({
                        xhrCallback: (requestResponsePair) => {
                            this.xhrNetworkContents.push(requestResponsePair);
                        },
                        fetchCallback: (requestResponsePair) => {
                            this.fetchNetworkContents.push(requestResponsePair);
                        },
                        headersToRedact: this.networkHeadersToRedact,
                        backendUrl: this._backendUrl,
                        tracingOrigins: this.tracingOrigins,
                        urlBlocklist: this.urlBlocklist,
                        sessionData: this.sessionData,
                    })
                );
            }

            if (this.isRunningOnHighlight) {
                window.addEventListener('beforeunload', () => {
                    this.hasSessionUnloaded = true;
                });
                // Send the payload every time the page is no longer visible - this includes when the tab is closed, as well
                // as when switching tabs or apps on mobile. Non-blocking.
                document.addEventListener('visibilitychange', () => {
                    if (
                        document.visibilityState === 'hidden' &&
                        'sendBeacon' in navigator
                    ) {
                        const payload = this._getPayload({ isBeacon: true });
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
                    }
                });
            }

            // Clear the timer so it doesn't block the next page navigation.
            window.addEventListener('beforeunload', () => {
                if (this.pushPayloadTimerId) {
                    clearTimeout(this.pushPayloadTimerId);
                }
            });
            if (
                this.sessionData.projectID &&
                this.sessionData.sessionSecureID
            ) {
                this.ready = true;
                this.state = 'Recording';
            }
        } catch (e) {
            if (this._isOnLocalHost) {
                console.error(e);
                HighlightWarning('initializeSession', e);
            }
        }
        window.addEventListener('beforeunload', () => {
            addCustomEvent('Page Unload', '');
            window.sessionStorage.setItem(
                'sessionData',
                JSON.stringify(this.sessionData)
            );
        });

        // beforeunload is not supported on iOS on Safari. Apple docs recommend using `pagehide` instead.
        const isOnIOS =
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPhone/i);
        if (isOnIOS) {
            window.addEventListener('pagehide', () => {
                addCustomEvent('Page Unload', '');
                window.sessionStorage.setItem(
                    'sessionData',
                    JSON.stringify(this.sessionData)
                );
            });
        }
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

    /**
     * Returns the current timestamp for the current session.
     */
    getCurrentSessionURLWithTimestamp() {
        const now = new Date().getTime();
        const { projectID, sessionSecureID } = this.sessionData;
        const relativeTimestamp = (now - this._recordingStartTime) / 1000;
        const highlightUrl = `https://${HIGHLIGHT_URL}/${projectID}/sessions/${sessionSecureID}?ts=${relativeTimestamp}`;

        return highlightUrl;
    }

    getCurrentSessionURL() {
        const projectID = this.sessionData.projectID;
        const sessionSecureID = this.sessionData.sessionSecureID;
        if (projectID && sessionSecureID) {
            return `https://${HIGHLIGHT_URL}/${projectID}/sessions/${sessionSecureID}`;
        }
        return null;
    }

    toggleFeedbackWidgetVisibility() {
        if (this.feedbackWidgetOptions.enabled) {
            this._onToggleFeedbackFormVisibility();
        } else {
            console.warn(
                `Highlight's toggleFeedbackWidgetVisibility() was called. You need to configure feedbackWidget in the Highlight options to show the feedback widget.`
            );
        }
    }

    addSessionFeedback({
        timestamp,
        verbatim,
        user_email,
        user_name,
    }: {
        verbatim: string;
        timestamp: string;
        user_name?: string;
        user_email?: string;
    }) {
        if (!this._shouldSendRequest()) {
            return;
        }
        try {
            this.graphqlSDK.addSessionFeedback({
                session_id: this.sessionData.sessionID.toString(),
                timestamp,
                verbatim,
                user_email: user_email || this.sessionData.userIdentifier,
                // @ts-expect-error
                user_name: user_name || this.sessionData.userObject?.name,
            });

            this.numberOfFailedRequests = 0;
        } catch (e) {
            if (this._isOnLocalHost) {
                console.error(e);
            }
            this.numberOfFailedRequests += 1;
        }
    }

    // Reset the events array and push to a backend.
    async _save() {
        if (!this._shouldSendRequest()) {
            return;
        }
        try {
            if (!this.sessionData.sessionID) {
                return;
            }
            try {
                const payload = this._getPayload({ isBeacon: false });
                await this.graphqlSDK.PushPayload(payload);
                this.numberOfFailedRequests = 0;
                this.sessionData.lastPushTime = Date.now();
                // Listeners are cleared when the user calls stop() manually.
                if (this.listeners.length === 0) {
                    return;
                }
                if (
                    this.state === 'Recording' &&
                    this.listeners &&
                    this.sessionData.sessionStartTime &&
                    Date.now() - this.sessionData.sessionStartTime >
                        MAX_SESSION_LENGTH
                ) {
                    this.sessionData.sessionStartTime = Date.now();
                    this.stopRecording();
                    return;
                }
            } catch (e) {
                if (this._isOnLocalHost) {
                    console.error(e);
                }
                this.numberOfFailedRequests += 1;
            }
        } catch (e) {
            if (this._isOnLocalHost) {
                console.error(e);
                HighlightWarning('_save', e);
            }
        }
        if (this.state === 'Recording') {
            if (this.pushPayloadTimerId) {
                clearTimeout(this.pushPayloadTimerId);
            }
            this.pushPayloadTimerId = setTimeout(() => {
                this._save();
            }, SEND_FREQUENCY);
        }
    }

    _shouldSendRequest(): boolean {
        return (
            this._recordingStartTime !== 0 &&
            this.numberOfFailedRequests < MAX_PUBLIC_GRAPH_RETRY_ATTEMPTS &&
            this.sessionData.sessionID !== 0
        );
    }

    _getPayload({
        isBeacon,
    }: {
        isBeacon: boolean;
    }): PushPayloadMutationVariables {
        let resources: Array<any> = [];
        if (!this.disableNetworkRecording) {
            // get all resources that don't include 'api.highlight.run'
            resources = performance.getEntriesByType('resource');

            resources = resources.filter((r) =>
                shouldNetworkRequestBeRecorded(
                    r.name,
                    this._backendUrl,
                    this.tracingOrigins
                )
            );

            if (this.enableRecordingNetworkContents) {
                resources = matchPerformanceTimingsWithRequestResponsePair(
                    resources,
                    this.xhrNetworkContents,
                    'xmlhttprequest'
                );
                resources = matchPerformanceTimingsWithRequestResponsePair(
                    resources,
                    this.fetchNetworkContents,
                    'fetch'
                );
            }
        }

        const messages = [...this.messages];
        const events = [...this.events];
        const errors = [...this.errors];

        // SendBeacon is not guaranteed to succeed, so keep the events and re-upload on
        // the next PushPayload if there is one. The backend will remove all existing beacon
        // payloads whenever it receives a new payload.
        if (!isBeacon) {
            if (!this.disableNetworkRecording) {
                this.xhrNetworkContents = [];
                this.fetchNetworkContents = [];
                performance.clearResourceTimings();
            }
            // We are creating a weak copy of the events. rrweb could have pushed more events to this.events while we send the request with the events as a payload.
            // Originally, we would clear this.events but this could lead to a race condition.
            // Example Scenario:
            // 1. Create the events payload from this.events (with N events)
            // 2. rrweb pushes to this.events (with M events)
            // 3. Network request made to push payload (Only includes N events)
            // 4. this.events is cleared (we lose M events)
            this.messages = this.messages.slice(messages.length);
            this.events = this.events.slice(events.length);
            this.errors = this.errors.slice(errors.length);
        }

        this.logger.log(
            `Sending: ${events.length} events, ${messages.length} messages, ${resources.length} network resources, ${errors.length} errors \nTo: ${this._backendUrl}\nOrg: ${this.organizationID}\nSessionID: ${this.sessionData.sessionID}`
        );

        const resourcesString = JSON.stringify({ resources: resources });
        const messagesString = stringify({ messages: messages });
        return {
            session_id: this.sessionData.sessionID.toString(),
            events: { events },
            messages: messagesString,
            resources: resourcesString,
            errors,
            is_beacon: isBeacon,
            has_session_unloaded: this.hasSessionUnloaded,
        };
    }
}

(window as any).Highlight = Highlight;
interface HighlightWindow extends Window {
    Highlight: Highlight;
    Intercom?: any;
}

declare var window: HighlightWindow;

declare global {
    interface Console {
        defaultLog: any;
        defaultError: any;
        defaultWarn: any;
        defaultDebug: any;
    }
}
