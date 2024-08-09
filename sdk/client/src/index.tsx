import { addCustomEvent as rrwebAddCustomEvent, record } from 'rrweb'
import { getRecordSequentialIdPlugin } from '@rrweb/rrweb-plugin-sequential-id-record'
import { eventWithTime, listenerHandler } from '@rrweb/types'
import { FirstLoadListeners } from './listeners/first-load-listeners'
import {
	AmplitudeIntegrationOptions,
	ConsoleMethods,
	DebugOptions,
	MetricCategory,
	MetricName,
	MixpanelIntegrationOptions,
	NetworkRecordingOptions,
	SessionShortcutOptions,
} from './types/client'
import {
	HighlightOptions,
	HighlightPublicInterface,
	Integration,
	Metadata,
	Metric,
	PrivacySettingOption,
	SamplingStrategy,
	SessionDetails,
	StartOptions,
} from './types/types'
import { PathListener } from './listeners/path-listener'
import { GraphQLClient } from 'graphql-request'
import ErrorStackParser from 'error-stack-parser'
import {
	getSdk,
	PushPayloadDocument,
	PushPayloadMutationVariables,
	Sdk,
} from './graph/generated/operations'
import stringify from 'json-stringify-safe'
import { print } from 'graphql'
import { determineMaskInputOptions } from './utils/privacy'

import {
	ViewportResizeListener,
	type ViewportResizeListenerArgs,
} from './listeners/viewport-resize-listener'
import { SegmentIntegrationListener } from './listeners/segment-integration-listener'
import { ClickListener } from './listeners/click-listener/click-listener'
import { FocusListener } from './listeners/focus-listener/focus-listener'
import { SESSION_STORAGE_KEYS } from './utils/sessionStorage/sessionStorageKeys'
import SessionShortcutListener from './listeners/session-shortcut/session-shortcut-listener'
import { WebVitalsListener } from './listeners/web-vitals-listener/web-vitals-listener'
import { getPerformanceMethods } from './utils/performance/performance'
import {
	PerformanceListener,
	PerformancePayload,
} from './listeners/performance-listener/performance-listener'
import { PageVisibilityListener } from './listeners/page-visibility-listener'
import { clearHighlightLogs, getHighlightLogs } from './utils/highlight-logging'
import { GenerateSecureID } from './utils/secure-id'
import { getSimpleSelector } from './utils/dom'
import {
	getPreviousSessionData,
	SessionData,
	setSessionData,
	setSessionSecureID,
} from './utils/sessionStorage/highlightSession'
import type { HighlightClientRequestWorker } from './workers/highlight-client-worker'
import HighlightClientWorker from './workers/highlight-client-worker?worker&inline'
import { getGraphQLRequestWrapper } from './utils/graph'
import { ReplayEventsInput } from './graph/generated/schemas'
import { MessageType, PropertyType, Source } from './workers/types'
import { Logger } from './logger'
import { HighlightFetchWindow } from './listeners/network-listener/utils/fetch-listener'
import { ConsoleMessage, ErrorMessageType } from './types/shared-types'
import { RequestResponsePair } from './listeners/network-listener/utils/models'
import {
	JankListener,
	JankPayload,
} from './listeners/jank-listener/jank-listener'
import {
	HighlightIframeMessage,
	HighlightIframeReponse,
	IFRAME_PARENT_READY,
	IFRAME_PARENT_RESPONSE,
} from './types/iframe'
import { getItem, removeItem, setItem, setStorageMode } from './utils/storage'
import {
	FIRST_SEND_FREQUENCY,
	HIGHLIGHT_URL,
	MAX_SESSION_LENGTH,
	SEND_FREQUENCY,
	SNAPSHOT_SETTINGS,
	VISIBILITY_DEBOUNCE_MS,
} from './constants/sessions'
import { getDefaultDataURLOptions } from './utils/utils'

export const HighlightWarning = (context: string, msg: any) => {
	console.warn(`Highlight Warning: (${context}): `, { output: msg })
}

enum LOCAL_STORAGE_KEYS {
	CLIENT_ID = 'highlightClientID',
}

export type HighlightClassOptions = {
	organizationID: number | string
	debug?: boolean | DebugOptions
	backendUrl?: string
	tracingOrigins?: boolean | (string | RegExp)[]
	disableNetworkRecording?: boolean
	networkRecording?: boolean | NetworkRecordingOptions
	disableBackgroundRecording?: boolean
	disableConsoleRecording?: boolean
	disableSessionRecording?: boolean
	reportConsoleErrors?: boolean
	consoleMethodsToRecord?: ConsoleMethods[]
	privacySetting?: PrivacySettingOption
	enableSegmentIntegration?: boolean
	enableCanvasRecording?: boolean
	enablePerformanceRecording?: boolean
	enablePromisePatch?: boolean
	samplingStrategy?: SamplingStrategy
	inlineImages?: boolean
	inlineStylesheet?: boolean
	recordCrossOriginIframe?: boolean
	firstloadVersion?: string
	environment?: 'development' | 'production' | 'staging' | string
	appVersion?: string
	serviceName?: string
	sessionShortcut?: SessionShortcutOptions
	sessionSecureID: string // Introduced in firstLoad 3.0.1
	storageMode?: 'sessionStorage' | 'localStorage'
	sendMode?: 'webworker' | 'local'
	enableOtelTracing?: HighlightOptions['enableOtelTracing']
	otlpEndpoint?: HighlightOptions['otlpEndpoint']
}

/**
 * Subset of HighlightClassOptions that is stored with the session. These fields are stored for debugging purposes.
 */
type HighlightClassOptionsInternal = Omit<
	HighlightClassOptions,
	'firstloadVersion'
>

export class Highlight {
	options!: HighlightClassOptions
	/** Determines if the client is running on a Highlight property (e.g. frontend). */
	isRunningOnHighlight!: boolean
	/** Verbose project ID that is exposed to users. Legacy users may still be using ints. */
	organizationID!: string
	graphqlSDK!: Sdk
	events!: eventWithTime[]
	sessionData!: SessionData
	ready!: boolean
	manualStopped!: boolean
	state!: 'NotRecording' | 'Recording'
	logger!: Logger
	enableSegmentIntegration!: boolean
	privacySetting!: PrivacySettingOption
	enableCanvasRecording!: boolean
	enablePerformanceRecording!: boolean
	samplingStrategy!: SamplingStrategy
	inlineImages!: boolean
	inlineStylesheet!: boolean
	debugOptions!: DebugOptions
	listeners!: listenerHandler[]
	firstloadVersion!: string
	environment!: string
	sessionShortcut!: SessionShortcutOptions
	/** The end-user's app version. This isn't Highlight's version. */
	appVersion!: string | undefined
	serviceName!: string
	_worker!: HighlightClientRequestWorker
	_optionsInternal!: HighlightClassOptionsInternal
	_backendUrl!: string
	_recordingStartTime!: number
	_isOnLocalHost!: boolean
	_onToggleFeedbackFormVisibility!: () => void
	_firstLoadListeners!: FirstLoadListeners
	_isCrossOriginIframe!: boolean
	_eventBytesSinceSnapshot!: number
	_lastSnapshotTime!: number
	_lastVisibilityChangeTime!: number
	pushPayloadTimerId!: ReturnType<typeof setTimeout> | undefined
	hasSessionUnloaded!: boolean
	hasPushedData!: boolean
	reloaded!: boolean
	_hasPreviouslyInitialized!: boolean
	_recordStop!: listenerHandler | undefined

	static create(options: HighlightClassOptions): Highlight {
		return new Highlight(options)
	}

	constructor(
		options: HighlightClassOptions,
		firstLoadListeners?: FirstLoadListeners,
	) {
		if (!options.sessionSecureID) {
			// Firstload versions before 3.0.1 did not have this property
			options.sessionSecureID = GenerateSecureID()
		}
		this.options = options
		if (typeof this.options?.debug === 'boolean') {
			this.debugOptions = this.options.debug
				? { clientInteractions: true }
				: {}
		} else {
			this.debugOptions = this.options?.debug ?? {}
		}
		this.logger = new Logger(this.debugOptions.clientInteractions)
		if (options.storageMode) {
			this.logger.log(
				`initializing in ${options.storageMode} session mode`,
			)
			setStorageMode(options.storageMode)
		}

		this._worker =
			new HighlightClientWorker() as HighlightClientRequestWorker
		this._worker.onmessage = (e) => {
			if (e.data.response?.type === MessageType.AsyncEvents) {
				this._eventBytesSinceSnapshot += e.data.response.eventsSize
				this.logger.log(
					`Web worker sent payloadID ${e.data.response.id} size ${
						e.data.response.eventsSize
					} bytes, compression ratio ${
						e.data.response.eventsSize /
						e.data.response.compressedSize
					}.
                Total since snapshot: ${(
					this._eventBytesSinceSnapshot / 1000000
				).toFixed(1)}MB`,
				)
			} else if (e.data.response?.type === MessageType.CustomEvent) {
				this.addCustomEvent(
					e.data.response.tag,
					e.data.response.payload,
				)
			} else if (e.data.response?.type === MessageType.Stop) {
				HighlightWarning(
					'Stopping recording due to worker failure',
					e.data.response,
				)
				this.stopRecording(false)
			}
		}

		let storedSessionData = getPreviousSessionData()
		this.reloaded = false
		// only fetch session data from local storage on the first `initialize` call
		if (
			!this.sessionData?.sessionSecureID &&
			storedSessionData?.sessionSecureID
		) {
			this.sessionData = storedSessionData
			this.options.sessionSecureID = storedSessionData.sessionSecureID
			this.reloaded = true
			this.logger.log(
				`Tab reloaded, continuing previous session: ${this.sessionData.sessionSecureID}`,
			)
		} else {
			// new session. we should clear any session storage data
			for (const storageKeyName of Object.values(SESSION_STORAGE_KEYS)) {
				removeItem(storageKeyName)
			}
			this.sessionData = {
				sessionSecureID: this.options.sessionSecureID,
				projectID: 0,
				payloadID: 1,
				sessionStartTime: Date.now(),
			}
		}
		// these should not be in initMembers since we want them to
		// persist across session resets
		this._hasPreviouslyInitialized = false
		// Old firstLoad versions (Feb 2022) do not pass in FirstLoadListeners, so we have to fallback to creating it
		this._firstLoadListeners =
			firstLoadListeners || new FirstLoadListeners(this.options)
		try {
			// throws if parent is cross-origin
			if (window.parent.document) {
				this._isCrossOriginIframe = false
			}
		} catch (e) {
			// if recordCrossOriginIframe is set to false, operate as if highlight is only recording the iframe as a dedicated web app.
			// this is useful if you are running highlight on your app that is used in a cross-origin iframe with no access to the parent page.
			this._isCrossOriginIframe =
				this.options.recordCrossOriginIframe ?? true
		}
		this._initMembers(this.options)
	}

	// Start a new session
	async _reset({ forceNew }: { forceNew?: boolean }) {
		if (this.pushPayloadTimerId) {
			clearTimeout(this.pushPayloadTimerId)
			this.pushPayloadTimerId = undefined
		}

		let user_identifier, user_object
		if (!forceNew) {
			try {
				user_identifier = getItem(SESSION_STORAGE_KEYS.USER_IDENTIFIER)
				const user_object_string = getItem(
					SESSION_STORAGE_KEYS.USER_OBJECT,
				)
				if (user_object_string) {
					user_object = JSON.parse(user_object_string)
				}
			} catch (err) {}
		}
		for (const storageKeyName of Object.values(SESSION_STORAGE_KEYS)) {
			removeItem(storageKeyName)
		}

		// no need to set the sessionStorage value here since firstload won't call
		// init again after a reset, and `this.initialize()` will set sessionStorage
		this.sessionData.sessionSecureID = GenerateSecureID()
		this.sessionData.sessionStartTime = Date.now()
		this.options.sessionSecureID = this.sessionData.sessionSecureID
		this.stopRecording()
		this._firstLoadListeners = new FirstLoadListeners(this.options)
		await this.initialize()
		if (user_identifier && user_object) {
			this.identify(user_identifier, user_object)
		}
	}

	_initMembers(options: HighlightClassOptions) {
		this.sessionShortcut = false
		this._recordingStartTime = 0
		this._isOnLocalHost =
			window.location.hostname === 'localhost' ||
			window.location.hostname === '127.0.0.1' ||
			window.location.hostname === ''

		this.ready = false
		this.state = 'NotRecording'
		this.manualStopped = false
		this.enableSegmentIntegration = !!options.enableSegmentIntegration
		this.privacySetting = options.privacySetting ?? 'default'
		this.enableCanvasRecording = options.enableCanvasRecording ?? false
		this.enablePerformanceRecording =
			options.enablePerformanceRecording ?? true
		// default to inlining stylesheets/images locally to help with recording accuracy
		this.inlineImages = options.inlineImages ?? this._isOnLocalHost
		this.inlineStylesheet = options.inlineStylesheet ?? true
		this.samplingStrategy = {
			canvasFactor: 0.5,
			canvasMaxSnapshotDimension: 360,
			canvasClearWebGLBuffer: true,
			dataUrlOptions: getDefaultDataURLOptions(),
			...(options.samplingStrategy ?? {
				canvas: 2,
			}),
		}
		this._backendUrl = options?.backendUrl ?? 'https://pub.highlight.io'

		// If _backendUrl is a relative URL, convert it to an absolute URL
		// so that it's usable from a web worker.
		if (this._backendUrl[0] === '/') {
			this._backendUrl = new URL(this._backendUrl, document.baseURI).href
		}

		const client = new GraphQLClient(`${this._backendUrl}`, {
			headers: {},
		})
		this.graphqlSDK = getSdk(
			client,
			getGraphQLRequestWrapper(
				this.sessionData?.sessionSecureID ||
					this.options?.sessionSecureID,
			),
		)
		this.environment = options.environment ?? 'production'
		this.appVersion = options.appVersion
		this.serviceName = options.serviceName ?? ''

		if (typeof options.organizationID === 'string') {
			this.organizationID = options.organizationID
		} else {
			this.organizationID = options.organizationID.toString()
		}
		this.isRunningOnHighlight =
			this.organizationID === '1' || this.organizationID === '1jdkoe52'
		this.firstloadVersion = options.firstloadVersion || 'unknown'
		this.sessionShortcut = options.sessionShortcut || false
		this._onToggleFeedbackFormVisibility = () => {}
		// We only want to store a subset of the options for debugging purposes. Firstload version is stored as another field so we don't need to store it here.
		const { firstloadVersion: _, ...optionsInternal } = options
		this._optionsInternal = optionsInternal
		this.listeners = []

		this.events = []
		this.hasSessionUnloaded = false
		this.hasPushedData = false

		if (window.Intercom) {
			window.Intercom('onShow', () => {
				window.Intercom('update', {
					highlightSessionURL:
						this.getCurrentSessionURLWithTimestamp(),
				})
				this.addProperties({ event: 'Intercom onShow' })
			})
		}

		this._eventBytesSinceSnapshot = 0
		this._lastSnapshotTime = new Date().getTime()
		this._lastVisibilityChangeTime = new Date().getTime()
	}

	identify(user_identifier: string, user_object = {}, source?: Source) {
		if (!user_identifier || user_identifier === '') {
			console.warn(
				`Highlight's identify() call was passed an empty identifier.`,
				{ user_identifier, user_object },
			)
			return
		}
		this.sessionData.userIdentifier = user_identifier.toString()
		this.sessionData.userObject = user_object
		setItem(
			SESSION_STORAGE_KEYS.USER_IDENTIFIER,
			user_identifier.toString(),
		)
		setItem(SESSION_STORAGE_KEYS.USER_OBJECT, JSON.stringify(user_object))
		this._worker.postMessage({
			message: {
				type: MessageType.Identify,
				userIdentifier: user_identifier,
				userObject: user_object,
				source,
			},
		})
	}

	pushCustomError(message: string, payload?: string) {
		return this.consumeCustomError(new Error(message), undefined, payload)
	}

	consumeCustomError(error: Error, message?: string, payload?: string) {
		let obj = {}
		if (payload) {
			try {
				obj = { ...JSON.parse(payload), ...obj }
			} catch (e) {}
		}
		return this.consumeError(error, {
			message,
			payload: obj,
		})
	}

	consumeError(
		error: Error,
		{
			message,
			payload,
			source,
			type,
		}: {
			message?: string
			payload?: object
			source?: string
			type?: ErrorMessageType
		},
	) {
		if (error.cause) {
			payload = { ...payload, 'exception.cause': error.cause }
		}
		let event = message ? message + ':' + error.message : error.message
		if (type === 'React.ErrorBoundary') {
			event = 'ErrorBoundary: ' + event
		}
		const res = ErrorStackParser.parse(error)
		this._firstLoadListeners.errors.push({
			event,
			type: type ?? 'custom',
			url: window.location.href,
			source: source ?? '',
			lineNumber: res[0]?.lineNumber ? res[0]?.lineNumber : 0,
			columnNumber: res[0]?.columnNumber ? res[0]?.columnNumber : 0,
			stackTrace: res,
			timestamp: new Date().toISOString(),
			payload: JSON.stringify(payload),
		})
	}

	addProperties(properties_obj = {}, typeArg?: PropertyType) {
		// Remove any properties which throw on structuredClone
		// (structuredClone is used when posting messages to the worker)
		const obj = { ...properties_obj } as any
		Object.entries(obj).forEach(([key, val]) => {
			try {
				structuredClone(val)
			} catch {
				delete obj[key]
			}
		})
		this._worker.postMessage({
			message: {
				type: MessageType.Properties,
				propertiesObject: obj,
				propertyType: typeArg,
			},
		})
	}

	async initialize(options?: StartOptions): Promise<undefined> {
		this.logger.log(
			`Initializing...`,
			options,
			this.sessionData,
			this.options,
		)

		if (
			(navigator?.webdriver && !window.Cypress) ||
			navigator?.userAgent?.includes('Googlebot') ||
			navigator?.userAgent?.includes('AdsBot')
		) {
			this._firstLoadListeners?.stopListening()
			return
		}

		try {
			if (options?.forceNew) {
				await this._reset(options)
				return
			}

			this.sessionData =
				getPreviousSessionData(this.sessionData.sessionSecureID) ??
				this.sessionData
			if (!this.sessionData?.sessionStartTime) {
				this._recordingStartTime = new Date().getTime()
				this.sessionData.sessionStartTime = this._recordingStartTime
			} else {
				this._recordingStartTime = this.sessionData?.sessionStartTime
			}
			// To handle the 'Duplicate Tab' function, remove id from storage until page unload
			setSessionSecureID('')
			setSessionData(this.sessionData)

			let clientID = getItem(LOCAL_STORAGE_KEYS['CLIENT_ID'])

			if (!clientID) {
				clientID = GenerateSecureID()
				setItem(LOCAL_STORAGE_KEYS['CLIENT_ID'], clientID)
			}

			// Duplicate of logic inside FirstLoadListeners.setupNetworkListener,
			// needed for initializeSession
			let enableNetworkRecording
			if (this.options.disableSessionRecording) {
				enableNetworkRecording = false
			} else if (this.options.disableNetworkRecording !== undefined) {
				enableNetworkRecording = false
			} else if (typeof this.options.networkRecording === 'boolean') {
				enableNetworkRecording = false
			} else {
				enableNetworkRecording =
					this.options.networkRecording?.recordHeadersAndBody || false
			}

			let destinationDomains: string[] = []
			if (
				typeof this.options.networkRecording === 'object' &&
				this.options.networkRecording.destinationDomains?.length
			) {
				destinationDomains =
					this.options.networkRecording.destinationDomains
			}
			if (this._isCrossOriginIframe) {
				// wait for 'cross-origin iframe ready' message
				await this._setupCrossOriginIframe()
			} else {
				const gr = await this.graphqlSDK.initializeSession({
					organization_verbose_id: this.organizationID,
					enable_strict_privacy: this.privacySetting === 'strict',
					privacy_setting: this.privacySetting,
					enable_recording_network_contents: enableNetworkRecording,
					clientVersion: this.firstloadVersion,
					firstloadVersion: this.firstloadVersion,
					clientConfig: JSON.stringify(this._optionsInternal),
					environment: this.environment,
					id: clientID,
					appVersion: this.appVersion,
					serviceName: this.serviceName,
					session_secure_id: this.sessionData.sessionSecureID,
					client_id: clientID,
					network_recording_domains: destinationDomains,
					disable_session_recording:
						this.options.disableSessionRecording,
				})
				if (
					gr.initializeSession.secure_id !==
					this.sessionData.sessionSecureID
				) {
					this.logger.log(
						`Unexpected secure id returned by initializeSession: ${gr.initializeSession.secure_id}, ` +
							`expected ${this.sessionData.sessionSecureID}`,
					)
				}
				this.sessionData.sessionSecureID =
					gr.initializeSession.secure_id
				this.sessionData.projectID = parseInt(
					gr?.initializeSession?.project_id || '0',
				)

				if (
					!this.sessionData.projectID ||
					!this.sessionData.sessionSecureID
				) {
					console.error(
						'Failed to initialize Highlight; an error occurred on our end.',
						this.sessionData,
					)
					return
				}
			}

			this.logger.log(
				`Loaded Highlight
Remote: ${this._backendUrl}
Project ID: ${this.sessionData.projectID}
SessionSecureID: ${this.sessionData.sessionSecureID}`,
			)
			this.options.sessionSecureID = this.sessionData.sessionSecureID
			this._worker.postMessage({
				message: {
					type: MessageType.Initialize,
					sessionSecureID: this.sessionData.sessionSecureID,
					backend: this._backendUrl,
					debug: !!this.debugOptions.clientInteractions,
					recordingStartTime: this._recordingStartTime,
				},
			})

			if (this.sessionData.userIdentifier) {
				this.identify(
					this.sessionData.userIdentifier,
					this.sessionData.userObject,
				)
			}

			if (!this._firstLoadListeners.isListening()) {
				this._firstLoadListeners.startListening()
			} else if (!this._firstLoadListeners.hasNetworkRecording) {
				// for firstload versions < 3.0. even if they are listening, add network listeners
				FirstLoadListeners.setupNetworkListener(
					this._firstLoadListeners,
					this.options,
				)
			}

			if (this.pushPayloadTimerId) {
				clearTimeout(this.pushPayloadTimerId)
				this.pushPayloadTimerId = undefined
			}
			if (!this._isCrossOriginIframe) {
				this.pushPayloadTimerId = setTimeout(() => {
					this._save()
				}, FIRST_SEND_FREQUENCY)
			}

			// if disabled, do not record session events / rrweb events.
			// we still use firstload listeners to record frontend js console logs and errors.
			if (this.options.disableSessionRecording) {
				this.logger.log(
					`Highlight is NOT RECORDING a session replay per H.init setting.`,
				)
				this.ready = true
				this.state = 'Recording'
				this.manualStopped = false
				return
			}

			const { getDeviceDetails } = getPerformanceMethods()
			if (getDeviceDetails) {
				this.recordMetric([
					{
						name: MetricName.DeviceMemory,
						value: getDeviceDetails().deviceMemory,
						category: MetricCategory.Device,
						group: window.location.href,
					},
				])
			}

			const emit = (
				event: eventWithTime,
				isCheckout?: boolean | undefined,
			) => {
				if (isCheckout) {
					this.logger.log('received isCheckout emit', { event })
				}
				this.events.push(event)
			}
			emit.bind(this)

			const alreadyRecording = !!this._recordStop
			// if we were already recording, stop recording to reset rrweb state (eg. reset _sid)
			if (this._recordStop) {
				this._recordStop()
				this._recordStop = undefined
			}

			const [maskAllInputs, maskInputOptions] = determineMaskInputOptions(
				this.privacySetting,
			)

			this._recordStop = record({
				ignoreClass: 'highlight-ignore',
				blockClass: 'highlight-block',
				emit,
				recordCrossOriginIframes: this.options.recordCrossOriginIframe,
				privacySetting: this.privacySetting,
				maskAllInputs,
				maskInputOptions: maskInputOptions,
				recordCanvas: this.enableCanvasRecording,
				sampling: {
					canvas: {
						fps: this.samplingStrategy.canvas,
						fpsManual: this.samplingStrategy.canvasManualSnapshot,
						resizeFactor: this.samplingStrategy.canvasFactor,
						clearWebGLBuffer:
							this.samplingStrategy.canvasClearWebGLBuffer,
						initialSnapshotDelay:
							this.samplingStrategy.canvasInitialSnapshotDelay,
						dataURLOptions: this.samplingStrategy.dataUrlOptions,
						maxSnapshotDimension:
							this.samplingStrategy.canvasMaxSnapshotDimension,
					},
				},
				keepIframeSrcFn: (_src: string) => {
					return !this.options.recordCrossOriginIframe
				},
				inlineImages: this.inlineImages,
				collectFonts: this.inlineImages,
				inlineStylesheet: this.inlineStylesheet,
				plugins: [getRecordSequentialIdPlugin()],
				logger:
					(typeof this.options.debug === 'boolean' &&
						this.options.debug) ||
					(typeof this.options.debug === 'object' &&
						this.options.debug.domRecording)
						? {
								debug: this.logger.log,
								warn: HighlightWarning,
						  }
						: undefined,
			})

			// recordStop is not part of listeners because we do not actually want to stop rrweb
			// rrweb has some bugs that make the stop -> restart workflow broken (eg iframe listeners)
			if (!alreadyRecording) {
				if (this.options.recordCrossOriginIframe) {
					this._setupCrossOriginIframeParent()
				}
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
					this.addCustomEvent<string>('Referrer', document.referrer)
					this.addProperties(
						{ referrer: document.referrer },
						{ type: 'session' },
					)
				}
			}

			this._setupWindowListeners()
			this.ready = true
			this.state = 'Recording'
			this.manualStopped = false
		} catch (e) {
			if (this._isOnLocalHost) {
				console.error(e)
				HighlightWarning('initializeSession', e)
			}
		}
	}

	async _visibilityHandler(hidden: boolean) {
		if (this.manualStopped) {
			this.logger.log(`Ignoring visibility event due to manual stop.`)
			return
		}
		if (
			new Date().getTime() - this._lastVisibilityChangeTime <
			VISIBILITY_DEBOUNCE_MS
		) {
			return
		}
		this._lastVisibilityChangeTime = new Date().getTime()
		this.logger.log(`Detected window ${hidden ? 'hidden' : 'visible'}.`)
		if (!hidden) {
			if (this.options.disableBackgroundRecording) {
				await this.initialize()
			}
			this.addCustomEvent('TabHidden', false)
		} else {
			this.addCustomEvent('TabHidden', true)
			if (this.options.disableBackgroundRecording) {
				this.stopRecording()
			}
		}
	}

	async _setupCrossOriginIframe() {
		this.logger.log(`highlight in cross-origin iframe is waiting `)
		// wait until we get a initialization message from the parent window
		await new Promise<void>((r) => {
			const listener = (message: MessageEvent) => {
				if (message.data.highlight === IFRAME_PARENT_READY) {
					const msg = message.data as HighlightIframeMessage
					this.logger.log(`highlight got window message `, msg)
					this.sessionData.projectID = msg.projectID
					this.sessionData.sessionSecureID = msg.sessionSecureID
					// reply back that we got the message and are set up
					window.parent.postMessage(
						{
							highlight: IFRAME_PARENT_RESPONSE,
						} as HighlightIframeReponse,
						'*',
					)
					// stop listening to parent messages
					window.removeEventListener('message', listener)
					r()
				}
			}
			window.addEventListener('message', listener)
		})
	}

	_setupCrossOriginIframeParent() {
		this.logger.log(
			`highlight setting up cross origin iframe parent notification`,
		)
		// notify iframes that highlight is ready
		setInterval(() => {
			window.document.querySelectorAll('iframe').forEach((iframe) => {
				iframe.contentWindow?.postMessage(
					{
						highlight: IFRAME_PARENT_READY,
						projectID: this.sessionData.projectID,
						sessionSecureID: this.sessionData.sessionSecureID,
					} as HighlightIframeMessage,
					'*',
				)
			})
		}, FIRST_SEND_FREQUENCY)
		window.addEventListener('message', (message: MessageEvent) => {
			if (message.data.highlight === IFRAME_PARENT_RESPONSE) {
				this.logger.log(
					`highlight got response from initialized iframe`,
				)
			}
		})
	}

	_setupWindowListeners() {
		try {
			const highlightThis = this
			if (this.enableSegmentIntegration) {
				this.listeners.push(
					SegmentIntegrationListener((obj: any) => {
						if (obj.type === 'track') {
							const properties: { [key: string]: string } = {}
							properties['segment-event'] = obj.event
							highlightThis.addProperties(properties, {
								type: 'track',
								source: 'segment',
							})
						} else if (obj.type === 'identify') {
							// Removes the starting and end quotes
							// Example: "boba" -> boba
							const trimmedUserId = obj.userId.replace(
								/^"(.*)"$/,
								'$1',
							)

							highlightThis.identify(
								trimmedUserId,
								obj.traits,
								'segment',
							)
						}
					}),
				)
			}
			this.listeners.push(
				PathListener((url: string) => {
					if (this.reloaded) {
						this.addCustomEvent<string>('Reload', url)
						this.reloaded = false
						highlightThis.addProperties(
							{ reload: true },
							{ type: 'session' },
						)
					} else {
						this.addCustomEvent<string>('Navigate', url)
					}
					highlightThis.addProperties(
						{ 'visited-url': url },
						{ type: 'session' },
					)
				}),
			)

			this.listeners.push(
				ViewportResizeListener(
					(viewport: ViewportResizeListenerArgs) => {
						this.addCustomEvent('Viewport', viewport)
						this.submitViewportMetrics(viewport)
					},
				),
			)
			this.listeners.push(
				ClickListener((clickTarget, event) => {
					if (clickTarget) {
						this.addCustomEvent('Click', clickTarget)
					}
					let selector = null
					let textContent = null
					if (event && event.target) {
						const t = event.target as HTMLElement
						selector = getSimpleSelector(t)
						textContent = t.textContent
						// avoid sending huge strings here
						if (textContent && textContent.length > 2000) {
							textContent = textContent.substring(0, 2000)
						}
					}
					highlightThis.addProperties(
						{
							clickTextContent: textContent,
							clickSelector: selector,
						},
						{ type: 'session' },
					)
				}),
			)
			this.listeners.push(
				FocusListener((focusTarget) => {
					if (focusTarget) {
						this.addCustomEvent('Focus', focusTarget)
					}
				}),
			)

			this.listeners.push(
				WebVitalsListener((data) => {
					const { name, value } = data
					this.recordMetric([
						{
							name,
							value,
							group: window.location.href,
							category: MetricCategory.WebVital,
						},
					])
				}),
			)

			if (this.sessionShortcut) {
				SessionShortcutListener(this.sessionShortcut, () => {
					window.open(
						this.getCurrentSessionURLWithTimestamp(),
						'_blank',
					)
				})
			}

			if (this.enablePerformanceRecording) {
				this.listeners.push(
					PerformanceListener((payload: PerformancePayload) => {
						this.addCustomEvent('Performance', stringify(payload))
						this.recordMetric(
							Object.entries(payload)
								.map(([name, value]) =>
									value
										? {
												name,
												value,
												category:
													MetricCategory.Performance,
												group: window.location.href,
										  }
										: undefined,
								)
								.filter((m) => m) as {
								name: string
								value: any
								category: MetricCategory
								group: string
							}[],
						)
					}, this._recordingStartTime),
				)
				this.listeners.push(
					JankListener((payload: JankPayload) => {
						this.addCustomEvent('Jank', stringify(payload))
						this.recordMetric([
							{
								name: 'Jank',
								value: payload.jankAmount,
								category: MetricCategory.WebVital,
								group: payload.querySelector,
							},
						])
					}, this._recordingStartTime),
				)
			}

			// only do this once, since we want to keep the visibility listener attached even when recoding is stopped
			if (!this._hasPreviouslyInitialized) {
				// setup electron main thread window visiblity events listener
				if (window.electron?.ipcRenderer) {
					window.electron.ipcRenderer.on(
						'highlight.run',
						({ visible }: { visible: boolean }) => {
							this._visibilityHandler(!visible)
						},
					)
					this.logger.log('Set up Electron highlight.run events.')
				} else {
					// Send the payload every time the page is no longer visible - this includes when the tab is closed, as well
					// as when switching tabs or apps on mobile. Non-blocking.
					PageVisibilityListener((isTabHidden) =>
						this._visibilityHandler(isTabHidden),
					)
					this.logger.log('Set up document visibility listener.')
				}
				this._hasPreviouslyInitialized = true
			}

			// Clear the timer so it doesn't block the next page navigation.
			const unloadListener = () => {
				this.hasSessionUnloaded = true
				if (this.pushPayloadTimerId) {
					clearTimeout(this.pushPayloadTimerId)
					this.pushPayloadTimerId = undefined
				}
			}
			window.addEventListener('beforeunload', unloadListener)
			this.listeners.push(() =>
				window.removeEventListener('beforeunload', unloadListener),
			)
		} catch (e) {
			if (this._isOnLocalHost) {
				console.error(e)
				HighlightWarning('initializeSession _setupWindowListeners', e)
			}
		}

		const unloadListener = () => {
			this.addCustomEvent('Page Unload', '')
			setSessionSecureID(this.sessionData.sessionSecureID)
			setSessionData(this.sessionData)
		}
		window.addEventListener('beforeunload', unloadListener)
		this.listeners.push(() =>
			window.removeEventListener('beforeunload', unloadListener),
		)

		// beforeunload is not supported on iOS on Safari. Apple docs recommend using `pagehide` instead.
		const isOnIOS =
			navigator.userAgent.match(/iPad/i) ||
			navigator.userAgent.match(/iPhone/i)
		if (isOnIOS) {
			const unloadListener = () => {
				this.addCustomEvent('Page Unload', '')
				setSessionSecureID(this.sessionData.sessionSecureID)
				setSessionData(this.sessionData)
			}
			window.addEventListener('pagehide', unloadListener)
			this.listeners.push(() =>
				window.removeEventListener('beforeunload', unloadListener),
			)
		}
	}

	submitViewportMetrics({
		height,
		width,
		availHeight,
		availWidth,
	}: ViewportResizeListenerArgs) {
		this.recordMetric([
			{
				name: MetricName.ViewportHeight,
				value: height,
				category: MetricCategory.Device,
				group: window.location.href,
			},
			{
				name: MetricName.ViewportWidth,
				value: width,
				category: MetricCategory.Device,
				group: window.location.href,
			},
			{
				name: MetricName.ScreenHeight,
				value: availHeight,
				category: MetricCategory.Device,
				group: window.location.href,
			},
			{
				name: MetricName.ScreenWidth,
				value: availWidth,
				category: MetricCategory.Device,
				group: window.location.href,
			},
			{
				name: MetricName.ViewportArea,
				value: height * width,
				category: MetricCategory.Device,
				group: window.location.href,
			},
		])
	}

	recordMetric(
		metrics: {
			name: string
			value: number
			category?: MetricCategory
			group?: string
			tags?: { name: string; value: string }[]
		}[],
	) {
		this._worker.postMessage({
			message: {
				type: MessageType.Metrics,
				metrics: metrics.map((m) => ({
					...m,
					tags: m.tags || [],
					group: m.group || window.location.href,
					category: m.category || MetricCategory.Frontend,
					timestamp: new Date(),
				})),
			},
		})
	}

	/**
	 * Stops Highlight from recording.
	 * @param manual The end user requested to stop recording.
	 */
	stopRecording(manual?: boolean) {
		this.manualStopped = !!manual
		if (this.manualStopped) {
			this.addCustomEvent(
				'Stop',
				'H.stop() was called which stops Highlight from recording.',
			)
		}
		this.state = 'NotRecording'
		// stop rrweb recording mutation observers
		if (manual && this._recordStop) {
			this._recordStop()
			this._recordStop = undefined
		}
		// stop all other event listeners, to be restarted on initialize()
		this.listeners.forEach((stop) => stop())
		this.listeners = []
	}

	getCurrentSessionTimestamp() {
		return this._recordingStartTime
	}

	/**
	 * Returns the current timestamp for the current session.
	 */
	getCurrentSessionURLWithTimestamp() {
		const now = new Date().getTime()
		const { projectID, sessionSecureID } = this.sessionData
		const relativeTimestamp = (now - this._recordingStartTime) / 1000
		return `https://${HIGHLIGHT_URL}/${projectID}/sessions/${sessionSecureID}?ts=${relativeTimestamp}`
	}

	getCurrentSessionURL() {
		const projectID = this.sessionData.projectID
		const sessionSecureID = this.sessionData.sessionSecureID
		if (projectID && sessionSecureID) {
			return `https://${HIGHLIGHT_URL}/${projectID}/sessions/${sessionSecureID}`
		}
		return null
	}

	async snapshot(element: HTMLCanvasElement) {
		await record.snapshotCanvas(element)
	}

	addSessionFeedback({
		timestamp,
		verbatim,
		user_email,
		user_name,
	}: {
		verbatim: string
		timestamp: string
		user_name?: string
		user_email?: string
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
		})
	}

	// Reset the events array and push to a backend.
	async _save() {
		try {
			if (
				this.state === 'Recording' &&
				this.listeners &&
				this.sessionData.sessionStartTime &&
				Date.now() - this.sessionData.sessionStartTime >
					MAX_SESSION_LENGTH
			) {
				this.logger.log(`Resetting session`, {
					start: this.sessionData.sessionStartTime,
				})
				await this._reset({})
			}
			let sendFn = undefined
			if (this.options?.sendMode === 'local') {
				sendFn = async (payload: any) => {
					let blob = new Blob(
						[
							JSON.stringify({
								query: print(PushPayloadDocument),
								variables: payload,
							}),
						],
						{
							type: 'application/json',
						},
					)
					await window.fetch(`${this._backendUrl}`, {
						method: 'POST',
						body: blob,
					})
					return 0
				}
			}
			await this._sendPayload({ sendFn })
			this.hasPushedData = true
			this.sessionData.lastPushTime = Date.now()
			setSessionData(this.sessionData)
		} catch (e) {
			if (this._isOnLocalHost) {
				console.error(e)
				HighlightWarning('_save', e)
			}
		}
		if (this.state === 'Recording') {
			if (this.pushPayloadTimerId) {
				clearTimeout(this.pushPayloadTimerId)
				this.pushPayloadTimerId = undefined
			}
			this.pushPayloadTimerId = setTimeout(() => {
				this._save()
			}, SEND_FREQUENCY)
		}
	}

	/**
	 * This proxy should be used instead of rrweb's native addCustomEvent.
	 * The proxy makes sure recording has started before emitting a custom event.
	 */
	addCustomEvent<T>(tag: string, payload: T): void {
		if (this.state === 'NotRecording') {
			let intervalId: ReturnType<typeof setInterval>
			const worker = () => {
				clearInterval(intervalId)
				if (this.state === 'Recording' && this.events.length > 0) {
					rrwebAddCustomEvent(tag, payload)
				} else {
					intervalId = setTimeout(worker, 500)
				}
			}
			intervalId = setTimeout(worker, 500)
		} else if (
			this.state === 'Recording' &&
			(this.events.length > 0 || this.hasPushedData)
		) {
			rrwebAddCustomEvent(tag, payload)
		}
	}

	async _sendPayload({
		sendFn,
	}: {
		sendFn?: (payload: PushPayloadMutationVariables) => Promise<number>
	}) {
		const resources = FirstLoadListeners.getRecordedNetworkResources(
			this._firstLoadListeners,
			this._recordingStartTime,
		)
		const webSocketEvents = FirstLoadListeners.getRecordedWebSocketEvents(
			this._firstLoadListeners,
		)
		const events = [...this.events]
		const messages = [...this._firstLoadListeners.messages]
		const errors = [...this._firstLoadListeners.errors]

		// if it is time to take a full snapshot,
		// ensure the snapshot is at the beginning of the next payload
		// After snapshot thresholds have been met,
		// take a full snapshot and reset the counters
		const { bytes, time } = this.enableCanvasRecording
			? SNAPSHOT_SETTINGS.canvas
			: SNAPSHOT_SETTINGS.normal
		if (
			this._eventBytesSinceSnapshot >= bytes &&
			new Date().getTime() - this._lastSnapshotTime >= time
		) {
			this.takeFullSnapshot()
		}

		this.logger.log(
			`Sending: ${events.length} events, ${messages.length} messages, ${resources.length} network resources, ${errors.length} errors \nTo: ${this._backendUrl}\nOrg: ${this.organizationID}\nSessionSecureID: ${this.sessionData.sessionSecureID}`,
		)
		const highlightLogs = getHighlightLogs()
		if (sendFn) {
			await sendFn({
				session_secure_id: this.sessionData.sessionSecureID,
				payload_id: this.sessionData.payloadID.toString(),
				events: { events } as ReplayEventsInput,
				messages: stringify({ messages: messages }),
				resources: JSON.stringify({ resources: resources }),
				web_socket_events: JSON.stringify({
					webSocketEvents: webSocketEvents,
				}),
				errors,
				is_beacon: false,
				has_session_unloaded: this.hasSessionUnloaded,
			})
		} else {
			this._worker.postMessage({
				message: {
					type: MessageType.AsyncEvents,
					id: this.sessionData.payloadID++,
					events,
					messages,
					errors,
					resourcesString: JSON.stringify({ resources: resources }),
					webSocketEventsString: JSON.stringify({
						webSocketEvents: webSocketEvents,
					}),
					hasSessionUnloaded: this.hasSessionUnloaded,
					highlightLogs: highlightLogs,
				},
			})
		}
		setSessionData(this.sessionData)

		// If sendFn throws an exception, the data below will not be cleared, and it will be re-uploaded on the next PushPayload.
		FirstLoadListeners.clearRecordedNetworkResources(
			this._firstLoadListeners,
		)
		// We are creating a weak copy of the events. rrweb could have pushed more events to this.events while we send the request with the events as a payload.
		// Originally, we would clear this.events but this could lead to a race condition.
		// Example Scenario:
		// 1. Create the events payload from this.events (with N events)
		// 2. rrweb pushes to this.events (with M events)
		// 3. Network request made to push payload (Only includes N events)
		// 4. this.events is cleared (we lose M events)
		this.events = this.events.slice(events.length)

		this._firstLoadListeners.messages =
			this._firstLoadListeners.messages.slice(messages.length)
		this._firstLoadListeners.errors = this._firstLoadListeners.errors.slice(
			errors.length,
		)
		clearHighlightLogs(highlightLogs)
	}

	private takeFullSnapshot() {
		this.logger.log(`taking full snapshot`, {
			bytesSinceSnapshot: this._eventBytesSinceSnapshot,
			lastSnapshotTime: this._lastSnapshotTime,
		})
		record.takeFullSnapshot(true)
		this._eventBytesSinceSnapshot = 0
		this._lastSnapshotTime = new Date().getTime()
	}
}

interface HighlightWindow extends Window {
	Highlight: Highlight
	Intercom?: any
	electron?: {
		ipcRenderer: {
			on: (channel: string, listener: (...args: any[]) => void) => {}
		}
	}
	Cypress?: any
}

declare var window: HighlightWindow

declare global {
	interface Console {
		defaultLog: any
		defaultError: any
		defaultWarn: any
		defaultDebug: any
	}
}
export {
	FirstLoadListeners,
	GenerateSecureID,
	MetricCategory,
	getPreviousSessionData,
}
export type {
	AmplitudeIntegrationOptions,
	ConsoleMessage,
	MixpanelIntegrationOptions,
	Integration,
	Metadata,
	Metric,
	HighlightFetchWindow,
	HighlightOptions,
	HighlightPublicInterface,
	RequestResponsePair,
	SessionDetails,
}
