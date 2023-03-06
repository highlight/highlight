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

	while (start <= end) {
		const mid = Math.floor(start + (end - start) / 2)
		const event = events[mid]
		const eventTimestamp =
			new Date(event.timestamp).getTime() - sessionStartTime
		if (eventTimestamp === currentTimestamp) {
			return mid
		} else if (eventTimestamp < currentTimestamp) {
			start = mid + 1
		} else {
			end = mid - 1
		}
	}
	return Math.min(end, events.length - 1)
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

export const findResourceWithMatchingHighlightHeader = (
	headerValue: string,
	resources: NetworkResource[],
) => {
	return resources.find(
		(resource) => getHighlightRequestId(resource) === headerValue,
	)
}

export const getHighlightRequestId = (resource?: NetworkResource) => {
	return resource?.requestResponsePairs?.request?.id
}

export enum Tab {
	Errors = 'Errors',
	Console = 'Console',
	Network = 'Network',
	Events = 'Events',
}

export enum LogLevel {
	All = 'All',
	Info = 'Info',
	Log = 'Log',
	Warn = 'Warn',
	Error = 'Error',
}

export const LogLevelVariants = {
	[LogLevel.All]: 'white',
	[LogLevel.Info]: 'white',
	[LogLevel.Log]: 'blue',
	[LogLevel.Warn]: 'yellow',
	[LogLevel.Error]: 'red',
} as const

export enum RequestType {
	All = 'All',
	Link = 'link',
	Script = 'script',
	Other = 'other',
	XHR = 'xmlhttprequest',
	CSS = 'css',
	iFrame = 'iframe', // didn't find a request to verify that 'iframe' is what is actually received
	Fetch = 'fetch',
	Img = 'img',
}

export const NETWORK_REQUEST_DISPLAY_NAMES: { [key: string]: string } = {
	All: 'All',
	link: 'Link',
	script: 'Script',
	other: 'Other',
	xmlhttprequest: 'XHR',
	css: 'CSS',
	iframe: 'iFrame',
	fetch: 'Fetch',
	img: 'Img',
} as const

export const getNetworkResourcesDisplayName = (value: string): string => {
	switch (true) {
		case value in NETWORK_REQUEST_DISPLAY_NAMES: {
			return NETWORK_REQUEST_DISPLAY_NAMES[value]
		}
		default:
			return value?.charAt(0).toUpperCase() + value?.slice(1)
	}
}
