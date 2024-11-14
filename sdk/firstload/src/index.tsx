import type {
	Highlight,
	HighlightClassOptions,
} from '@highlight-run/client/src'
import type {
	HighlightOptions,
	HighlightPublicInterface,
	Metadata,
	Metric,
	OnHighlightReadyOptions,
	SessionDetails,
} from '@highlight-run/client/src/types/types.js'
import {
	type AmplitudeAPI,
	setupAmplitudeIntegration,
} from './integrations/amplitude.js'
import {
	type MixpanelAPI,
	setupMixpanelIntegration,
} from './integrations/mixpanel.js'

import { HIGHLIGHT_URL } from '@highlight-run/client/src/constants/sessions.js'
import { FirstLoadListeners } from '@highlight-run/client/src/listeners/first-load-listeners.js'
import { ErrorMessageType } from '@highlight-run/client/src/types/shared-types'
import { GenerateSecureID } from '@highlight-run/client/src/utils/secure-id.js'
import {
	getPreviousSessionData,
	loadCookieSessionData,
} from '@highlight-run/client/src/utils/sessionStorage/highlightSession.js'
import { setCookieWriteEnabled } from '@highlight-run/client/src/utils/storage'
import type { Context, Span, SpanOptions, Tracer } from '@opentelemetry/api'
import firstloadVersion from './__generated/version.js'
import { listenToChromeExtensionMessage } from './browserExtension/extensionListener.js'
import configureElectronHighlight from './environments/electron.js'
import { HighlightSegmentMiddleware } from './integrations/segment.js'
import { initializeFetchListener } from './listeners/fetch'
import { initializeWebSocketListener } from './listeners/web-socket'
import { getNoopSpan } from '@highlight-run/client/src/otel/utils.js'

enum MetricCategory {
	Device = 'Device',
	WebVital = 'WebVital',
	Frontend = 'Frontend',
	Backend = 'Backend',
}

const HighlightWarning = (context: string, msg: any) => {
	console.warn(`highlight.run warning: (${context}): `, msg)
}

interface HighlightWindow extends Window {
	HighlightIO: new (
		options: HighlightClassOptions,
		firstLoadListeners: FirstLoadListeners,
	) => Highlight
	H: HighlightPublicInterface
	mixpanel?: MixpanelAPI
	amplitude?: AmplitudeAPI
	Intercom?: any
}

const READY_WAIT_LOOP_MS = 200

declare var window: HighlightWindow

let onHighlightReadyQueue: {
	options?: OnHighlightReadyOptions
	func: () => void | Promise<void>
}[] = []
let onHighlightReadyTimeout: ReturnType<typeof setTimeout> | undefined =
	undefined

let highlight_obj: Highlight
let first_load_listeners: FirstLoadListeners
let init_called = false
type Callback = (span?: Span) => any
let getTracer: () => Tracer
const H: HighlightPublicInterface = {
	options: undefined,
	init: (projectID?: string | number, options?: HighlightOptions) => {
		try {
			H.options = options

			// Don't run init when called outside of the browser.
			if (
				typeof window === 'undefined' ||
				typeof document === 'undefined'
			) {
				return
			}

			// Don't initialize if an projectID is not set.
			if (!projectID) {
				console.info(
					'Highlight is not initializing because projectID was passed undefined.',
				)
				return
			}

			if (!options?.skipCookieSessionDataLoad) {
				loadCookieSessionData()
			} else {
				setCookieWriteEnabled(false)
			}

			let previousSession = getPreviousSessionData()
			let sessionSecureID = GenerateSecureID()
			if (previousSession?.sessionSecureID) {
				sessionSecureID = previousSession.sessionSecureID
			}

			// `init` was already called, do not reinitialize
			if (init_called) {
				return { sessionSecureID }
			}
			init_called = true

			initializeFetchListener()
			initializeWebSocketListener()
			import('@highlight-run/client/src').then(
				async ({
					Highlight,
					setupBrowserTracing,
					getTracer: otelGetTracer,
				}) => {
					setupBrowserTracing({
						otlpEndpoint:
							options?.otlpEndpoint ??
							'https://otel.highlight.io',
						projectId: projectID,
						sessionSecureId: sessionSecureID,
						environment: options?.environment ?? 'production',
						networkRecordingOptions:
							typeof options?.networkRecording === 'object'
								? options.networkRecording
								: undefined,
						tracingOrigins: options?.tracingOrigins,
						serviceName:
							options?.serviceName ?? 'highlight-browser',
					})
					getTracer = otelGetTracer

					highlight_obj = new Highlight(
						client_options,
						first_load_listeners,
					)
					initializeFetchListener()
					initializeWebSocketListener()
					if (!options?.manualStart) {
						await highlight_obj.initialize()
					}
				},
			)

			const client_options: HighlightClassOptions = {
				...options,
				organizationID: projectID,
				firstloadVersion,
				environment: options?.environment || 'production',
				appVersion: options?.version,
				sessionSecureID,
			}
			first_load_listeners = new FirstLoadListeners(client_options)
			if (!options?.manualStart) {
				// Start some of the listeners before client is loaded, then hand the
				// listeners over for client to manage
				first_load_listeners.startListening()
			}

			if (
				!options?.integrations?.mixpanel?.disabled &&
				options?.integrations?.mixpanel?.projectToken
			) {
				setupMixpanelIntegration(options.integrations.mixpanel)
			}

			if (
				!options?.integrations?.amplitude?.disabled &&
				options?.integrations?.amplitude?.apiKey
			) {
				setupAmplitudeIntegration(options.integrations.amplitude)
			}

			return { sessionSecureID }
		} catch (e) {
			HighlightWarning('init', e)
		}
	},
	snapshot: async (element: HTMLCanvasElement) => {
		try {
			if (highlight_obj && highlight_obj.ready) {
				return await highlight_obj.snapshot(element)
			}
		} catch (e) {
			HighlightWarning('snapshot', e)
		}
	},
	addSessionFeedback: ({
		verbatim,
		userName,
		userEmail,
		timestampOverride,
	}) => {
		try {
			H.onHighlightReady(() =>
				highlight_obj.addSessionFeedback({
					verbatim,
					timestamp: timestampOverride || new Date().toISOString(),
					user_email: userEmail,
					user_name: userName,
				}),
			)
		} catch (e) {
			HighlightWarning('error', e)
		}
	},
	consumeError: (
		error: Error,
		message?: string,
		payload?: { [key: string]: string },
	) => {
		try {
			H.onHighlightReady(() =>
				highlight_obj.consumeCustomError(
					error,
					message,
					JSON.stringify(payload),
				),
			)
		} catch (e) {
			HighlightWarning('error', e)
		}
	},
	consume: (
		error: Error,
		opts: {
			message?: string
			payload?: object
			source?: string
			type?: ErrorMessageType
		},
	) => {
		try {
			H.onHighlightReady(() => highlight_obj.consumeError(error, opts))
		} catch (e) {
			HighlightWarning('error', e)
		}
	},
	error: (message: string, payload?: { [key: string]: string }) => {
		try {
			H.onHighlightReady(() =>
				highlight_obj.pushCustomError(message, JSON.stringify(payload)),
			)
		} catch (e) {
			HighlightWarning('error', e)
		}
	},
	track: (event: string, metadata: Metadata = {}) => {
		try {
			H.onHighlightReady(() =>
				highlight_obj.addProperties({ ...metadata, event: event }),
			)
			const highlightUrl = highlight_obj?.getCurrentSessionURL()

			if (!H.options?.integrations?.mixpanel?.disabled) {
				if (window.mixpanel?.track) {
					window.mixpanel.track(event, {
						...metadata,
						highlightSessionURL: highlightUrl,
					})
				}
			}

			if (!H.options?.integrations?.amplitude?.disabled) {
				if (window.amplitude?.getInstance) {
					window.amplitude.getInstance().logEvent(event, {
						...metadata,
						highlightSessionURL: highlightUrl,
					})
				}
			}

			if (!H.options?.integrations?.intercom?.disabled) {
				if (window.Intercom) {
					window.Intercom('trackEvent', event, metadata)
				}
			}
		} catch (e) {
			HighlightWarning('track', e)
		}
	},
	start: (options) => {
		if (highlight_obj?.state === 'Recording' && !options?.forceNew) {
			if (!options?.silent) {
				console.warn(
					'Highlight is already recording. Please `H.stop()` the current session before starting a new one.',
				)
			}
		} else {
			first_load_listeners.startListening()
			H.onHighlightReady(
				async () => {
					await highlight_obj.initialize(options)
				},
				{ waitForReady: false },
			)
		}
	},
	stop: (options) => {
		if (highlight_obj?.state !== 'Recording') {
			if (!options?.silent) {
				console.warn(
					'Highlight is already stopped. Please call `H.start()`.',
				)
			}
		} else {
			H.onHighlightReady(() => highlight_obj.stopRecording(true))
		}
	},
	identify: (identifier: string, metadata: Metadata = {}) => {
		try {
			H.onHighlightReady(() =>
				highlight_obj.identify(identifier, metadata),
			)
		} catch (e) {
			HighlightWarning('identify', e)
		}
		if (!H.options?.integrations?.mixpanel?.disabled) {
			if (window.mixpanel?.identify) {
				window.mixpanel.identify(
					typeof metadata?.email === 'string'
						? metadata?.email
						: identifier,
				)
				if (metadata) {
					window.mixpanel.track('identify', metadata)
					window.mixpanel.people.set(metadata)
				}
			}
		}

		if (!H.options?.integrations?.amplitude?.disabled) {
			if (window.amplitude?.getInstance) {
				window.amplitude.getInstance().setUserId(identifier)

				if (Object.keys(metadata).length > 0) {
					const amplitudeUserProperties = Object.keys(
						metadata,
					).reduce((acc, key) => {
						acc.set(key, metadata[key])

						return acc
					}, new window.amplitude.Identify())

					window.amplitude
						.getInstance()
						.identify(amplitudeUserProperties)
				}
			}
		}
	},
	metrics: (metrics: Metric[]) => {
		try {
			H.onHighlightReady(() =>
				highlight_obj.recordMetric(
					metrics.map((m) => ({
						...m,
						category: MetricCategory.Frontend,
					})),
				),
			)
		} catch (e) {
			HighlightWarning('metrics', e)
		}
	},
	startSpan: (
		name: string,
		options: SpanOptions | ((span?: Span) => any),
		context?: Context | ((span?: Span) => any),
		fn?: (span?: Span) => any,
	): any => {
		const tracer = typeof getTracer === 'function' ? getTracer() : undefined
		if (!tracer) {
			const noopSpan = getNoopSpan()

			if (fn === undefined && context === undefined) {
				return (options as Callback)(noopSpan)
			} else if (fn === undefined) {
				return (context as Callback)(noopSpan)
			} else {
				return fn(noopSpan)
			}
		}

		const wrapCallback = (span: Span, callback: (span: Span) => any) => {
			const result = callback(span)
			if (result instanceof Promise) {
				return result.finally(() => span.end())
			} else {
				span.end()
				return result
			}
		}

		if (fn === undefined && context === undefined) {
			return tracer.startActiveSpan(name, (span) =>
				wrapCallback(span, options as Callback),
			)
		} else if (fn === undefined) {
			return tracer.startActiveSpan(
				name,
				options as SpanOptions,
				(span) => wrapCallback(span, context as Callback),
			)
		} else {
			return tracer.startActiveSpan(
				name,
				options as SpanOptions,
				context as Context,
				(span) => wrapCallback(span, fn),
			)
		}
	},
	startManualSpan: (
		name: string,
		options: SpanOptions | ((span: Span) => any),
		context?: Context | ((span: Span) => any),
		fn?: (span: Span) => any,
	): any => {
		const tracer = typeof getTracer === 'function' ? getTracer() : undefined
		if (!tracer) {
			const noopSpan = getNoopSpan()

			if (fn === undefined && context === undefined) {
				return (options as Callback)(noopSpan)
			} else if (fn === undefined) {
				return (context as Callback)(noopSpan)
			} else {
				return fn(noopSpan)
			}
		}

		if (fn === undefined && context === undefined) {
			return tracer.startActiveSpan(name, options as Callback)
		} else if (fn === undefined) {
			return tracer.startActiveSpan(
				name,
				options as SpanOptions,
				context as Callback,
			)
		} else {
			return tracer.startActiveSpan(
				name,
				options as SpanOptions,
				context as Context,
				fn,
			)
		}
	},
	getSessionURL: () => {
		return new Promise((resolve, reject) => {
			H.onHighlightReady(() => {
				const secureID = highlight_obj.sessionData.sessionSecureID
				const data = getPreviousSessionData(secureID)

				if (data) {
					resolve(
						`https://${HIGHLIGHT_URL}/${data.projectID}/sessions/${secureID}`,
					)
				} else {
					reject(new Error(`Unable to get session URL: ${secureID}`))
				}
			})
		})
	},
	getSessionDetails: () => {
		return new Promise((resolve, reject) => {
			H.onHighlightReady(async () => {
				try {
					const baseUrl = await H.getSessionURL()
					if (!baseUrl) {
						throw new Error('Could not get session URL')
					}

					const secureID = highlight_obj.sessionData.sessionSecureID
					const sessionData = getPreviousSessionData(secureID)
					const currentSessionTimestamp =
						sessionData?.sessionStartTime
					if (!currentSessionTimestamp) {
						throw new Error('Could not get session start timestamp')
					}

					const now = new Date().getTime()
					const url = new URL(baseUrl)
					const urlWithTimestamp = new URL(baseUrl)
					urlWithTimestamp.searchParams.set(
						'ts',
						((now - currentSessionTimestamp) / 1000).toString(),
					)

					resolve({
						url: url.toString(),
						urlWithTimestamp: urlWithTimestamp.toString(),
						sessionSecureID: secureID,
					} as SessionDetails)
				} catch (error) {
					reject(error)
				}
			})
		})
	},
	getRecordingState: () => {
		return highlight_obj?.state ?? 'NotRecording'
	},
	onHighlightReady: (func, options) => {
		// Run the callback immediately if Highlight is already ready
		if (highlight_obj && highlight_obj.ready) {
			func()
			return
		}

		onHighlightReadyQueue.push({ options, func })

		if (onHighlightReadyTimeout !== undefined) {
			return
		}

		const processQueue = () => {
			const newQueue = onHighlightReadyQueue.filter((item) => {
				if (
					!highlight_obj ||
					(item.options?.waitForReady !== false &&
						!highlight_obj.ready)
				) {
					return true
				}

				item.func()
				return false
			})

			onHighlightReadyQueue = newQueue
			onHighlightReadyTimeout = undefined

			if (onHighlightReadyQueue.length > 0) {
				onHighlightReadyTimeout = setTimeout(
					processQueue,
					READY_WAIT_LOOP_MS,
				)
			}
		}

		processQueue()
	},
}

if (typeof window !== 'undefined') {
	window.H = H
}

listenToChromeExtensionMessage()
initializeFetchListener()
initializeWebSocketListener()

// Helpers only for testing
const __testing = {
	reset: () => {
		init_called = false
		highlight_obj = undefined as any
		onHighlightReadyQueue = []
		onHighlightReadyTimeout = undefined
		first_load_listeners = undefined as any
	},
	setHighlightObj: (obj: Partial<Highlight>) => {
		highlight_obj = obj as Highlight
	},
}

export {
	configureElectronHighlight,
	H,
	HighlightSegmentMiddleware,
	MetricCategory,
	__testing,
}
export type { HighlightOptions }
