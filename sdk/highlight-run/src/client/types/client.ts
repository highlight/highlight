import { RequestResponsePair } from '../listeners/network-listener/utils/models'

export const ALL_CONSOLE_METHODS = [
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
] as const
type ConsoleMethodsTuple = typeof ALL_CONSOLE_METHODS
export declare type ConsoleMethods = ConsoleMethodsTuple[number]

export declare type DebugOptions = {
	clientInteractions?: boolean
	domRecording?: boolean
}

export declare type NetworkRecordingOptions = {
	/**
	 * Enables recording of network requests.
	 * The data includes the URLs, the size of the request, and how long the request took.
	 * @default true
	 */
	enabled?: boolean
	/**
	 * This enables recording XMLHttpRequest and Fetch headers and bodies.
	 * @default false
	 */
	recordHeadersAndBody?: boolean
	/**
	 * This disables recording WebSocket events.
	 * WebSocket events are recorded by default if recordHeadersAndBody is set.
	 * @default false
	 */
	disableWebSocketEventRecordings?: boolean
	/**
	 * Request and response headers where the value is not recorded.
	 * The header value is replaced with '[REDACTED]'.
	 * These headers are case-insensitive.
	 * `recordHeadersAndBody` needs to be enabled.
	 * This option will be ignored if `headerKeysToRecord` is set.
	 * @example
	 * networkHeadersToRedact: ['Secret-Header', 'Plain-Text-Password']
	 */
	networkHeadersToRedact?: string[]
	/**
	 * Specifies the keys for request/response JSON body that should not be recorded.
	 * The body value is replaced with '[REDACTED]'.
	 * These keys are case-insensitive.
	 * `enabled` and `recordHeadersAndBody` need to be `true`. Otherwise this option will be ignored.
	 * @example bodyKeysToRedact: ['secret-token', 'plain-text-password']
	 * // Only `body.id` and `body.pageNumber` will be recorded.
	 * body = {
	 * 'id': '123',
	 * 'pageNumber': '1',
	 * 'secret-token': 'super-sensitive-value',
	 * 'plain-text-password': 'password123',
	 * }
	 */
	networkBodyKeysToRedact?: string[]
	/**
	 * URLs to not record headers and bodies for.
	 * To disable recording headers and bodies for all URLs, set `recordHeadersAndBody` to `false`.
	 * @default ['https://www.googleapis.com/identitytoolkit', 'https://securetoken.googleapis.com']
	 */
	urlBlocklist?: string[]
	/**
	 * Specifies the keys for request/response headers to record.
	 * This option will override `networkHeadersToRedact` if specified.
	 * `enabled` and `recordHeadersAndBody` need to be `true`. Otherwise this option will be ignored.
	 * @example headerKeysToRecord: ['id', 'pageNumber']
	 * // Only `headers.id` and `headers.pageNumber` will be recorded.
	 * headers = {
	 * 'id': '123',
	 * 'pageNumber': '1',
	 * 'secret-token': 'super-sensitive-value',
	 * 'plain-text-password': 'password123',
	 * }
	 */
	headerKeysToRecord?: string[]
	/**
	 * Specifies the keys for request/response JSON body to record.
	 * This option will override `networkBodyKeysToRedact` if specified.
	 * `enabled` and `recordHeadersAndBody` need to be `true`. Otherwise this option will be ignored.
	 * @example bodyKeysToRecord: ['id', 'pageNumber']
	 * // Only `body.id` and `body.pageNumber` will be recorded.
	 * body = {
	 * 'id': '123',
	 * 'pageNumber': '1',
	 * 'secret-token': 'super-sensitive-value',
	 * 'plain-text-password': 'password123',
	 * }
	 */
	bodyKeysToRecord?: string[]
	/**
	 * Record frontend network request metrics that are sent to
	 * the following list of domains. A domain substring match is used to
	 * determine if a network request matches one of the following values.
	 * @example destinationDomains: ['backend.example.com']
	 * // if your frontend makes requests to `backend.example.com` that you would like to record
	 */
	destinationDomains?: string[]
	/**
	 * Function to edit/remove data in request/response pairs or ignore the pair entirely.
	 * @example
	 * ```
	 * requestResponseSanitizer: pair => {
	 *   if (pair.request.url.toLowerCase().indexOf('ignore') !== -1) {
	 *      // ignore the entire request/response pair (no network logs)
	 *      return null
	 *    }
	 *
	 *    if (pair.response.body.indexOf('secret') !== -1) {
	 *        // remove the body in the response
	 * 				delete pair.response.body;
	 *    }
	 *
	 *    return pair
	 * }
	 * ```
	 *
	 */
	requestResponseSanitizer?: (
		pair: RequestResponsePair,
	) => RequestResponsePair | null
}

export declare type OtelOptions = {
	instrumentations: OtelInstrumentatonOptions
}

export declare type OtelInstrumentatonOptions = {
	'@opentelemetry/instrumentation-document-load'?: false
	'@opentelemetry/instrumentation-fetch'?: false
	'@opentelemetry/instrumentation-xml-http-request'?: false
	'@opentelemetry/instrumentation-user-interaction'?: false
}

export declare type IntegrationOptions = {
	amplitude?: AmplitudeIntegrationOptions
	intercom?: IntercomIntegrationOptions
	mixpanel?: MixpanelIntegrationOptions
}

export declare type SessionShortcutOptions = false | string

type DefaultIntegrationOptions = {
	disabled?: boolean
}

export declare interface MixpanelIntegrationOptions
	extends DefaultIntegrationOptions {
	projectToken?: string
}

export declare interface AmplitudeIntegrationOptions
	extends DefaultIntegrationOptions {
	apiKey?: string
}

export declare interface IntercomIntegrationOptions
	extends DefaultIntegrationOptions {}

export enum MetricName {
	DeviceMemory = 'DeviceMemory',
	ViewportHeight = 'ViewportHeight',
	ViewportWidth = 'ViewportWidth',
	ScreenHeight = 'ScreenHeight',
	ScreenWidth = 'ScreenWidth',
	ViewportArea = 'ViewportArea',
}
export enum MetricCategory {
	Device = 'Device',
	WebVital = 'WebVital',
	Performance = 'Performance',
	Frontend = 'Frontend',
	Backend = 'Backend',
}
