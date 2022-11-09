import { eventWithTime } from '@rrweb/types'

export type HighlightEvent = eventWithTime & { identifier: string }

export type HighlightPerformancePayload = {
	jsHeapSizeLimit: number
	usedJSHeapSize: number
	relativeTimestamp: number
	fps: number
}

export type HighlightJankPayload = {
	relativeTimestamp: number
	jankAmount: number
	querySelector: string
	newLocation?: string
}
