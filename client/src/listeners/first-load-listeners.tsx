import { ConsoleListener } from './console-listener'
import { ErrorListener } from './error-listener'

import { ConsoleMessage, ErrorMessage } from '../types/shared-types'
import { ALL_CONSOLE_METHODS, ConsoleMethods } from '../types/client'
import { ERRORS_TO_IGNORE, ERROR_PATTERNS_TO_IGNORE } from '../constants/errors'
import { HighlightClassOptions } from '../index'
import stringify from 'json-stringify-safe'
import { DEFAULT_URL_BLOCKLIST } from './network-listener/utils/network-sanitizer'
import { RequestResponsePair } from './network-listener/utils/models'
import { NetworkListener } from './network-listener/network-listener'
import {
	matchPerformanceTimingsWithRequestResponsePair,
	shouldNetworkRequestBeRecorded,
} from './network-listener/utils/utils'
import publicGraphURI from 'consts:publicGraphURI'

// Note: This class is used by both firstload and client. When constructed in client, it will match the current
// codebase. When constructed in firstload, it will match the codebase at the time the npm package was published.
export class FirstLoadListeners {
	disableConsoleRecording: boolean
	consoleMethodsToRecord: ConsoleMethods[]
	listeners: (() => void)[]
	errors: ErrorMessage[]
	messages: ConsoleMessage[]
	// The properties below were added in 4.0.0 (Feb 2022), and are patched in by client via setupNetworkListeners()
	options: HighlightClassOptions
	hasNetworkRecording: boolean | undefined = true
	_backendUrl!: string
	disableNetworkRecording!: boolean
	enableRecordingNetworkContents!: boolean
	xhrNetworkContents!: RequestResponsePair[]
	fetchNetworkContents!: RequestResponsePair[]
	tracingOrigins!: boolean | (string | RegExp)[]
	networkHeadersToRedact!: string[]
	networkBodyKeysToRecord: string[] | undefined
	networkHeaderKeysToRecord: string[] | undefined
	urlBlocklist!: string[]

	constructor(options: HighlightClassOptions) {
		this.options = options
		this.disableConsoleRecording =
			// Disable recording the console on localhost.
			// We're doing this because on some development builds, the console ends up in an infinite loop.
			window.location.hostname === 'localhost' ||
			!!options.disableConsoleRecording
		this.consoleMethodsToRecord = options.consoleMethodsToRecord || [
			...ALL_CONSOLE_METHODS,
		]
		this.listeners = []
		this.errors = []
		this.messages = []
	}

	isListening() {
		return this.listeners.length > 0
	}

	startListening() {
		if (this.isListening()) return
		const highlightThis = this
		if (!this.disableConsoleRecording) {
			this.listeners.push(
				ConsoleListener(
					(c: ConsoleMessage) => {
						if (
							(c.type === 'Error' || c.type === 'error') &&
							c.value &&
							c.trace
						) {
							const errorValue = stringify(c.value)
							if (
								ERRORS_TO_IGNORE.includes(errorValue) ||
								ERROR_PATTERNS_TO_IGNORE.some((pattern) =>
									errorValue.includes(pattern),
								)
							) {
								return
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
							})
						} else {
							highlightThis.messages.push(c)
						}
					},
					{
						level: this.consoleMethodsToRecord,
						logger: 'console',
						stringifyOptions: {
							depthOfLimit: 10,
							numOfKeysLimit: 100,
							stringLengthLimit: 1000,
						},
					},
				),
			)
		}
		this.listeners.push(
			ErrorListener((e: ErrorMessage) => highlightThis.errors.push(e)),
		)
		FirstLoadListeners.setupNetworkListener(this, this.options)
	}

	stopListening() {
		this.listeners.forEach((stop: () => void) => stop())
		this.listeners = []
	}

	// We define this as a static method because versions earlier than 4.0.0 (Feb 2022) don't have this code.
	// For those versions, calling this from client will monkey-patch the network listeners onto the old FirstLoadListener object.
	static setupNetworkListener(
		sThis: FirstLoadListeners,
		options: HighlightClassOptions,
	): void {
		sThis._backendUrl =
			options?.backendUrl || publicGraphURI || 'https://pub.highlight.run'

		sThis.xhrNetworkContents = []
		sThis.fetchNetworkContents = []
		sThis.networkHeadersToRedact = []
		sThis.urlBlocklist = []
		sThis.tracingOrigins = options.tracingOrigins || []

		// Old versions of `firstload` use `disableNetworkRecording`. We fork here to ensure backwards compatibility.
		if (options?.disableNetworkRecording !== undefined) {
			sThis.disableNetworkRecording = options?.disableNetworkRecording
			sThis.enableRecordingNetworkContents = false
			sThis.networkHeadersToRedact = []
			sThis.urlBlocklist = []
			sThis.networkBodyKeysToRecord = []
			sThis.networkBodyKeysToRecord = []
		} else if (typeof options?.networkRecording === 'boolean') {
			sThis.disableNetworkRecording = !options.networkRecording
			sThis.enableRecordingNetworkContents = false
			sThis.networkHeadersToRedact = []
			sThis.urlBlocklist = []
		} else {
			if (options.networkRecording?.enabled !== undefined) {
				sThis.disableNetworkRecording =
					!options.networkRecording.enabled
			} else {
				sThis.disableNetworkRecording = false
			}
			sThis.enableRecordingNetworkContents =
				options.networkRecording?.recordHeadersAndBody || false
			sThis.networkHeadersToRedact =
				options.networkRecording?.networkHeadersToRedact?.map(
					(header) => header.toLowerCase(),
				) || []
			sThis.urlBlocklist =
				options.networkRecording?.urlBlocklist?.map((url) =>
					url.toLowerCase(),
				) || []
			sThis.urlBlocklist = [
				...sThis.urlBlocklist,
				...DEFAULT_URL_BLOCKLIST,
			]

			sThis.networkHeaderKeysToRecord =
				options.networkRecording?.headerKeysToRecord
			// `headerKeysToRecord` override `networkHeadersToRedact`.
			if (sThis.networkHeaderKeysToRecord) {
				sThis.networkHeadersToRedact = []
				sThis.networkHeaderKeysToRecord =
					sThis.networkHeaderKeysToRecord.map((key) =>
						key.toLocaleLowerCase(),
					)
			}

			sThis.networkBodyKeysToRecord =
				options.networkRecording?.bodyKeysToRecord

			if (sThis.networkBodyKeysToRecord) {
				sThis.networkBodyKeysToRecord =
					sThis.networkBodyKeysToRecord.map((key) =>
						key.toLocaleLowerCase(),
					)
			}
		}

		if (
			!sThis.disableNetworkRecording &&
			sThis.enableRecordingNetworkContents
		) {
			sThis.listeners.push(
				NetworkListener({
					xhrCallback: (requestResponsePair) => {
						sThis.xhrNetworkContents.push(requestResponsePair)
					},
					fetchCallback: (requestResponsePair) => {
						sThis.fetchNetworkContents.push(requestResponsePair)
					},
					headersToRedact: sThis.networkHeadersToRedact,
					backendUrl: sThis._backendUrl,
					tracingOrigins: sThis.tracingOrigins,
					urlBlocklist: sThis.urlBlocklist,
					sessionSecureID: options.sessionSecureID,
					headerKeysToRecord: sThis.networkHeaderKeysToRecord,
					bodyKeysToRecord: sThis.networkBodyKeysToRecord,
				}),
			)
		}
	}

	static getRecordedNetworkResources(
		sThis: FirstLoadListeners,
		recordingStartTime: number,
	): Array<PerformanceResourceTiming> {
		let resources: Array<PerformanceResourceTiming> = []
		if (!sThis.disableNetworkRecording) {
			const documentTimeOrigin = window?.performance?.timeOrigin || 0
			// get all resources that don't include 'api.highlight.run'
			resources = performance.getEntriesByType(
				'resource',
			) as PerformanceResourceTiming[]

			// Subtract session start time from performance.timeOrigin
			// Subtract diff to the times to do the offsets
			const offset = (recordingStartTime - documentTimeOrigin) * 2

			resources = resources
				.filter((r) =>
					shouldNetworkRequestBeRecorded(
						r.name,
						sThis._backendUrl,
						sThis.tracingOrigins,
					),
				)
				.map((resource) => {
					return {
						...resource.toJSON(),
						offsetStartTime: resource.startTime - offset,
						offsetResponseEnd: resource.responseEnd - offset,
						offsetFetchStart: resource.fetchStart - offset,
					}
				})

			if (sThis.enableRecordingNetworkContents) {
				resources = matchPerformanceTimingsWithRequestResponsePair(
					resources,
					sThis.xhrNetworkContents,
					'xmlhttprequest',
				)
				resources = matchPerformanceTimingsWithRequestResponsePair(
					resources,
					sThis.fetchNetworkContents,
					'fetch',
				)
			}
		}
		return resources
	}

	static clearRecordedNetworkResources(sThis: FirstLoadListeners): void {
		if (!sThis.disableNetworkRecording) {
			sThis.xhrNetworkContents = []
			sThis.fetchNetworkContents = []
			performance.clearResourceTimings()
		}
	}
}
