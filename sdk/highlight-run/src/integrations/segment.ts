import type { HighlightPublicInterface } from '../client'

interface SegmentContext {
	payload: any
	next: any
	integrations?: any
}

export const HighlightSegmentMiddleware = ({
	next,
	payload,
}: SegmentContext) => {
	if (
		typeof window !== 'undefined' &&
		typeof document !== 'undefined' &&
		'H' in window
	) {
		if (payload.obj.type === 'track') {
			const trackEventName = payload.obj.event
			const trackEventProperties = payload.obj.properties
			window.H.track(trackEventName, trackEventProperties)
		} else if (payload.obj.type === 'identify') {
			const identifier = payload.obj.userId
			// only send identify call if segment identify was called
			// with a user ID, since highlight identify requires a user ID.
			if (identifier?.length) {
				const identifyMetadata = payload.obj.traits
				window.H.identify(identifier, identifyMetadata)
			}
		}
	}

	next(payload)
}

interface HighlightWindow extends Window {
	H: HighlightPublicInterface
}

declare var window: HighlightWindow
