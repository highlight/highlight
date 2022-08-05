import {
    addCustomEvent as rrwebAddCustomEvent,
    getRecordSequentialIdPlugin,
    record,
} from '@highlight-run/rrweb';
import {
    eventWithTime,
    listenerHandler,
    SamplingStrategy,
} from '@highlight-run/rrweb/typings/types';
import { FirstLoadListeners } from './listeners/first-load-listeners';
import {
    ConsoleMethods,
    DebugOptions,
    FeedbackWidgetOptions,
    NetworkRecordingOptions,
    SessionShortcutOptions,
} from '../../firstload/src/types/client';
import { PathListener } from './listeners/path-listener';
import { GraphQLClient } from 'graphql-request';
import ErrorStackParser from 'error-stack-parser';
import {
    getSdk,
    PushPayloadDocument,
    PushPayloadMutationVariables,
    Sdk,
} from './graph/generated/operations';
import StackTrace from 'stacktrace-js';
import stringify from 'json-stringify-safe';
import { print } from 'graphql';

import { ViewportResizeListener } from './listeners/viewport-resize-listener';
import { SegmentIntegrationListener } from './listeners/segment-integration-listener';
import { ClickListener } from './listeners/click-listener/click-listener';
import { FocusListener } from './listeners/focus-listener/focus-listener';
import packageJson from '../package.json';
import { SESSION_STORAGE_KEYS } from './utils/sessionStorage/sessionStorageKeys';
import SessionShortcutListener from './listeners/session-shortcut/session-shortcut-listener';
import { WebVitalsListener } from './listeners/web-vitals-listener/web-vitals-listener';
import { initializeFeedbackWidget } from './ui/feedback-widget/feedback-widget';
import { getPerformanceMethods } from './utils/performance/performance';
import {
    PerformanceListener,
    PerformancePayload,
} from './listeners/performance-listener/performance-listener';
import { PageVisibilityListener } from './listeners/page-visibility-listener';
import {
    clearHighlightLogs,
    getHighlightLogs,
    logForHighlight,
} from './utils/highlight-logging';
import { GenerateSecureID } from './utils/secure-id';
import { ReplayEventsInput } from './graph/generated/schemas';
import { getSimpleSelector } from './utils/dom';
import { ClientJS } from 'clientjs';
import {
    getPreviousSessionData,
    SessionData,
} from './utils/sessionStorage/highlightSession';
import publicGraphURI from 'consts:publicGraphURI';

export const HighlightWarning = (context: string, msg: any) => {
    console.warn(`Highlight Warning: (${context}): `, { output: msg });
};

enum LOCAL_STORAGE_KEYS {
    CLIENT_ID = 'highlightClientID',
}

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

export type HighlightClassOptions = {
    organizationID: number | string;
    debug?: boolean | DebugOptions;
    backendUrl?: string;
    tracingOrigins?: boolean | (string | RegExp)[];
    disableNetworkRecording?: boolean;
    networkRecording?: boolean | NetworkRecordingOptions;
    disableConsoleRecording?: boolean;
    consoleMethodsToRecord?: ConsoleMethods[];
    enableSegmentIntegration?: boolean;
    enableStrictPrivacy?: boolean;
    enableCanvasRecording?: boolean;
    samplingStrategy?: SamplingStrategy;
    inlineImages?: boolean;
    inlineStylesheet?: boolean;
    firstloadVersion?: string;
    environment?: 'development' | 'production' | 'staging' | string;
    appVersion?: string;
    sessionShortcut?: SessionShortcutOptions;
    feedbackWidget?: FeedbackWidgetOptions;
    sessionSecureID: string; // Introduced in firstLoad 3.0.1
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
 * Maximum length of a session
 */
const MAX_SESSION_LENGTH = 4 * 60 * 60 * 1000;

const MAX_PUBLIC_GRAPH_RETRY_ATTEMPTS = 5;

const HIGHLIGHT_URL = 'app.highlight.run';

const PROPERTY_MAX_LENGTH = 2000;

/*
 * Don't take another full snapshot unless it's been at least
 * 4 minutes AND the cumulative payload size since the last
 * snapshot is > 10MB.
 */
const MIN_SNAPSHOT_BYTES = 10e6;
const MIN_SNAPSHOT_TIME = 4 * 60 * 1000;

export class Highlight {
    options!: HighlightClassOptions;
    /** Determines if the client is running on a Highlight property (e.g. frontend). */
    isRunningOnHighlight!: boolean;
    /** Verbose project ID that is exposed to users. Legacy users may still be using ints. */
    organizationID!: string;
    graphqlSDK!: Sdk;
    events!: eventWithTime[];
    sessionData!: SessionData;
    ready!: boolean;
    state!: 'NotRecording' | 'Recording';
    /**
     * The number of requests to public graph that have failed in a row.
     */
    numberOfFailedRequests!: number;
    logger!: Logger;
    enableSegmentIntegration!: boolean;
    enableStrictPrivacy!: boolean;
    enableCanvasRecording!: boolean;
    samplingStrategy!: SamplingStrategy;
    inlineImages!: boolean;
    inlineStylesheet!: boolean;
    debugOptions!: DebugOptions;
    listeners!: listenerHandler[];
    firstloadVersion!: string;
    environment!: string;
    sessionShortcut!: SessionShortcutOptions;
    /** The end-user's app version. This isn't Highlight's version. */
    appVersion!: string | undefined;
    _optionsInternal!: HighlightClassOptionsInternal;
    _backendUrl!: string;
    _recordingStartTime!: number;
    _isOnLocalHost!: boolean;
    _onToggleFeedbackFormVisibility!: () => void;
    _firstLoadListeners!: FirstLoadListeners;
    _eventBytesSinceSnapshot!: number;
    _lastSnapshotTime!: number;
    pushPayloadTimerId!: ReturnType<typeof setTimeout> | undefined;
    feedbackWidgetOptions!: FeedbackWidgetOptions;
    hasSessionUnloaded!: boolean;
    hasPushedData!: boolean;
    _payloadId!: number;

    static create(options: HighlightClassOptions): Highlight {
        return new Highlight(options);
    }

    constructor(
        options: HighlightClassOptions,
        firstLoadListeners?: FirstLoadListeners
    ) {
        if (!options.sessionSecureID) {
            // Firstload versions before 3.0.1 did not have this property
            options.sessionSecureID = GenerateSecureID();
        }
        // default to inlining stylesheets to help with recording accuracy
        options.inlineStylesheet = true;
        this.options = options;
        // Old firstLoad versions (Feb 2022) do not pass in FirstLoadListeners, so we have to fallback to creating it
        this._firstLoadListeners =
            firstLoadListeners || new FirstLoadListeners(options);
        this._initMembers(this.options);
    }

    // Start a new session
    async _reset() {
        this.stopRecording();
        if (this.pushPayloadTimerId) {
            clearTimeout(this.pushPayloadTimerId);
        }

        let user_identifier, user_object;
        try {
            user_identifier = window.sessionStorage.getItem(
                SESSION_STORAGE_KEYS.USER_IDENTIFIER
            );
            const user_object_string = window.sessionStorage.getItem(
                SESSION_STORAGE_KEYS.USER_OBJECT
            );
            if (user_object_string) {
                user_object = JSON.parse(user_object_string);
            }
        } catch (err) {}
        for (const storageKeyName of Object.values(SESSION_STORAGE_KEYS)) {
            window.sessionStorage.removeItem(storageKeyName);
        }

        // no need to set the sessionStorage value here since firstload won't call
        // init again after a reset, and `this.initialize()` will set sessionStorage
        this.options.sessionSecureID = GenerateSecureID();
        this._firstLoadListeners = new FirstLoadListeners(this.options);
        this._initMembers(this.options);
        await this.initialize();
        if (user_identifier && user_object) {
            await this.identify(user_identifier, user_object);
        }
    }

    _initMembers(options: HighlightClassOptions) {
        this.numberOfFailedRequests = 0;
        this.sessionShortcut = false;
        this._recordingStartTime = 0;
        this._isOnLocalHost = false;

        if (typeof options?.debug === 'boolean') {
            this.debugOptions = options.debug
                ? { clientInteractions: true }
                : {};
        } else {
            this.debugOptions = options?.debug ?? {};
        }

        this.ready = false;
        this.state = 'NotRecording';
        this.enableSegmentIntegration = !!options.enableSegmentIntegration;
        this.enableStrictPrivacy = options.enableStrictPrivacy || false;
        this.enableCanvasRecording = options.enableCanvasRecording || false;
        this.inlineImages = options.inlineImages || false;
        this.inlineStylesheet = options.inlineStylesheet || false;
        this.samplingStrategy = options.samplingStrategy || { canvas: 1 };
        this.logger = new Logger(this.debugOptions.clientInteractions);
        this._backendUrl =
            options?.backendUrl ||
            publicGraphURI ||
            'https://pub.highlight.run';
        const client = new GraphQLClient(`${this._backendUrl}`, {
            headers: {},
        });
        const graphQLRequestWrapper = async <T,>(
            requestFn: () => Promise<T>,
            operationName: string,
            operationType?: string,
            retries: number = 0
        ): Promise<T> => {
            const MAX_RETRIES = 5;
            const INITIAL_BACKOFF = 300;
            try {
                return await requestFn();
            } catch (error: any) {
                if (
                    (!error?.response?.status ||
                        error?.response?.status >= 500) &&
                    retries < MAX_RETRIES
                ) {
                    await new Promise((resolve) =>
                        setTimeout(
                            resolve,
                            INITIAL_BACKOFF * Math.pow(2, retries)
                        )
                    );
                    return await graphQLRequestWrapper(
                        requestFn,
                        operationName,
                        operationType,
                        retries + 1
                    );
                }
                logForHighlight(
                    '[' +
                        (this.sessionData?.sessionSecureID ||
                            this.options?.sessionSecureID) +
                        '] Request failed after ' +
                        retries +
                        ' retries'
                );
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
            onSubmit: options.feedbackWidget?.onSubmit,
            onCancel: options.feedbackWidget?.onCancel,
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
        this.hasSessionUnloaded = false;
        this.hasPushedData = false;

        if (window.Intercom) {
            window.Intercom('onShow', () => {
                window.Intercom('update', {
                    highlightSessionURL: this.getCurrentSessionURLWithTimestamp(),
                });
                this.addProperties({ event: 'Intercom onShow' });
            });
        }

        this._eventBytesSinceSnapshot = 0;
        this._lastSnapshotTime = new Date().getTime();
        this._payloadId =
            Number(
                window.sessionStorage.getItem(SESSION_STORAGE_KEYS.PAYLOAD_ID)
            ) ?? 1;
        window.sessionStorage.setItem(
            SESSION_STORAGE_KEYS.PAYLOAD_ID,
            this._payloadId.toString()
        );
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
            this.addCustomEvent(
                'Segment Identify',
                stringify({ user_identifier, ...user_object })
            );
        } else {
            this.addCustomEvent(
                'Identify',
                stringify({ user_identifier, ...user_object })
            );
        }
        this.sessionData.userIdentifier = user_identifier.toString();
        this.sessionData.userObject = user_object;
        window.sessionStorage.setItem(
            SESSION_STORAGE_KEYS.USER_IDENTIFIER,
            user_identifier.toString()
        );
        window.sessionStorage.setItem(
            SESSION_STORAGE_KEYS.USER_OBJECT,
            JSON.stringify(user_object)
        );
        try {
            const stringified = this._stringifyProperties(user_object, 'user');
            await this.graphqlSDK.identifySession({
                session_id: this.sessionData.sessionID.toString(),
                user_identifier: this.sessionData.userIdentifier,
                user_object: stringified,
            });
            const sourceString = source === 'segment' ? source : 'default';
            this.logger.log(
                `Identify (${user_identifier}, source: ${sourceString}) w/ obj: ${stringify(
                    user_object
                )} @ ${publicGraphURI}`
            );
            this.numberOfFailedRequests = 0;
        } catch (e) {
            if (this._isOnLocalHost) {
                console.error(e);
            }
            this.numberOfFailedRequests += 1;
        }
    }

    _stringifyProperties(
        properties_object: any,
        type: 'session' | 'track' | 'user'
    ) {
        const stringifiedObj: any = {};
        const invalidTypes: any[] = [];
        const tooLong: any[] = [];
        for (const [key, value] of Object.entries(properties_object)) {
            if (value === undefined || value === null) {
                continue;
            }

            if (!['number', 'string', 'boolean'].includes(typeof value)) {
                invalidTypes.push({ [key]: value });
            }
            let asString: string;
            if (value === undefined) {
                asString = 'undefined';
            } else if (value === null) {
                asString = 'null';
            } else if (typeof value === 'string') {
                asString = value;
            } else {
                asString = stringify(value);
            }
            if (asString.length > PROPERTY_MAX_LENGTH) {
                tooLong.push({ [key]: value });
                asString = asString.substring(0, PROPERTY_MAX_LENGTH);
            }

            stringifiedObj[key] = asString;
        }

        // Skipping logging for 'session' type because they're generated by Highlight
        // (e.g. visited-url > 2000 characters)
        if (type !== 'session') {
            if (invalidTypes.length > 0) {
                console.warn(
                    `Highlight was passed one or more ${type} properties not of type string, number, or boolean.`,
                    invalidTypes
                );
            }

            if (tooLong.length > 0) {
                console.warn(
                    `Highlight was passed one or more ${type} properties exceeding 2000 characters, which will be truncated.`,
                    tooLong
                );
            }
        }

        return stringifiedObj;
    }

    async pushCustomError(message: string, payload?: string) {
        const result = await StackTrace.get();
        const frames = result.slice(1);
        this._firstLoadListeners.errors.push({
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
        this._firstLoadListeners.errors.push({
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
                const stringified = this._stringifyProperties(
                    properties_obj,
                    'session'
                );
                await this.graphqlSDK.addSessionProperties({
                    session_id: this.sessionData.sessionID.toString(),
                    properties_object: stringified,
                });
                this.logger.log(
                    `AddSessionProperties to session (${
                        this.sessionData.sessionID
                    }) w/ obj: ${JSON.stringify(
                        properties_obj
                    )} @ ${publicGraphURI}`
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
                this.addCustomEvent<string>(
                    'Segment Track',
                    stringify(properties_obj)
                );
            } else {
                this.addCustomEvent<string>('Track', stringify(properties_obj));
            }
            try {
                const stringified = this._stringifyProperties(
                    properties_obj,
                    'track'
                );
                await this.graphqlSDK.addTrackProperties({
                    session_id: this.sessionData.sessionID.toString(),
                    properties_object: stringified,
                });
                const sourceString =
                    typeArg?.source === 'segment' ? typeArg.source : 'default';
                this.logger.log(
                    `AddTrackProperties to session (${
                        this.sessionData.sessionID
                    }, source: ${sourceString}) w/ obj: ${stringify(
                        properties_obj
                    )} @ ${publicGraphURI}`
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

    async initialize() {
        if (
            navigator?.webdriver ||
            navigator?.userAgent?.includes('Googlebot') ||
            navigator?.userAgent?.includes('AdsBot')
        ) {
            this._firstLoadListeners?.stopListening();
            return;
        }
        try {
            if (this.feedbackWidgetOptions.enabled) {
                const {
                    onToggleFeedbackFormVisibility,
                } = initializeFeedbackWidget(this.feedbackWidgetOptions);
                this._onToggleFeedbackFormVisibility = onToggleFeedbackFormVisibility;
            }
            let storedSessionData = getPreviousSessionData();
            let reloaded = false;

            const recordingStartTime = window.sessionStorage.getItem(
                SESSION_STORAGE_KEYS.RECORDING_START_TIME
            );
            if (!recordingStartTime) {
                this._recordingStartTime = new Date().getTime();
                window.sessionStorage.setItem(
                    SESSION_STORAGE_KEYS.RECORDING_START_TIME,
                    this._recordingStartTime.toString()
                );
            } else {
                this._recordingStartTime = parseInt(recordingStartTime, 10);
            }

            if (!this._firstLoadListeners.isListening()) {
                this._firstLoadListeners.startListening();
            }

            if (!this._firstLoadListeners.hasNetworkRecording) {
                FirstLoadListeners.setupNetworkListener(
                    this._firstLoadListeners,
                    this.options
                );
            }

            let clientID = window.localStorage.getItem(
                LOCAL_STORAGE_KEYS['CLIENT_ID']
            );

            if (!clientID) {
                clientID = GenerateSecureID();
                window.localStorage.setItem(
                    LOCAL_STORAGE_KEYS['CLIENT_ID'],
                    clientID
                );
            }

            // To handle the 'Duplicate Tab' function, remove id from storage until page unload
            window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.SESSION_DATA);
            if (storedSessionData) {
                this.sessionData = storedSessionData;
                // set the session storage secure id in the options in case anything refers to that
                this.options.sessionSecureID = this.sessionData.sessionSecureID;
                reloaded = true;
            } else {
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
                            ._firstLoadListeners.enableRecordingNetworkContents,
                        clientVersion: packageJson['version'],
                        firstloadVersion: this.firstloadVersion,
                        clientConfig: JSON.stringify(this._optionsInternal),
                        environment: this.environment,
                        id: fingerprint.toString(),
                        appVersion: this.appVersion,
                        session_secure_id: this.options.sessionSecureID,
                        client_id: clientID,
                    });
                    this.sessionData.sessionID = parseInt(
                        gr?.initializeSession?.id || '0'
                    );
                    if (!this.sessionData.sessionID) {
                        this.logger.log(`Highlight Session Initialization got
  session ID ${this.sessionData.sessionID} as response: ${JSON.stringify(gr)}.
                        `);
                    }
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
  Remote: ${publicGraphURI}
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
                        this.graphqlSDK.pushMetrics({
                            metrics: [
                                {
                                    name: 'DeviceMemory',
                                    value: deviceDetails.deviceMemory,
                                    session_secure_id: this.sessionData
                                        .sessionSecureID,
                                    category: 'Device',
                                    group: window.location.href,
                                    timestamp: new Date().toISOString(),
                                },
                            ],
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
            setTimeout(() => {
                const recordStop = record({
                    ignoreClass: 'highlight-ignore',
                    blockClass: 'highlight-block',
                    emit,
                    enableStrictPrivacy: this.enableStrictPrivacy,
                    maskAllInputs: this.enableStrictPrivacy,
                    recordCanvas: this.enableCanvasRecording,
                    sampling: this.samplingStrategy,
                    keepIframeSrcFn: (_src) => {
                        return true;
                    },
                    inlineImages: this.inlineImages,
                    inlineStylesheet: this.inlineStylesheet,
                    plugins: [getRecordSequentialIdPlugin()],
                });
                if (recordStop) {
                    this.listeners.push(recordStop);
                }
                this.addCustomEvent('Viewport', {
                    height: window.innerHeight,
                    width: window.innerWidth,
                });
            }, 2000);

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
                    this.addCustomEvent<string>('Referrer', document.referrer);
                    highlightThis.addProperties(
                        { referrer: document.referrer },
                        { type: 'session' }
                    );
                }
            }
            this.listeners.push(
                PathListener((url: string) => {
                    if (reloaded) {
                        this.addCustomEvent<string>('Reload', url);
                        reloaded = false;
                        highlightThis.addProperties(
                            { reload: true },
                            { type: 'session' }
                        );
                    } else {
                        this.addCustomEvent<string>('Navigate', url);
                    }
                    highlightThis.addProperties(
                        { 'visited-url': url },
                        { type: 'session' }
                    );
                })
            );

            this.listeners.push(
                ViewportResizeListener((viewport) => {
                    this.addCustomEvent('Viewport', viewport);
                })
            );
            this.listeners.push(
                PageVisibilityListener((isTabHidden) => {
                    this.addCustomEvent('TabHidden', isTabHidden);
                })
            );
            this.listeners.push(
                ClickListener((clickTarget, event) => {
                    if (clickTarget) {
                        this.addCustomEvent('Click', clickTarget);
                    }
                    let selector = null;
                    let textContent = null;
                    if (event && event.target) {
                        const t = event.target as HTMLElement;
                        selector = getSimpleSelector(t);
                        textContent = t.textContent;
                        // avoid sending huge strings here
                        if (textContent && textContent.length > 2000) {
                            textContent = textContent.substring(0, 2000);
                        }
                    }
                    highlightThis.addProperties(
                        {
                            clickTextContent: textContent,
                            clickSelector: selector,
                        },
                        { type: 'session' }
                    );
                })
            );
            this.listeners.push(
                FocusListener((focusTarget) => {
                    if (focusTarget) {
                        this.addCustomEvent('Focus', focusTarget);
                    }
                })
            );

            this.listeners.push(
                WebVitalsListener((data) => {
                    const { name, value } = data;
                    try {
                        this.graphqlSDK.pushMetrics({
                            metrics: [
                                {
                                    name,
                                    value,
                                    session_secure_id: this.sessionData
                                        .sessionSecureID,
                                    category: 'WebVital',
                                    group: window.location.href,
                                    timestamp: new Date().toISOString(),
                                },
                            ],
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

            this.listeners.push(
                PerformanceListener((payload: PerformancePayload) => {
                    this.addCustomEvent('Performance', stringify(payload));
                }, this._recordingStartTime)
            );

            // Send the payload every time the page is no longer visible - this includes when the tab is closed, as well
            // as when switching tabs or apps on mobile. Non-blocking.
            document.addEventListener('visibilitychange', () => {
                if (
                    document.visibilityState === 'hidden' &&
                    'sendBeacon' in navigator
                ) {
                    this._sendPayload({
                        isBeacon: true,
                        sendFn: (payload) => {
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
                            return Promise.resolve(0);
                        },
                    });
                }
            });

            // Clear the timer so it doesn't block the next page navigation.
            window.addEventListener('beforeunload', () => {
                this.hasSessionUnloaded = true;
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
            this.addCustomEvent('Page Unload', '');
            window.sessionStorage.setItem(
                SESSION_STORAGE_KEYS.SESSION_DATA,
                JSON.stringify(this.sessionData)
            );
        });

        // beforeunload is not supported on iOS on Safari. Apple docs recommend using `pagehide` instead.
        const isOnIOS =
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPhone/i);
        if (isOnIOS) {
            window.addEventListener('pagehide', () => {
                this.addCustomEvent('Page Unload', '');
                window.sessionStorage.setItem(
                    SESSION_STORAGE_KEYS.SESSION_DATA,
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
            this.addCustomEvent(
                'Stop',
                'H.stop() was called which stops Highlight from recording.'
            );
        }
        this.state = 'NotRecording';
        this.listeners.forEach((stop: listenerHandler) => stop());
        this.listeners = [];
        this._firstLoadListeners.stopListening();
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
                await this._sendPayload({
                    isBeacon: false,
                    sendFn: (payload) =>
                        this.graphqlSDK
                            .PushPayload(payload)
                            .then((res) => res.pushPayload ?? 0),
                });
                this.hasPushedData = true;
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
                    await this._reset();
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

    /**
     * This proxy should be used instead of rrweb's native addCustomEvent.
     * The proxy makes sure recording has started before emitting a custom event.
     */
    addCustomEvent<T>(tag: string, payload: T): void {
        if (this.state === 'NotRecording') {
            let intervalId: ReturnType<typeof setInterval>;
            const worker = () => {
                clearInterval(intervalId);
                if (this.state === 'Recording' && this.events.length > 0) {
                    rrwebAddCustomEvent(tag, payload);
                } else {
                    intervalId = setTimeout(worker, 500);
                }
            };
            intervalId = setTimeout(worker, 500);
        } else if (
            this.state === 'Recording' &&
            (this.events.length > 0 || this.hasPushedData)
        ) {
            rrwebAddCustomEvent(tag, payload);
        }
    }

    async _sendPayload({
        isBeacon,
        sendFn,
    }: {
        isBeacon: boolean;
        sendFn: (payload: PushPayloadMutationVariables) => Promise<number>;
    }): Promise<void> {
        const resources = FirstLoadListeners.getRecordedNetworkResources(
            this._firstLoadListeners,
            this._recordingStartTime
        );
        const events = [...this.events];
        const messages = [...this._firstLoadListeners.messages];
        const errors = [...this._firstLoadListeners.errors];

        this.logger.log(
            `Sending: ${events.length} events, ${messages.length} messages, ${resources.length} network resources, ${errors.length} errors \nTo: ${this._backendUrl}\nOrg: ${this.organizationID}\nSessionID: ${this.sessionData.sessionID}`
        );

        const resourcesString = JSON.stringify({ resources: resources });
        const messagesString = stringify({ messages: messages });
        let payload: PushPayloadMutationVariables = {
            session_id: this.sessionData.sessionID.toString(),
            events: { events } as ReplayEventsInput,
            messages: messagesString,
            resources: resourcesString,
            errors,
            is_beacon: isBeacon,
            has_session_unloaded: this.hasSessionUnloaded,
            payload_id: this._payloadId.toString(),
        };

        if (!isBeacon) {
            this._payloadId++;
            window.sessionStorage.setItem(
                SESSION_STORAGE_KEYS.PAYLOAD_ID,
                this._payloadId.toString()
            );
        }

        const highlightLogs = getHighlightLogs();
        if (highlightLogs) {
            payload.highlight_logs = highlightLogs;
        }

        const eventsSize = await sendFn(payload);

        // If sendFn throws an exception, the data below will not be cleared, and it will be re-uploaded on the next PushPayload.
        // SendBeacon is not guaranteed to succeed, so we will treat it the same way.
        if (!isBeacon) {
            FirstLoadListeners.clearRecordedNetworkResources(
                this._firstLoadListeners
            );
            // We are creating a weak copy of the events. rrweb could have pushed more events to this.events while we send the request with the events as a payload.
            // Originally, we would clear this.events but this could lead to a race condition.
            // Example Scenario:
            // 1. Create the events payload from this.events (with N events)
            // 2. rrweb pushes to this.events (with M events)
            // 3. Network request made to push payload (Only includes N events)
            // 4. this.events is cleared (we lose M events)
            this.events = this.events.slice(events.length);

            this._eventBytesSinceSnapshot =
                this._eventBytesSinceSnapshot + eventsSize;
            const now = new Date().getTime();
            // After MIN_SNAPSHOT_BYTES and MIN_SNAPSHOT_TIME have passed,
            // take a full snapshot and reset the counters
            if (
                this._eventBytesSinceSnapshot >= MIN_SNAPSHOT_BYTES &&
                now - this._lastSnapshotTime >= MIN_SNAPSHOT_TIME
            ) {
                record.takeFullSnapshot();
                this._eventBytesSinceSnapshot = 0;
                this._lastSnapshotTime = now;
            }

            this._firstLoadListeners.messages = this._firstLoadListeners.messages.slice(
                messages.length
            );
            this._firstLoadListeners.errors = this._firstLoadListeners.errors.slice(
                errors.length
            );
            clearHighlightLogs(highlightLogs);
        }
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
