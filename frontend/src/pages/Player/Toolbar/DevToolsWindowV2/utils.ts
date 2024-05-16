import { ErrorObject } from '@graph/schemas'
import { NetworkResourceWithID } from '@pages/Player/ResourcesContext/ResourcesContext'

export interface ActiveEvent {
	timestamp: number | string
}

/**
 * Finds the event closest to the currentTimestamp in the previous time.
 * @param currentTimestamp Milliseconds from the start of the session
 * @param sessionStartTime: Absolute start of the session
 * @param events Assumed to be sorted based on time in ascending order.
 */

export const findLastActiveEventIndex = (
	currentTimestamp: number,
	sessionStartTime: number,
	events: ActiveEvent[],
): number => {
	if (!events.length) {
		return -1
	}

	let start = 0
	let end = events.length - 1
	let lastMatchIndex = -1

	while (start <= end) {
		const mid = Math.floor(start + (end - start) / 2)
		const event = events[mid]
		const eventTimestamp =
			new Date(event.timestamp).getTime() - sessionStartTime

		if (eventTimestamp === currentTimestamp) {
			lastMatchIndex = mid
			start = mid + 1
		} else if (eventTimestamp < currentTimestamp) {
			start = mid + 1
		} else {
			end = mid - 1
		}
	}

	return lastMatchIndex !== -1
		? lastMatchIndex
		: Math.min(end, events.length - 1)
}

interface Request {
	url: string
	verb: string
	headers: Headers
	body: any
}

interface Response {
	status: number
	headers: any
	body: any
	/** Number of Bytes transferred over the network. */
	size?: number
}

export interface RequestResponsePair {
	request: Request
	response: Response
	/** Whether this URL matched a `urlToBlock` so the contents should not be recorded. */
	urlBlocked: boolean
}

export type NetworkResource = NetworkResourceWithID &
	ActiveEvent & {
		requestResponsePairs?: RequestResponsePair
		errors?: ErrorObject[]
		offsetStartTime?: number
		relativeStartTime: number
	}

/**
 * Formats bytes to the short form of KB and MB.
 */
export const formatSize = (bytes: number) => {
	if (bytes < 1024) {
		return `${roundOff(bytes)} B`
	}
	if (bytes < 1024 ** 2) {
		return `${roundOff(bytes / 1024)} KB`
	}
	return `${roundOff(bytes / 1024 ** 2)} MB`
}

const roundOff = (value: number, decimal = 1) => {
	const base = 10 ** decimal
	return Math.round(value * base) / base
}

export const getHighlightRequestId = (resource?: NetworkResource) => {
	return resource?.requestResponsePairs?.request?.id
}

export enum Tab {
	Errors = 'Errors',
	Console = 'Console Logs',
	Network = 'Network',
	Performance = 'Performance',
	Events = 'Events',
}

export enum LogLevelValue {
	All = 'All',
	// keep up to date with LogLevel schema
	Debug = 'debug',
	Error = 'error',
	Fatal = 'fatal',
	Info = 'info',
	Trace = 'trace',
	Warn = 'warn',
}

export enum RequestType {
	/* [displayName]: requestName */
	All = 'All',
	CSS = 'css',
	Fetch = 'fetch',
	iFrame = 'iframe' /* didn't find a request to verify that 'iframe' is what is actually received */,
	Img = 'img',
	Link = 'link',
	Other = 'other',
	Script = 'script',
	WebSocket = 'websocket',
	XHR = 'xmlhttprequest',
}

export interface ICountPerRequestType {
	All: number
	css: number
	fetch: number
	iframe: number
	img: number
	link: number
	other: number
	script: number
	websocket: number
	xmlhttprequest: number
}

export enum RequestStatus {
	All = 'All',
	'1XX' = '1XX',
	'2XX' = '2XX',
	'3XX' = '3XX',
	'4XX' = '4XX',
	'5XX' = '5XX',
	'Unknown' = 'Unknown',
}

export type ICountPerRequestStatus = {
	[key in RequestStatus]: number
}

export const getNetworkResourcesDisplayName = (value: string): string => {
	for (const [displayName, requestName] of Object.entries(RequestType)) {
		if (value === requestName) {
			return displayName
		}
	}
	return titilize(value)
}

export const titilize = (value: string): string => {
	return value?.charAt(0).toUpperCase() + value?.slice(1)
}
