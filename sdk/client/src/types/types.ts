import type { Context, Span, SpanOptions } from '@opentelemetry/api'
import {
	ConsoleMethods,
	DebugOptions,
	IntegrationOptions,
	NetworkRecordingOptions,
	SessionShortcutOptions,
} from './client.js'
import { ErrorMessageType } from './shared-types'

export declare interface Metadata {
	[key: string]: string | boolean | number
}

export declare interface Metric {
	name: string
	value: number
	tags?: { name: string; value: string }[]
}

export type PrivacySettingOption = 'strict' | 'default' | 'none'

export declare type SamplingStrategy = {
	/**
	 * 'all' will record every single canvas call.
	 * a number will record an image snapshots in a web-worker a (maximum) number of times per second.
	 * Number is only supported where [`OffscreenCanvas`](http://mdn.io/offscreencanvas) is supported.
	 */
	canvas?: 'all' | number
	/**
	 * For manual usage of `H.snapshot(element) from your canvas rendering function.
	 * See https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/canvas for setup.`
	 * a number will record an image snapshots in a web-worker a (maximum) number of times per second.
	 */
	canvasManualSnapshot?: number
	/**
	 * A quality at which to take canvas snapshots. See https://developer.mozilla.org/en-US/docs/Web/API/createImageBitmap
	 * @deprecated This value is no longer used.
	 */
	canvasQuality?: 'pixelated' | 'low' | 'medium' | 'high'
	/**
	 * A multiplier resolution at which to take canvas snapshots.
	 */
	canvasFactor?: number
	/**
	 * The maximum dimension to take canvas snapshots at.
	 * This setting takes precedence over resizeFactor if the resulting image size
	 * from the resizeFactor calculation is larger than this value.
	 * Eg: set to 600 to ensure that the canvas is saved with images no larger than 600px
	 * in either dimension (while preserving the original canvas aspect ratio).
	 */
	canvasMaxSnapshotDimension?: number
	/**
	 * Default behavior for WebGL canvas elements with `preserveDrawingBuffer: false` is to clear the buffer to
	 * load the canvas into memory to avoid getting a transparent bitmap.
	 * Set to false to disable the clearing (in case there are visual glitches in the canvas).
	 */
	canvasClearWebGLBuffer?: boolean
	/**
	 * Time (in milliseconds) to wait before the initial snapshot of canvas/video elements.
	 */
	canvasInitialSnapshotDelay?: number
	/**
	 * Settings for canvas data serialization. Defaults to {"image/webp", 0.9} for browsers
	 * that support WebP and {"image/jpeg", 0.6} for others. Can be overridden to any type
	 * or quality value supported by [`toDataURL`](http://mdn.io/toDataURL).
	 */
	dataUrlOptions?: Partial<{
		type: string
		quality: number
	}>
}

export declare type HighlightOptions = {
	/**
	 * Do not use this.
	 * @private
	 */
	debug?: boolean | DebugOptions
	/**
	 * Specifies where to send Highlight session data.
	 * You should not have to set this unless you are running an on-premise instance.
	 */
	backendUrl?: string
	/**
	 * Specifies where the backend of the app lives. If specified, Highlight will attach the
	 * X-Highlight-Request header to outgoing requests whose destination URLs match a substring
	 * or regexp from this list, so that backend errors can be linked back to the session.
	 * If 'true' is specified, all requests to the current domain will be matched.
	 * @example tracingOrigins: ['localhost', /^\//, 'backend.myapp.com']
	 */
	tracingOrigins?: boolean | (string | RegExp)[]
	/**
	 * Specifies if Highlight should not automatically start recording when the app starts.
	 * This should be used with `H.start()` and `H.stop()` if you want to control when Highlight records.
	 * @default false
	 */
	manualStart?: boolean
	/**
	 * This disables recording network requests.
	 * The data includes the URLs, the size of the request, and how long the request took.
	 * @default false
	 * @deprecated Use `networkRecording` instead.
	 */
	disableNetworkRecording?: boolean
	/**
	 * Specifies how and what Highlight records from network requests and responses.
	 */
	networkRecording?: boolean | NetworkRecordingOptions
	/**
	 * If set, Highlight will not record when your app is not visible (in the background).
	 * By default, Highlight will record in the background.
	 * @default false
	 */
	disableBackgroundRecording?: boolean
	/**
	 * Specifies whether Highlight will record console messages.
	 * @default false
	 */
	disableConsoleRecording?: boolean
	/**
	 * Specifies whether Highlight will record user session replays.
	 * Unless you are using Highlight only for error monitoring, you do not want to set this to true.
	 * @default false
	 */
	disableSessionRecording?: boolean
	/**
	 * Specifies whether Highlight will report `console.error` invocations as Highlight Errors.
	 * @default false
	 */
	reportConsoleErrors?: boolean
	/**
	 * Specifies which console methods to record.
	 * The value here will be ignored if `disabledConsoleRecording` is `true`.
	 * @default All console methods.
	 * @example consoleMethodsToRecord: ['log', 'info', 'error']
	 */
	consoleMethodsToRecord?: ConsoleMethods[]
	enableSegmentIntegration?: boolean
	/**
	 * Specifies the environment your application is running in.
	 * This is useful to distinguish whether your session was recorded on localhost or in production.
	 * @default 'production'
	 */
	environment?: 'development' | 'staging' | 'production' | string
	/**
	 * Specifies the version of your application.
	 * This is commonly a Git hash or a semantic version.
	 */
	version?: string
	/**
	 * Specifies the name of your app.
	 */
	serviceName?: string
	/**
	 * Specifies how much data Highlight should redact during recording.
	 * strict - Highlight will redact all text data on the page.
	 * default - Highlight will redact text data on the page that is associated with personal identifiable data.
	 * none - Highlight will not redact any text data on the page.
	 * // Redacted text will be randomized. Instead of seeing "Hello World" in a recording, you will see "1fds1 j59a0".
	 * @see {@link https://docs.highlight.run/docs/privacy} for more information.
	 */
	privacySetting?: PrivacySettingOption

	/**
	 * Specifies whether to record canvas elements or not.
	 * @default false
	 */
	enableCanvasRecording?: boolean
	/**
	 * Specifies whether to record performance metrics (e.g. FPS, device memory).
	 * @default true
	 */
	enablePerformanceRecording?: boolean
	/**
	 * Specifies whether window.Promise should be patched
	 * to record the stack trace of promise rejections.
	 * @default true
	 */
	enablePromisePatch?: boolean
	/**
	 * Configure the recording sampling options, eg. how frequently we record canvas updates.
	 */
	samplingStrategy?: SamplingStrategy
	/**
	 * Specifies whether to inline images into the recording.
	 * This means that images that are local to the client (eg. client-generated blob: urls)
	 * will be serialized into the recording and will be valid on replay.
	 * Only enable this if you are running into issues with client-local images.
	 * @default false
	 */
	inlineImages?: boolean
	/**
	 * Specifies whether to inline stylesheets into the recording.
	 * This means that stylesheets that are local to the client (eg. client-generated blob: urls)
	 * will be serialized into the recording and will be valid on replay.
	 * Only enable this if you are running into issues with client-local stylesheets.
	 * @default true
	 */
	inlineStylesheet?: boolean
	/**
	 * Enables recording of cross-origin iframes. Should be set in both the parent window and
	 * in the cross-origin iframe.
	 * @default false
	 */
	recordCrossOriginIframe?: boolean
	/**
	 * Deprecated: this setting is now inferred automatically. Passing this option does nothing.
	 * @deprecated
	 */
	isCrossOriginIframe?: boolean
	integrations?: IntegrationOptions
	/**
	 * Specifies the keyboard shortcut to open the current session in Highlight.
	 * @see {@link https://docs.highlight.run/session-shortcut} for more information.
	 */
	sessionShortcut?: SessionShortcutOptions
	/**
	 * Set to `sessionStorage` to bypass all `window.localStorage` usage.
	 * This can help with compliance for cookie-consent regulation.
	 * Using `sessionStorage` will cause app close+reopens to start a new highlight session,
	 * as the session ID will not persist.
	 */
	storageMode?: 'sessionStorage' | 'localStorage'
	/**
	 * Set `skipCookieSessionDataLoad` to bypass retrieval
	 * of session context from server side cookies, which otherwise
	 * would continue a session started server side.
	 */
	skipCookieSessionDataLoad?: true
	/**
	 * By default, data is serialized and send by the Web Worker. Set to `local` to force
	 * sending from the main js thread. Only use `local` for custom environments where Web Workers
	 * are not available (ie. Figma plugins).
	 */
	sendMode?: 'webworker' | 'local'
	/**
	 * OTLP endpoint for OpenTelemetry tracing.
	 */
	otlpEndpoint?: string
}

export declare interface HighlightPublicInterface {
	init: (
		projectID?: string | number,
		debug?: HighlightOptions,
	) => { sessionSecureID: string } | undefined
	/**
	 * Calling this will assign an identifier to the session.
	 * @example identify('teresa@acme.com', { accountAge: 3, cohort: 8 })
	 * @param identifier Is commonly set as an email or UUID.
	 * @param metadata Additional details you want to associate to the user.
	 */
	identify: (identifier: string, metadata?: Metadata) => void
	/**
	 * Call this to record when you want to track a specific event happening in your application.
	 * @example track('startedCheckoutProcess', { cartSize: 10, value: 85 })
	 * @param event The name of the event.
	 * @param metadata Additional details you want to associate to the event.
	 */
	track: (event: string, metadata?: Metadata) => void
	/**
	 * @deprecated with replacement by `consumeError` for an in-app stacktrace.
	 */
	error: (message: string, payload?: { [key: string]: string }) => void
	/**
	 * Calling this method will report metrics to Highlight. You can graph metrics or configure
	 * alerts  on metrics that exceed a threshold.
	 * @see {@link https://docs.highlight.run/frontend-observability} for more information.
	 */
	metrics: (metrics: Metric[]) => void
	/**
	 * Starts a new span for tracing in Highlight. The span will be ended when the
	 * callback function returns.
	 *
	 * @example
	 * ```typescript
	 * H.startSpan('span-name', callbackFn)
	 * ```
	 * @example
	 * ```typescript
	 * H.startSpan('span-name', options, callbackFn)
	 * ```
	 * @example
	 * ```typescript
	 * H.startSpan('span-name', options, context, callbackFn)
	 * ```
	 * @example
	 * ```typescript
	 * H.startSpan('span-name', async (span) => {
	 *   span.setAttribute('key', 'value')
	 *   await someAsyncFunction()
	 * })
	 * ```
	 *
	 * @param name The name of the span.
	 * @param options Options for the span.
	 * @param context The context for the span.
	 * @param callbackFn The function to run in the span.
	 */
	startSpan: {
		<F extends (span?: Span) => ReturnType<F>>(
			name: string,
			fn: F,
		): ReturnType<F>
		<F extends (span?: Span) => ReturnType<F>>(
			name: string,
			options: SpanOptions,
			fn: F,
		): ReturnType<F>
		<F extends (span?: Span) => ReturnType<F>>(
			name: string,
			options: SpanOptions,
			context: Context,
			fn: F,
		): ReturnType<F>
	}
	/**
	 * Starts a new span for tracing in Highlight. The span will be ended when the
	 * `end()` is called on the span. It returns whatever is returned from the
	 * callback function.
	 *
	 * @example
	 * ```typescript
	 * H.startManualSpan('span-name', options, (span) => {
	 *   span.addEvent('event-name', { key: 'value' })
	 *   span.setAttribute('key', 'value')
	 *   await someAsyncFunction()
	 *   span.end()
	 * })
	 * ```
	 *
	 * @example
	 * ```typescript
	 * const span = H.startManualSpan('span-name', (s) => s)
	 * span.addEvent('event-name', { key: 'value' })
	 * await someAsyncFunction()
	 * span.end()
	 * ```
	 *
	 * @param name The name of the span.
	 * @param options Options for the span.
	 * @param context The context for the span.
	 * @param fn The function to run in the span.
	 */
	startManualSpan: {
		<F extends (span: Span) => ReturnType<F>>(
			name: string,
			fn: F,
		): ReturnType<F>
		<F extends (span: Span) => ReturnType<F>>(
			name: string,
			options: SpanOptions,
			fn: F,
		): ReturnType<F>
		<F extends (span: Span) => ReturnType<F>>(
			name: string,
			options: SpanOptions,
			context: Context,
			fn: F,
		): ReturnType<F>
	}
	/**
	 * Calling this method will report an error in Highlight and map it to the current session being recorded.
	 * A common use case for `H.error` is calling it right outside of an error boundary.
	 * @see {@link https://docs.highlight.run/grouping-errors} for more information.
	 */
	consumeError: (
		error: Error,
		message?: string,
		payload?: { [key: string]: string },
	) => void
	/**
	 * Calling this method will report an error in Highlight
	 * while allowing additional attributes to be sent over as metadata.
	 * @see {consumeError} for more information.
	 */
	consume: (
		error: Error,
		opts: {
			message?: string
			payload?: object
			source?: string
			type?: ErrorMessageType
		},
	) => void
	getSessionURL: () => Promise<string>
	getSessionDetails: () => Promise<SessionDetails>
	start: (options?: StartOptions) => void
	/** Stops the session and error recording. */
	stop: (options?: StartOptions) => void
	onHighlightReady: (
		func: () => void | Promise<void>,
		options?: OnHighlightReadyOptions,
	) => void
	getRecordingState: () => 'NotRecording' | 'Recording'
	options: HighlightOptions | undefined
	/**
	 * Calling this will add a feedback comment to the session.
	 */
	addSessionFeedback: (feedbackOptions: SessionFeedbackOptions) => void
	snapshot: (element: HTMLCanvasElement) => Promise<void>
}

export declare interface SessionDetails {
	/** The URL to view the session. */
	url: string
	/** The URL to view the session at the time getSessionDetails was called during the session recording. */
	urlWithTimestamp: string
	/** The secure ID of the session. */
	sessionSecureID: string
}

export declare type Integration = (integrationOptions?: any) => void

interface SessionFeedbackOptions {
	verbatim: string
	userName?: string
	userEmail?: string
	timestampOverride?: string
}

export interface StartOptions {
	/**
	 * Specifies whether console warn messages should not be created.
	 */
	silent?: boolean
	/**
	 * Starts a new recording session even if one was stopped recently.
	 */
	forceNew?: boolean
}

export interface OnHighlightReadyOptions {
	/**
	 * Specifies whether to wait for recording to start
	 */
	waitForReady?: boolean
}
