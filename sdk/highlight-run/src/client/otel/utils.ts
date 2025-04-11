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
		setAttribute: (_key: string, _value: AttributeValue) => noopSpan,
		setAttributes: (_attributes: Attributes) => noopSpan,
		addEvent: (
			_name: string,
			_attributesOrStartTime?: Attributes | TimeInput,
			_startTime?: TimeInput,
		) => noopSpan,
		addLinks: (_links: Link[]) => noopSpan,
		setStatus: (_status: SpanStatus) => noopSpan,
		recordException: () => {},
		addLink: () => noopSpan,
		updateName: () => noopSpan,
		isRecording: () => false,
	}

	return noopSpan
}
