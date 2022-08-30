import {
    addCustomEvent as rrwebAddCustomEvent,
    getRecordSequentialIdPlugin,
    record,
} from '@highlight-run/rrweb';
import {
    eventWithTime,
    listenerHandler,
} from '@highlight-run/rrweb/typings/types';
import { FirstLoadListeners } from './listeners/first-load-listeners';
import {
    ConsoleMethods,
    DebugOptions,
    FeedbackWidgetOptions,
    NetworkRecordingOptions,
    SessionShortcutOptions,
} from '../../firstload/src/types/client';
import { SamplingStrategy } from '../../firstload/src/types/types';
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
import FingerprintJS, { Agent } from '@highlight-run/fingerprintjs';
import {
    PerformanceListener,
    PerformancePayload,
} from './listeners/performance-listener/performance-listener';
import { PageVisibilityListener } from './listeners/page-visibility-listener';
import {
    clearHighlightLogs,
    getHighlightLogs,
} from './utils/highlight-logging';
import { GenerateSecureID } from './utils/secure-id';
import { getSimpleSelector } from './utils/dom';
import {
    getPreviousSessionData,
    SessionData,
} from './utils/sessionStorage/highlightSession';
import type { HighlightClientRequestWorker } from './workers/highlight-client-worker';
import publicGraphURI from 'consts:publicGraphURI';
import { getGraphQLRequestWrapper } from './utils/graph';
import { ReplayEventsInput } from './graph/generated/schemas';
import { MessageType, PropertyType, Source } from './workers/types';
import { Logger } from './logger';

// silence typescript warning in firstload build since firstload imports client code
// but doesn't actually bundle the web-worker. also ensure this ends in .ts to import the code.
// @ts-ignore
import HighlightClientWorker from 'web-worker:./workers/highlight-client-worker.ts';

export const HighlightWarning = (context: string, msg: any) => {
    console.warn(`Highlight Warning: (${context}): `, { output: msg });
};

enum LOCAL_STORAGE_KEYS {
    CLIENT_ID = 'highlightClientID',
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

/**
 *  The amount of time to wait until sending the first payload.
 */
const FIRST_SEND_FREQUENCY = 1000;
/**
 * The amount of time between sending the client-side payload to Highlight backend client.
 * In milliseconds.
 */
const SEND_FREQUENCY = 1000 * 2;

/**
 * Maximum length of a session
 */
const MAX_SESSION_LENGTH = 4 * 60 * 60 * 1000;

const HIGHLIGHT_URL = 'app.highlight.run';

/*
 * Don't take another full snapshot unless it's been at least
 * 4 minutes AND the cumulative payload size since the last
 * snapshot is > 10MB.
 */
const MIN_SNAPSHOT_BYTES = 10e6;
const MIN_SNAPSHOT_TIME = 4 * 60 * 1000;

// Debounce duplicate visibility events
const VISIBILITY_DEBOUNCE_MS = 100;

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
    logger!: Logger;
    fingerprintjs!: Promise<Agent>;
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
    _worker!: HighlightClientRequestWorker;
    _optionsInternal!: HighlightClassOptionsInternal;
    _backendUrl!: string;
    _recordingStartTime!: number;
    _isOnLocalHost!: boolean;
    _onToggleFeedbackFormVisibility!: () => void;
    _firstLoadListeners!: FirstLoadListeners;
    _eventBytesSinceSnapshot!: number;
    _lastSnapshotTime!: number;
    _lastVisibilityChangeTime!: number;
    pushPayloadTimerId!: ReturnType<typeof setTimeout> | undefined;
    feedbackWidgetOptions!: FeedbackWidgetOptions;
    hasSessionUnloaded!: boolean;
    hasPushedData!: boolean;
    reloaded!: boolean;
    _hasPreviouslyInitialized!: boolean;
    _isRecordingEvents!: boolean;
    _payloadId!: number;

    static create(options: HighlightClassOptions): Highlight {
        return new Highlight(options);
    }

    constructor(
        options: HighlightClassOptions,
        firstLoadListeners?: FirstLoadListeners
    ) {
        // setup fingerprintjs as early as possible for it to run background tasks
        // exclude sources that are slow and may block DOM rendering
        this.fingerprintjs = FingerprintJS.load({
            excludeSources: [
                'fonts', // slow with lots of fonts
                'domBlockers', // causes reflow, slow
                'fontPreferences', // slow
                'audio', //slow
                'screenFrame', // causes reflow, slow
                'timezone', // slow
                'plugins', // very slow
                'canvas', // slow
            ],
        });
        if (!options.sessionSecureID) {
            // Firstload versions before 3.0.1 did not have this property
            options.sessionSecureID = GenerateSecureID();
        }
        // default to inlining stylesheets to help with recording accuracy
        options.inlineStylesheet = true;
        this.options = options;
        if (typeof this.options?.debug === 'boolean') {
            this.debugOptions = this.options.debug
                ? { clientInteractions: true }
                : {};
        } else {
            this.debugOptions = this.options?.debug ?? {};
        }
        this.logger = new Logger(this.debugOptions.clientInteractions);

        this._worker = new HighlightClientWorker() as HighlightClientRequestWorker;
        this._worker.onmessage = (e) => {
            if (e.data.response?.type === MessageType.AsyncEvents) {
                this._eventBytesSinceSnapshot += e.data.response.eventsSize;
                this.logger.log(
                    `Web worker sent payloadID ${e.data.response.id} size ${
                        e.data.response.eventsSize
                    }.
                Total since snapshot: ${
                    this._eventBytesSinceSnapshot / 1000000
                }MB`
                );
            } else if (e.data.response?.type === MessageType.CustomEvent) {
                this.addCustomEvent(
                    e.data.response.tag,
                    e.data.response.payload
                );
            }
        };

        let storedSessionData = getPreviousSessionData();
        this.reloaded = false;
        // only fetch session data from local storage on the first `initialize` call
        if (
            !this.sessionData?.sessionSecureID &&
            storedSessionData?.sessionSecureID
        ) {
            this.sessionData = storedSessionData;
            this.options.sessionSecureID = storedSessionData.sessionSecureID;
            this.reloaded = true;
            this.logger.log(
                `Tab reloaded, continuing previous session: ${this.sessionData.sessionSecureID}`
            );
        } else {
            this.sessionData = {
                sessionSecureID: this.options.sessionSecureID,
                projectID: 0,
                sessionStartTime: Date.now(),
            };
        }
        // these should not be in initMembers since we want them to
        // persist across session resets
        this._isRecordingEvents = false;
        this._hasPreviouslyInitialized = false;
        // Old firstLoad versions (Feb 2022) do not pass in FirstLoadListeners, so we have to fallback to creating it
        this._firstLoadListeners =
            firstLoadListeners || new FirstLoadListeners(this.options);
        this._initMembers(this.options);
    }

    // Start a new session
    async _reset() {
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
        this.sessionData.sessionSecureID = GenerateSecureID();
        this.options.sessionSecureID = this.sessionData.sessionSecureID;
        this.sessionData.sessionStartTime = Date.now();
        this._firstLoadListeners.stopListening();
        this._firstLoadListeners = new FirstLoadListeners(this.options);
        await this.initialize();
        if (user_identifier && user_object) {
            await this.identify(user_identifier, user_object);
        }
    }

    _initMembers(options: HighlightClassOptions) {
        this.sessionShortcut = false;
        this._recordingStartTime = 0;
        this._isOnLocalHost = false;

        this.ready = false;
        this.state = 'NotRecording';
        this.enableSegmentIntegration = !!options.enableSegmentIntegration;
        this.enableStrictPrivacy = options.enableStrictPrivacy || false;
        this.enableCanvasRecording = options.enableCanvasRecording || false;
        this.inlineImages = options.inlineImages || false;
        this.inlineStylesheet = options.inlineStylesheet || false;
        this.samplingStrategy = options.samplingStrategy || {
            canvas: 5,
            canvasQuality: 'low',
            canvasFactor: 0.5,
            canvasMaxSnapshotDimension: 960,
        };
        this._backendUrl =
            options?.backendUrl ||
            publicGraphURI ||
            'https://pub.highlight.run';
        const client = new GraphQLClient(`${this._backendUrl}`, {
            headers: {},
        });
        this.graphqlSDK = getSdk(
            client,
            getGraphQLRequestWrapper(
                this.sessionData?.sessionSecureID ||
                    this.options?.sessionSecureID
            )
        );
        this.environment = options.environment || 'production';
        this.appVersion = options.appVersion;

        if (typeof options.organizationID === 'string') {
            this.organizationID = options.organizationID;
        } else {
            this.organizationID = options.organizationID.toString();
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
        this._lastVisibilityChangeTime = new Date().getTime();
        this._payloadId =
            Number(
                window.sessionStorage.getItem(SESSION_STORAGE_KEYS.PAYLOAD_ID)
            ) ?? 1;
        window.sessionStorage.setItem(
            SESSION_STORAGE_KEYS.PAYLOAD_ID,
            this._payloadId.toString()
        );
    }

    identify(user_identifier: string, user_object = {}, source?: Source) {
        if (!user_identifier || user_identifier === '') {
            console.warn(
                `Highlight's identify() call was passed an empty identifier.`,
                { user_identifier, user_object }
            );
            return;
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
        this._worker.postMessage({
            message: {
                type: MessageType.Identify,
                userIdentifier: user_identifier,
                userObject: user_object,
                source,
            },
        });
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

    addProperties(properties_obj = {}, typeArg?: PropertyType) {
        this._worker.postMessage({
            message: {
                type: MessageType.Properties,
                propertiesObject: properties_obj,
                propertyType: typeArg,
            },
        });
    }

    async initialize(): Promise<undefined> {
        if (
            navigator?.webdriver ||
            navigator?.userAgent?.includes('Googlebot') ||
            navigator?.userAgent?.includes('AdsBot')
        ) {
            this._firstLoadListeners?.stopListening();
            return;
        }

        try {
            // disable recording for filtered projects while allowing for reloaded sessions
            if (!this.reloaded && this.organizationID === '6glrjqg9') {
                if (true || Math.random() > 0.1) {
                    this._firstLoadListeners?.stopListening();
                    return;
                }
            }

            if (this.feedbackWidgetOptions.enabled) {
                const {
                    onToggleFeedbackFormVisibility,
                } = initializeFeedbackWidget(this.feedbackWidgetOptions);
                this._onToggleFeedbackFormVisibility = onToggleFeedbackFormVisibility;
            }

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

            // Duplicate of logic inside FirstLoadListeners.setupNetworkListener,
            // needed for initializeSession
            let enableNetworkRecording;
            if (this.options.disableNetworkRecording !== undefined) {
                enableNetworkRecording = false;
            } else if (typeof this.options.networkRecording === 'boolean') {
                enableNetworkRecording = false;
            } else {
                enableNetworkRecording =
                    this.options.networkRecording?.recordHeadersAndBody ||
                    false;
            }

            const client = await this.fingerprintjs;
            const fingerprint = await client.get();
            const gr = await this.graphqlSDK.initializeSession({
                organization_verbose_id: this.organizationID,
                enable_strict_privacy: this.enableStrictPrivacy,
                enable_recording_network_contents: enableNetworkRecording,
                clientVersion: packageJson['version'],
                firstloadVersion: this.firstloadVersion,
                clientConfig: JSON.stringify(this._optionsInternal),
                environment: this.environment,
                id: fingerprint.visitorId,
                appVersion: this.appVersion,
                session_secure_id: this.sessionData.sessionSecureID,
                client_id: clientID,
            });
            if (
                gr.initializeSession.secure_id !==
                this.sessionData.sessionSecureID
            ) {
                this.logger.log(
                    `Unexpected secure id returned by initializeSession: ${gr.initializeSession.secure_id}`
                );
            }
            this.sessionData.sessionSecureID = gr.initializeSession.secure_id;
            this.sessionData.projectID = parseInt(
                gr?.initializeSession?.project_id || '0'
            );
            if (this.sessionData.userIdentifier) {
                this.identify(
                    this.sessionData.userIdentifier,
                    this.sessionData.userObject
                );
            }
            this.logger.log(
                `Loaded Highlight
Remote: ${publicGraphURI}
Project ID: ${this.sessionData.projectID}
SessionSecureID: ${this.sessionData.sessionSecureID}`
            );
            this.options.sessionSecureID = this.sessionData.sessionSecureID;
            this._worker.postMessage({
                message: {
                    type: MessageType.Initialize,
                    sessionSecureID: this.sessionData.sessionSecureID,
                    backend: this._backendUrl,
                    debug: !!this.debugOptions.clientInteractions,
                    recordingStartTime: this._recordingStartTime,
                },
            });
            window.sessionStorage.setItem(
                SESSION_STORAGE_KEYS.SESSION_SECURE_ID,
                this.sessionData.sessionSecureID
            );
            if (!this._firstLoadListeners.isListening()) {
                this._firstLoadListeners.startListening();
            }
            if (!this._firstLoadListeners.hasNetworkRecording) {
                FirstLoadListeners.setupNetworkListener(
                    this._firstLoadListeners,
                    this.options
                );
            }
            const { getDeviceDetails } = getPerformanceMethods();
            if (getDeviceDetails) {
                this._worker.postMessage({
                    message: {
                        type: MessageType.Metrics,
                        metrics: [
                            {
                                name: 'DeviceMemory',
                                value: getDeviceDetails().deviceMemory,
                                category: 'Device',
                                group: window.location.href,
                                timestamp: new Date(),
                            },
                        ],
                    },
                });
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
                // Skip if we're already recording events
                if (this._isRecordingEvents) {
                    return;
                }
                const recordStop = record({
                    ignoreClass: 'highlight-ignore',
                    blockClass: 'highlight-block',
                    emit,
                    enableStrictPrivacy: this.enableStrictPrivacy,
                    maskAllInputs: this.enableStrictPrivacy,
                    recordCanvas: this.enableCanvasRecording,
                    sampling: {
                        canvas: {
                            fps: this.samplingStrategy.canvas,
                            resizeQuality: this.samplingStrategy.canvasQuality,
                            resizeFactor: this.samplingStrategy.canvasFactor,
                            maxSnapshotDimension: this.samplingStrategy
                                .canvasMaxSnapshotDimension,
                        },
                    },
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
                this._isRecordingEvents = true;
            }, 1);

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
                    this.addProperties(
                        { referrer: document.referrer },
                        { type: 'session' }
                    );
                }
            }
        } catch (e) {
            if (this._isOnLocalHost) {
                console.error(e);
                HighlightWarning('initializeSession', e);
            }
        }
        try {
            // ensure we only create document/window listeners once
            if (this._hasPreviouslyInitialized) {
                return;
            }
            this._setupWindowListeners();
        } finally {
            this._hasPreviouslyInitialized = true;
            if (
                this.sessionData.projectID &&
                this.sessionData.sessionSecureID
            ) {
                this.ready = true;
                this.state = 'Recording';
            }
        }
    }

    async _visibilityHandler(hidden: boolean) {
        if (
            new Date().getTime() - this._lastVisibilityChangeTime <
            VISIBILITY_DEBOUNCE_MS
        ) {
            return;
        }
        this._lastVisibilityChangeTime = new Date().getTime();
        if (!hidden) {
            this.logger.log(`Detected window visible. Resuming recording.`);
            await this.initialize();
            this.addCustomEvent('TabHidden', false);
            return;
        }
        this.logger.log(`Detected window hidden. Pausing recording.`);
        this.addCustomEvent('TabHidden', true);
        if ('sendBeacon' in navigator) {
            try {
                await this._sendPayload({
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
            } catch (e) {
                if (this._isOnLocalHost) {
                    console.error(e);
                    HighlightWarning('_sendPayload', e);
                }
            }
        }
        this.stopRecording();
    }

    _setupWindowListeners() {
        try {
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
            this.listeners.push(
                PathListener((url: string) => {
                    if (this.reloaded) {
                        this.addCustomEvent<string>('Reload', url);
                        this.reloaded = false;
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
                    this._worker.postMessage({
                        message: {
                            type: MessageType.Metrics,
                            metrics: [
                                {
                                    name,
                                    value,
                                    timestamp: new Date(),
                                    group: window.location.href,
                                    category: 'WebVital',
                                },
                            ],
                        },
                    });
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
            // setup electron main thread window visiblity events listener
            if (window.electron?.ipcRenderer) {
                window.electron.ipcRenderer.on(
                    'highlight.run',
                    ({ visible }: { visible: boolean }) => {
                        this._visibilityHandler(!visible);
                    }
                );
                this.logger.log('Set up Electron highlight.run events.');
            } else {
                // Send the payload every time the page is no longer visible - this includes when the tab is closed, as well
                // as when switching tabs or apps on mobile. Non-blocking.
                PageVisibilityListener((isTabHidden) =>
                    this._visibilityHandler(isTabHidden)
                );
                this.logger.log('Set up document visibility listener.');
            }

            // Clear the timer so it doesn't block the next page navigation.
            window.addEventListener('beforeunload', () => {
                this.hasSessionUnloaded = true;
                if (this.pushPayloadTimerId) {
                    clearTimeout(this.pushPayloadTimerId);
                }
            });
        } catch (e) {
            if (this._isOnLocalHost) {
                console.error(e);
                HighlightWarning('initializeSession _setupWindowListeners', e);
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
        this._firstLoadListeners.stopListening();
        this._isRecordingEvents = false;
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
        return `https://${HIGHLIGHT_URL}/${projectID}/sessions/${sessionSecureID}?ts=${relativeTimestamp}`;
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
        this._worker.postMessage({
            message: {
                type: MessageType.Feedback,
                verbatim,
                timestamp,
                userName: user_name || this.sessionData.userIdentifier,
                userEmail:
                    user_email || (this.sessionData.userObject as any)?.name,
            },
        });
    }

    // Reset the events array and push to a backend.
    async _save() {
        try {
            await this._sendPayload({ isBeacon: false });
            this.hasPushedData = true;
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
        sendFn?: (payload: PushPayloadMutationVariables) => Promise<number>;
    }) {
        const resources = FirstLoadListeners.getRecordedNetworkResources(
            this._firstLoadListeners,
            this._recordingStartTime
        );
        const events = [...this.events];
        const messages = [...this._firstLoadListeners.messages];
        const errors = [...this._firstLoadListeners.errors];

        // if it is time to take a full snapshot,
        // ensure the snapshot is at the beginning of the next payload
        if (!isBeacon) {
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
        }

        this.logger.log(
            `Sending: ${events.length} events, ${messages.length} messages, ${resources.length} network resources, ${errors.length} errors \nTo: ${this._backendUrl}\nOrg: ${this.organizationID}\nSessionSecureID: ${this.sessionData.sessionSecureID}`
        );
        const highlightLogs = getHighlightLogs();
        if (sendFn) {
            await sendFn({
                session_secure_id: this.sessionData.sessionSecureID,
                events: { events } as ReplayEventsInput,
                messages: stringify({ messages: messages }),
                resources: JSON.stringify({ resources: resources }),
                errors,
                is_beacon: isBeacon,
                has_session_unloaded: this.hasSessionUnloaded,
                payload_id: this._payloadId.toString(),
            });
        } else {
            this._worker.postMessage({
                message: {
                    type: MessageType.AsyncEvents,
                    id: this._payloadId,
                    events,
                    messages,
                    errors,
                    resourcesString: JSON.stringify({ resources: resources }),
                    isBeacon,
                    hasSessionUnloaded: this.hasSessionUnloaded,
                    highlightLogs: highlightLogs,
                },
            });
        }
        this._payloadId++;
        window.sessionStorage.setItem(
            SESSION_STORAGE_KEYS.PAYLOAD_ID,
            this._payloadId.toString()
        );

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
    electron?: {
        ipcRenderer: {
            on: (channel: string, listener: (...args: any[]) => void) => {};
        };
    };
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
