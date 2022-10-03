import {
	ConsoleMethods,
	DebugOptions,
	FeedbackWidgetOptions,
	IntegrationOptions,
	NetworkRecordingOptions,
	SessionShortcutOptions,
} from './client'

export declare interface Metadata {
	[key: string]: string | boolean | number
}

export declare interface Metric {
	name: string
	value: number
	tags?: { name: string; value: string }[]
}

export declare type SamplingStrategy = {
	/**
	 * 'all' will record every single canvas call.
	 * a number between 1 and 60, will record an image snapshots in a web-worker a (maximum) number of times per second.
	 * Number is only supported where [`OffscreenCanvas`](http://mdn.io/offscreencanvas) is supported.
	 */
	canvas?: 'all' | number
	/**
	 * A quality at which to take canvas snapshots. See https://developer.mozilla.org/en-US/docs/Web/API/createImageBitmap
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
}

export declare type HighlightOptions = {
	/**
	 * Do not use this.
	 * @private
	 */
	debug?: boolean | DebugOptions
	/**
	 * Do not use this.
	 * @private
	 */
	scriptUrl?: string
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
	 * Specifies whether Highlight will record console messages.
	 * @default false
	 */
	disableConsoleRecording?: boolean
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
	 * Specifies whether Highlight should redact data during recording.
	 * Enabling this will disable recording of text data on the page. This is useful if you do not want to record personally identifiable information and don't want to manually annotate your code with the class name "highlight-block".
	 * @example
	 * // Text will be randomized. Instead of seeing "Hello World" in a recording, you will see "1fds1 j59a0".
	 * @see {@link https://docs.highlight.run/docs/privacy} for more information.
	 */
	enableStrictPrivacy?: boolean
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
	 * May significantly decrease recording performance.
	 * @default false
	 */
	inlineStylesheet?: boolean
	integrations?: IntegrationOptions
	/**
	 * Specifies the keyboard shortcut to open the current session in Highlight.
	 * @see {@link https://docs.highlight.run/session-shortcut} for more information.
	 */
	sessionShortcut?: SessionShortcutOptions
	/**
	 * Specifies whether to show the Highlight feedback widget. This allows users to submit feedback for their current session.
	 */
	feedbackWidget?: FeedbackWidgetOptions
}

export declare interface HighlightPublicInterface {
	init: (projectID?: string | number, debug?: HighlightOptions) => void
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
	 * Calling this method will report an error in Highlight and map it to the current session being recorded.
	 * A common use case for `H.error` is calling it right outside of an error boundary.
	 * @see {@link https://docs.highlight.run/grouping-errors} for more information.
	 */
	consumeError: (
		error: Error,
		message?: string,
		payload?: { [key: string]: string },
	) => void
	getSessionURL: () => Promise<string>
	getSessionDetails: () => Promise<SessionDetails>
	start: (options?: StartOptions) => void
	/** Stops the session and error recording. */
	stop: () => void
	onHighlightReady: (func: () => void) => void
	options: HighlightOptions | undefined
	/**
	 * Calling this will add a feedback comment to the session.
	 */
	addSessionFeedback: (feedbackOptions: SessionFeedbackOptions) => void
	/**
	 * Calling this will toggle the visibility of the feedback modal.
	 */
	toggleSessionFeedbackModal: () => void
}

export declare interface SessionDetails {
	/** The URL to view the session. */
	url: string
	/** The URL to view the session at the time getSessionDetails was called during the session recording. */
	urlWithTimestamp: string
}

export declare type Integration = (integrationOptions?: any) => void

interface SessionFeedbackOptions {
	verbatim: string
	userName?: string
	userEmail?: string
	timestampOverride?: string
}

interface StartOptions {
	/**
	 * Specifies whether console warn messages should not be created.
	 */
	silent?: boolean
}
