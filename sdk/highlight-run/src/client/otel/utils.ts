import {
	Attributes,
	AttributeValue,
	Link,
	Span,
	SpanStatus,
	TimeInput,
} from '@opentelemetry/api'

export const getNoopSpan = () => {
	const noopSpan: Span = {
		end: () => {},
		spanContext: () => ({
			traceId: '',
			spanId: '',
			traceFlags: 0,
		}),
		setAttribute: (key: string, value: AttributeValue) => noopSpan,
		setAttributes: (attributes: Attributes) => noopSpan,
		addEvent: (
			name: string,
			attributesOrStartTime?: Attributes | TimeInput,
			startTime?: TimeInput,
		) => noopSpan,
		addLinks: (links: Link[]) => noopSpan,
		setStatus: (status: SpanStatus) => noopSpan,
		recordException: () => {},
		addLink: () => noopSpan,
		updateName: () => noopSpan,
		isRecording: () => false,
	}

	return noopSpan
}
