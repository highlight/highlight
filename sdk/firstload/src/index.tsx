import {
	AmplitudeAPI,
	setupAmplitudeIntegration,
} from './integrations/amplitude.js'
import { SESSION_STORAGE_KEYS } from '@highlight-run/client/src/utils/sessionStorage/sessionStorageKeys.js'
import type {
	Highlight,
	HighlightClassOptions,
} from '@highlight-run/client/src/index.js'
import {
	HighlightOptions,
	HighlightPublicInterface,
	Metadata,
	Metric,
	OnHighlightReadyOptions,
	SessionDetails,
} from '@highlight-run/client/src/types/types.js'
import {
	MixpanelAPI,
	setupMixpanelIntegration,
} from './integrations/mixpanel.js'

import { FirstLoadListeners } from '@highlight-run/client/src/listeners/first-load-listeners.js'
import { GenerateSecureID } from '@highlight-run/client/src/utils/secure-id.js'
import { HighlightSegmentMiddleware } from './integrations/segment.js'
import configureElectronHighlight from './environments/electron.js'
import firstloadVersion from './__generated/version.js'
import {
	getPreviousSessionData,
	SessionData,
} from '@highlight-run/client/src/utils/sessionStorage/highlightSession.js'
import { initializeFetchListener } from './listeners/fetch/index.js'
import { initializeWebSocketListener } from './listeners/web-socket/index.js'
import { listenToChromeExtensionMessage } from './browserExtension/extensionListener.js'
import { setItem } from '@highlight-run/client/src/utils/storage.js'

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
let onHighlightReadyTimeout: number | undefined = undefined

let script: HTMLScriptElement
let highlight_obj: Highlight
let first_load_listeners: FirstLoadListeners
let init_called = false
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

			let previousSession = getPreviousSessionData()
			let sessionSecureID = GenerateSecureID()
			if (previousSession?.sessionSecureID) {
				sessionSecureID = previousSession.sessionSecureID
			} else {
				const sessionData: SessionData = {
					...previousSession,
					projectID: +projectID,
					sessionSecureID,
				}

				setItem(
					SESSION_STORAGE_KEYS.SESSION_DATA,
					JSON.stringify(sessionData),
				)
			}

			// `init` was already called, do not reinitialize
			if (init_called) {
				return { sessionSecureID }
			}
			init_called = true

			script = document.createElement('script')
			var scriptSrc = options?.scriptUrl
				? options.scriptUrl
				: `https://static.highlight.io/v${firstloadVersion}/index.js`
			script.setAttribute('src', scriptSrc)
			script.setAttribute('type', 'text/javascript')
			document.getElementsByTagName('head')[0].appendChild(script)

			const client_options: HighlightClassOptions = {
				organizationID: projectID,
				debug: options?.debug,
				backendUrl: options?.backendUrl,
				tracingOrigins: options?.tracingOrigins,
				disableNetworkRecording: options?.disableNetworkRecording,
				networkRecording: options?.networkRecording,
				disableBackgroundRecording: options?.disableBackgroundRecording,
				disableConsoleRecording: options?.disableConsoleRecording,
				disableSessionRecording: options?.disableSessionRecording,
				reportConsoleErrors: options?.reportConsoleErrors,
				consoleMethodsToRecord: options?.consoleMethodsToRecord,
				enableSegmentIntegration: options?.enableSegmentIntegration,
				privacySetting: options?.privacySetting,
				enableCanvasRecording: options?.enableCanvasRecording,
				enablePerformanceRecording: options?.enablePerformanceRecording,
				samplingStrategy: options?.samplingStrategy,
				inlineImages: options?.inlineImages,
				inlineStylesheet: options?.inlineStylesheet,
				recordCrossOriginIframe: options?.recordCrossOriginIframe,
				firstloadVersion,
				environment: options?.environment || 'production',
				appVersion: options?.version,
				serviceName: options?.serviceName,
				sessionShortcut: options?.sessionShortcut,
				sessionSecureID: sessionSecureID,
				storageMode: options?.storageMode,
				sendMode: options?.sendMode,
			}
			first_load_listeners = new FirstLoadListeners(client_options)
			if (!options?.manualStart) {
				// Start some of the listeners before client is loaded, then hand the
				// listeners over for client to manage
				first_load_listeners.startListening()
			}
			script.addEventListener('load', () => {
				const startFunction = () => {
					highlight_obj = new window.HighlightIO(
						client_options,
						first_load_listeners,
					)
					if (!options?.manualStart) {
						highlight_obj.initialize()
					}
				}

				if ('HighlightIO' in window) {
					startFunction()
				} else {
					const start = () => {
						if ('HighlightIO' in window) {
							startFunction()
						} else {
							setTimeout(start, READY_WAIT_LOOP_MS)
						}
					}
					start()
				}
			})

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
		if (highlight_obj?.state === 'Recording') {
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
	getSessionURL: () => {
		return new Promise<string>((resolve, reject) => {
			H.onHighlightReady(() => {
				const res = highlight_obj.getCurrentSessionURL()
				if (res) {
					resolve(res)
				} else {
					reject(new Error('Unable to get session URL'))
				}
			})
		})
	},
	getSessionDetails: () => {
		return new Promise<SessionDetails>((resolve, reject) => {
			H.onHighlightReady(() => {
				const baseUrl = highlight_obj.getCurrentSessionURL()
				if (baseUrl) {
					const currentSessionTimestamp =
						highlight_obj.getCurrentSessionTimestamp()
					const now = new Date().getTime()
					const url = new URL(baseUrl)
					const urlWithTimestamp = new URL(baseUrl)
					urlWithTimestamp.searchParams.set(
						'ts',
						// The delta between when the session recording started and now.
						((now - currentSessionTimestamp) / 1000).toString(),
					)

					resolve({
						url: url.toString(),
						urlWithTimestamp: urlWithTimestamp.toString(),
					})
				} else {
					reject(new Error('Could not get session URL'))
				}
			})
		})
	},
	onHighlightReady: async (func, options) => {
		onHighlightReadyQueue.push({ options, func })
		if (onHighlightReadyTimeout === undefined) {
			const fn = async () => {
				const newOnHighlightReadyQueue: {
					options?: OnHighlightReadyOptions
					func: () => void | Promise<void>
				}[] = []
				for (const f of onHighlightReadyQueue) {
					if (
						highlight_obj &&
						(f.options?.waitForReady === false ||
							highlight_obj.ready)
					) {
						try {
							await f.func()
						} catch (e) {
							HighlightWarning('onHighlightReady', e)
						}
					} else {
						newOnHighlightReadyQueue.push(f)
					}
				}
				onHighlightReadyTimeout = undefined
				onHighlightReadyQueue = newOnHighlightReadyQueue
				if (onHighlightReadyQueue.length > 0) {
					onHighlightReadyTimeout = setTimeout(
						fn,
						READY_WAIT_LOOP_MS,
					) as unknown as number
				}
			}
			await fn()
		}
	},
}

if (typeof window !== 'undefined') {
	window.H = H
}

listenToChromeExtensionMessage()
initializeFetchListener()
initializeWebSocketListener()

export type { HighlightOptions }
export {
	H,
	HighlightSegmentMiddleware,
	MetricCategory,
	configureElectronHighlight,
}
