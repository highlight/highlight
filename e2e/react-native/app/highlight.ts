import {
	BatchSpanProcessor,
	BasicTracerProvider,
	SpanExporter,
	ReadableSpan,
	TimedEvent,
} from '@opentelemetry/sdk-trace-base'
import type { Link, Attributes } from '@opentelemetry/api'
import { ExportResultCode } from '@opentelemetry/core'
import { Resource } from '@opentelemetry/resources'

type KeyValue = {
	key: string
	value: KeyValue
}

class ReactNativeOTLPTraceExporter implements SpanExporter {
	url: string

	constructor(options: { url: string }) {
		this.url = options.url

		this._buildResourceSpans = this._buildResourceSpans.bind(this)
		this._convertEvent = this._convertEvent.bind(this)
		this._convertToOTLPFormat = this._convertToOTLPFormat.bind(this)
		this._convertLink = this._convertLink.bind(this)
		this._convertAttributes = this._convertAttributes.bind(this)
		this._convertKeyValue = this._convertKeyValue.bind(this)
		this._toAnyValue = this._toAnyValue.bind(this)
	}

	export(spans: ReadableSpan[], resultCallback: any) {
		fetch(this.url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: this._buildResourceSpans(spans),
		})
			.then(() => {
				resultCallback({ code: ExportResultCode.SUCCESS })
			})
			.catch((err) => {
				resultCallback({ code: ExportResultCode.FAILED, error: err })
			})
	}

	shutdown() {
		return Promise.resolve()
	}

	_buildResourceSpans(spans: ReadableSpan[] = []) {
		const resource = spans[0]?.resource
		const scope = spans[0]?.instrumentationLibrary

		return JSON.stringify({
			resourceSpans: [
				{
					resource: {
						attributes: resource.attributes
							? this._convertAttributes(resource.attributes)
							: [],
					},
					scopeSpans: [
						{
							scope: {
								name: scope?.name,
								version: scope?.version,
							},
							spans: spans.map(this._convertToOTLPFormat),
						},
					],
				},
			],
		})
	}

	_convertToOTLPFormat(span: ReadableSpan) {
		const spanContext = span.spanContext()
		const status = span.status

		return {
			traceId: spanContext.traceId,
			spanId: spanContext.spanId,
			parentSpanId: span.parentSpanId,
			traceState: spanContext.traceState?.serialize(),
			name: span.name,
			// Span kind is offset by 1 because the API does not define a value for unset
			kind: span.kind == null ? 0 : span.kind + 1,
			startTimeUnixNano: span.startTime[0] * 1e9 + span.startTime[1],
			endTimeUnixNano: span.endTime[0] * 1e9 + span.endTime[1],
			attributes: span.attributes
				? this._convertAttributes(span.attributes)
				: [],
			droppedAttributesCount: span.droppedAttributesCount || 0,
			events: span.events?.map(this._convertEvent) || [],
			droppedEventsCount: span.droppedEventsCount || 0,
			status: {
				code: status.code,
				message: status.message,
			},
			links: span.links?.map(this._convertLink) || [],
			droppedLinksCount: span.droppedLinksCount,
		}
	}

	_convertEvent(timedEvent: TimedEvent) {
		return {
			attributes: timedEvent.attributes
				? this._convertAttributes(timedEvent.attributes)
				: [],
			name: timedEvent.name,
			timeUnixNano: timedEvent.time[0] * 1e9 + timedEvent.time[1],
			droppedAttributesCount: timedEvent.droppedAttributesCount || 0,
		}
	}

	_convertLink(link: Link) {
		return {
			attributes: link.attributes
				? this._convertAttributes(link.attributes)
				: [],
			spanId: link.context.spanId,
			traceId: link.context.traceId,
			traceState: link.context.traceState?.serialize(),
			droppedAttributesCount: link.droppedAttributesCount || 0,
		}
	}

	_convertAttributes(attributes: Attributes) {
		return Object.keys(attributes).map((key) =>
			this._convertKeyValue(key, attributes[key]),
		)
	}

	_convertKeyValue(key: string, value: any): KeyValue {
		return {
			key: key,
			value: this._toAnyValue(value),
		}
	}

	_toAnyValue(value: any): any {
		const t = typeof value
		if (t === 'string') return { stringValue: value as string }
		if (t === 'number') {
			if (!Number.isInteger(value))
				return { doubleValue: value as number }
			return { intValue: value as number }
		}
		if (t === 'boolean') return { boolValue: value as boolean }
		if (value instanceof Uint8Array) return { bytesValue: value }
		if (Array.isArray(value))
			return { arrayValue: { values: value.map(this._toAnyValue) } }
		if (t === 'object' && value != null)
			return {
				kvlistValue: {
					values: Object.entries(value as object).map(([k, v]) =>
						this._convertKeyValue(k, v),
					),
				},
			}

		return {}
	}
}

// create tracer with resource
const resource = new Resource({
	'highlight.project_id': '1261',
	'service.name': 'reactnativeapp',
})
const tracerProvider = new BasicTracerProvider({ resource })
const otlpExporter = new ReactNativeOTLPTraceExporter({
	url: 'https://otel.highlight.io:4318/v1/traces',
})
tracerProvider.addSpanProcessor(new BatchSpanProcessor(otlpExporter))
tracerProvider.register()
export const tracer = tracerProvider.getTracer('react-native-tracer')

const ConsoleLevels = {
	debug: 'debug',
	info: 'info',
	log: 'info',
	count: 'info',
	dir: 'info',
	warn: 'warn',
	assert: 'warn',
	error: 'error',
	trace: 'trace',
} as const

// send logs via trace
export const log = (
	level: keyof typeof ConsoleLevels,
	message: string,
	attributes = {},
) => {
	const span = tracer.startSpan('highlight.log')
	span.addEvent(
		'log',
		{
			...attributes,
			['log.severity']: level,
			['log.message']: message,
		},
		new Date(),
	)
	span.end()
}

// send errors via trace
export const error = (message: string, attributes = {}) => {
	const span = tracer.startSpan('highlight.log')
	span.recordException(new Error(message), new Date())
	span.setAttributes(attributes)
	span.end()
}

// monkey patch console
type ConsoleFn = (...data: any) => void

let consoleHooked = false

export function hookConsole() {
	if (consoleHooked) return
	consoleHooked = true
	for (const [level, highlightLevel] of Object.entries(ConsoleLevels)) {
		const origWrite = console[level as keyof Console] as ConsoleFn
		;(console[level as keyof Console] as ConsoleFn) = function (
			...data: any[]
		) {
			try {
				return origWrite(...data)
			} finally {
				const o: { stack: any } = { stack: {} }
				Error.captureStackTrace(o)
				const message = data.map((o) =>
					typeof o === 'object' ? safeStringify(o) : o,
				)

				const attributes = data
					.filter((d) => typeof d === 'object')
					.reduce((a, b) => ({ ...a, ...b }), {})

				if (level === 'error') {
					attributes['exception.type'] = 'Error'
					attributes['exception.message'] = message.join('')
					attributes['exception.stacktrace'] = JSON.stringify(o.stack)
				}

				log(highlightLevel, message.join(' '), attributes)
			}
		}
	}
}

// https://stackoverflow.com/a/2805230
const MAX_RECURSION = 128

export function safeStringify(obj: any): string {
	function replacer(input: any, depth?: number): any {
		if ((depth ?? 0) > MAX_RECURSION) {
			throw new Error('max recursion exceeded')
		}
		if (input && typeof input === 'object') {
			for (const k in input) {
				if (typeof input[k] === 'object') {
					replacer(input[k], (depth ?? 0) + 1)
				} else if (!canStringify(input[k])) {
					input[k] = input[k].toString()
				}
			}
		}
		return input
	}

	function canStringify(value: any): boolean {
		try {
			JSON.stringify(value)
			return true
		} catch (e) {
			return false
		}
	}

	try {
		return JSON.stringify(replacer(obj))
	} catch (e) {
		return obj.toString()
	}
}
