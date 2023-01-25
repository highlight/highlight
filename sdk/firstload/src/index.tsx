import packageJson from '../package.json'
import { listenToChromeExtensionMessage } from './browserExtension/extensionListener'
import {
	AmplitudeAPI,
	setupAmplitudeIntegration,
} from './integrations/amplitude'
import { MixpanelAPI, setupMixpanelIntegration } from './integrations/mixpanel'
import { initializeFetchListener } from './listeners/fetch'
import { getPreviousSessionData } from '../../client/src/utils/sessionStorage/highlightSession'
import { FirstLoadListeners } from '../../client/src/listeners/first-load-listeners'
import { GenerateSecureID } from '../../client/src/utils/secure-id'
import type { Highlight, HighlightClassOptions } from '../../client/src/index'
import type {
	HighlightOptions,
	HighlightPublicInterface,
	Metadata,
	Metric,
	SessionDetails,
} from '../../client/src/types/types'
import HighlightSegmentMiddleware from './integrations/segment'
import configureElectronHighlight from './environments/electron'

initializeFetchListener()

export enum MetricCategory {
	Device = 'Device',
	WebVital = 'WebVital',
	Frontend = 'Frontend',
	Backend = 'Backend',
}

const HighlightWarning = (context: string, msg: any) => {
	console.warn(`Highlight Warning: (${context}): `, msg)
}

interface HighlightWindow extends Window {
	Highlight: new (
		options: HighlightClassOptions,
		firstLoadListeners: FirstLoadListeners,
	) => Highlight
	H: HighlightPublicInterface
	mixpanel?: MixpanelAPI
	amplitude?: AmplitudeAPI
	Intercom?: any
}

declare var window: HighlightWindow

var script: HTMLScriptElement
var highlight_obj: Highlight
var first_load_listeners: FirstLoadListeners
var init_called = false
export const H: HighlightPublicInterface = {
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

			// `init` was already called, do not reinitialize
			if (init_called) {
				return
			}
			init_called = true

			script = document.createElement('script')
			var scriptSrc = options?.scriptUrl
				? options.scriptUrl
				: `https://static.highlight.io/v${packageJson.version}/index.js`
			script.setAttribute('src', scriptSrc)
			script.setAttribute('type', 'text/javascript')
			document.getElementsByTagName('head')[0].appendChild(script)

			let previousSession = getPreviousSessionData()
			let sessionSecureID = GenerateSecureID()
			if (previousSession?.sessionSecureID) {
				sessionSecureID = previousSession.sessionSecureID
			}
			const client_options: HighlightClassOptions = {
				organizationID: projectID,
				debug: options?.debug,
				backendUrl: options?.backendUrl,
				tracingOrigins: options?.tracingOrigins,
				disableNetworkRecording: options?.disableNetworkRecording,
				networkRecording: options?.networkRecording,
				disableConsoleRecording: options?.disableConsoleRecording,
				consoleMethodsToRecord: options?.consoleMethodsToRecord,
				enableSegmentIntegration: options?.enableSegmentIntegration,
				enableStrictPrivacy: options?.enableStrictPrivacy || false,
				enableCanvasRecording: options?.enableCanvasRecording,
				enablePerformanceRecording: options?.enablePerformanceRecording,
				samplingStrategy: options?.samplingStrategy,
				inlineImages: options?.inlineImages || false,
				inlineStylesheet: options?.inlineStylesheet || false,
				isCrossOriginIframe: options?.isCrossOriginIframe || false,
				firstloadVersion: packageJson['version'],
				environment: options?.environment || 'production',
				appVersion: options?.version,
				sessionShortcut: options?.sessionShortcut,
				feedbackWidget: options?.feedbackWidget,
				sessionSecureID: sessionSecureID,
			}
			first_load_listeners = new FirstLoadListeners(client_options)
			if (!options?.manualStart) {
				// Start some of the listeners before client is loaded, then hand the
				// listeners over for client to manage
				first_load_listeners.startListening()
			}
			script.addEventListener('load', () => {
				const startFunction = () => {
					highlight_obj = new window.Highlight(
						client_options,
						first_load_listeners,
					)
					if (!options?.manualStart) {
						highlight_obj.initialize()
					}
				}

				if ('Highlight' in window) {
					startFunction()
				} else {
					const interval = setInterval(() => {
						if ('Highlight' in window) {
							startFunction()
							clearInterval(interval)
						}
					}, 500)
				}
			})

			if (options?.integrations?.mixpanel?.projectToken) {
				setupMixpanelIntegration(options.integrations.mixpanel)
			}

			if (options?.integrations?.amplitude?.apiKey) {
				setupAmplitudeIntegration(options.integrations.amplitude)
			}
		} catch (e) {
			HighlightWarning('init', e)
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
	toggleSessionFeedbackModal: () => {
		try {
			H.onHighlightReady(() =>
				highlight_obj.toggleFeedbackWidgetVisibility(),
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

			if (H.options?.integrations?.mixpanel?.projectToken) {
				if (window.mixpanel?.track) {
					window.mixpanel?.track(event, {
						...metadata,
						highlightSessionURL: highlightUrl,
					})
				} else {
					console.warn(
						"Mixpanel not loaded, but Highlight is configured to use it. This is usually caused by Mixpanel being blocked by the user's browser.",
					)
				}
			}

			if (H.options?.integrations?.amplitude?.apiKey) {
				if (window.amplitude?.getInstance) {
					window.amplitude.getInstance().logEvent(event, {
						...metadata,
						highlightSessionURL: highlightUrl,
					})
				}
			}

			if (H.options?.integrations?.intercom?.enabled) {
				window.Intercom('trackEvent', event, metadata)
			}
		} catch (e) {
			HighlightWarning('track', e)
		}
	},
	start: (options) => {
		try {
			if (highlight_obj?.state === 'Recording') {
				if (!options?.silent) {
					console.warn(
						'You cannot called `start()` again. The session is already being recorded.',
					)
				}
				return
			} else {
				first_load_listeners.startListening()
				var interval = setInterval(function () {
					if (highlight_obj) {
						clearInterval(interval)
						highlight_obj.initialize()
					}
				}, 200)
			}
		} catch (e) {
			HighlightWarning('start', e)
		}
	},
	stop: () => {
		try {
			H.onHighlightReady(() => highlight_obj.stopRecording(true))
		} catch (e) {
			HighlightWarning('stop', e)
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
		if (window.mixpanel?.identify) {
			window.mixpanel.identify(identifier)
		}
		if (window.amplitude?.getInstance) {
			window.amplitude.getInstance().setUserId(identifier)

			if (Object.keys(metadata).length > 0) {
				const amplitudeUserProperties = Object.keys(metadata).reduce(
					(acc, key) => {
						acc.set(key, metadata[key])

						return acc
					},
					new window.amplitude.Identify(),
				)

				window.amplitude.getInstance().identify(amplitudeUserProperties)
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
	onHighlightReady: (func: () => void) => {
		try {
			if (highlight_obj && highlight_obj.ready) {
				func()
			} else {
				var interval = setInterval(function () {
					if (highlight_obj && highlight_obj.ready) {
						clearInterval(interval)
						func()
					}
				}, 200)
			}
		} catch (e) {
			HighlightWarning('onHighlightReady', e)
		}
	},
}

if (typeof window !== 'undefined') {
	window.H = H
}

listenToChromeExtensionMessage()

export { HighlightSegmentMiddleware, configureElectronHighlight }
export type { HighlightOptions }
