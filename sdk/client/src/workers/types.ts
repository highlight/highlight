import { eventWithTime } from '@rrweb/types'
import { ConsoleMessage, ErrorMessage } from '../types/shared-types'
import { MetricCategory } from '../types/client'

export type Source = 'segment' | undefined

export type PropertyType = {
	type?: 'track' | 'session'
	source?: Source
}

export enum MessageType {
	Initialize,
	AsyncEvents,
	Identify,
	Properties,
	Metrics,
	Feedback,
	CustomEvent,
	Stop,
}

export type InitializeMessage = {
	type: MessageType.Initialize
	backend: string
	sessionSecureID: string
	debug: boolean
	recordingStartTime: number
}

export type AsyncEventsMessage = {
	type: MessageType.AsyncEvents
	id: number
	hasSessionUnloaded: boolean
	highlightLogs: string
	events: eventWithTime[]
	messages: ConsoleMessage[]
	errors: ErrorMessage[]
	resourcesString: string
	webSocketEventsString: string
}

export type AsyncEventsResponse = {
	type: MessageType.AsyncEvents
	id: number
	eventsSize: number
	compressedSize: number
}

export type IdentifyMessage = {
	type: MessageType.Identify
	userIdentifier: string
	userObject: any
	source?: Source
}

export type PropertiesMessage = {
	type: MessageType.Properties
	propertiesObject: any
	propertyType?: PropertyType
}

export type MetricsMessage = {
	type: MessageType.Metrics
	metrics: {
		name: string
		value: number
		category: MetricCategory
		group: string
		timestamp: Date
		tags: { name: string; value: string }[]
	}[]
}

export type FeedbackMessage = {
	type: MessageType.Feedback
	verbatim: string
	timestamp: string
	userName?: string
	userEmail?: string
}

export type CustomEventResponse = {
	type: MessageType.CustomEvent
	tag: string
	payload: any
}

export type StopEventResponse = {
	type: MessageType.Stop
	requestStart: number
	asyncEventsResponse: AsyncEventsResponse
}

export type HighlightClientWorkerParams = {
	message:
		| InitializeMessage
		| AsyncEventsMessage
		| IdentifyMessage
		| PropertiesMessage
		| MetricsMessage
		| FeedbackMessage
}

export type HighlightClientWorkerResponse = {
	response?: AsyncEventsResponse | CustomEventResponse | StopEventResponse
}
