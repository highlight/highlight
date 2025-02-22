---
title: How to instrument your React Native app with OpenTelemetry
createdAt: 2025-01-22T12:00:00.000Z
readingTime: 18
authorFirstName: Spencer
authorLastName: Amarantides
authorTitle: Engineer @ Highlight
authorTwitter: ''
authorLinkedIn: 'https://www.linkedin.com/in/spencer-amarantides/'
authorGithub: 'https://github.com/SpennyNDaJets'
authorPFP: 'https://avatars.githubusercontent.com/u/17744174?v=4'
authorWebsite: ''
tags: 'Engineering, Frontend, OpenTelemetry'
metaTitle: How to instrument your React Native app with OpenTelemetry
---

```hint
Highlight.io is an [open source](https://github.com/highlight/highlight) monitoring platform. If you're interested in learning more, get started at [highlight.io](https://highlight.io). Check out the React Native [example app](https://github.com/highlight/highlight/tree/main/e2e/react-native) and [Highlight code snippets](https://github.com/highlight/highlight/blob/main/e2e/react-native/app/highlight.ts) to follow along.
```

OpenTelemetry is an open-source observability framework that provides tools, APIs, and SDKs to collect, process, and export telemetry data like traces, metrics, and logs from applications. It is designed to help developers monitor and troubleshoot distributed systems by providing standardized data formats and integration points for observability tools. If you're new to OpenTelemetry, you can learn more about it [here](https://www.youtube.com/watch?v=ASgosEzG4Pw).


Today, we'll go through a guide to using OpenTelemetry in React Native, including the high-level concepts as well as how to send traces, errors, and logs to your OpenTelemetry backend of choice.

### **Provider**

A provider is the API entry point that holds the configuration for telemetry data. The provider is responsible for setting up the environment and ensuring that all necessary configurations are in place. This can include configuring a vendor specific api key, or something as simple as setting the service name and environment. In our case, we will be using a `TraceProvider` to send traces that will be processed by the Highlight backend and converted to logs, errors, and traces.

In our example, the `TracerProvider` creates a resource, that builds attributes that we want to include with every trace. This includes the `highlight.project_id` to let Highlight know which project the traces below to, and other identifying data, such as service name and environment to help with monitoring and debugging.

Here's a quick example of what this looks like in code:

```typescript
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base'
import { Resource } from '@opentelemetry/resources'

const resource = new Resource({
	'highlight.project_id': '<YOUR_PROJECT_ID>',
	'service.name': 'reactnativeapp',
  'environment': 'production',
})

const tracerProvider = new BasicTracerProvider({ resource })
```

### **Exporter**

An exporter sends the telemetry data to the backend. This is where you configure the endpoint and any other necessary settings related to the backend you're sending data to. In our example, we built a custom exporter as a workaround to some OpenTelemetry package issues with the React Native's bundler, Metro. A bundler-based solution is also in progress to use OpenTelemetry's [OTLPTraceExporter](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http), and substitute out our custom exporter.

Here's an example of how you might build a custom React Native exporter class that serializes and sends traces over http. Notice the majority of logic is serializing the batched spans:

```typescript
import {
	SpanExporter,
	ReadableSpan,
	TimedEvent,
} from '@opentelemetry/sdk-trace-base'
import type { Link, Attributes } from '@opentelemetry/api'
import { ExportResultCode } from '@opentelemetry/core'

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
```

After we build our exporter, we need to create an instance with the correct url to send the traces. This is done in the example below:

```typescript
const otlpExporter = new ReactNativeOTLPTraceExporter({
	url: 'https://otel.highlight.io:4318/v1/traces',
})
```

### **Processor**

Finally, a processor defines any pre-processing that should be done on the created traces, such as batching, sampling, filtering or even enriching data. This is important because you may have specific needs on the machine that you're sending data from that require customization. In our example, we will use a `BatchSpanProcessor` to collect spans in batches and send them to the exporter, which is more efficient than sending each span individually.

Here's how we initialized the `BatchSpanProcessor`, and registered the traceProvider:

```typescript
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'

tracerProvider.addSpanProcessor(new BatchSpanProcessor(otlpExporter))
tracerProvider.register()

export const tracer = tracerProvider.getTracer('react-native-tracer')
```

<BlogCallToAction />

## **Instrumenting your application**

After we created our tracer, we can now use it to send Highlight.io traces, logs, and errors. We can also monkeypatch javascript's `console` methods, so they will send to Highlight by default.

### Tracing

Tracing is possible by calling the created `tracer`'s `startSpan` method. This accepts a parameter for the name of the span, and returns the span itself. From there, the span can record an error, add attributes, and much more. We will signal the end of a span by calling the `end` method.

Here is an example, assuming the `tracer` is exportable from a file called `highlight.ts`:

```typescript
import { tracer } from "./highlight"

const span = H.tracer.startSpan('Blog Post')
// ...some code
span.setAttributes({ name: "How to instrument your React Native app with OpenTelemetry" })
span.recordException(
  new Error('this is an error in the Blog Post span'),
)
span.end()
```

### Logging

Logging can be sent to Highlight with a few configurations to the trace method. First, the span name should be `highlight.log` to let the Highlight backend know it is, in fact, a log. Second, we will pass in a `log.severity` and a `log.message` attribute to be used when constructing the log object. It is recommended you set up a log function to complete this.

Here is an example of a log function below:

```typescript
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
```

The benefit of using this log function is being able to pass in attributes more cleanly to be searched across in Highlight. However, this will only send to Highlight and will not be recorded in the dev tools. We will set up the monkeypatch to record `console` logs later. After you have created your function, you can export this function to be called in your application code.

```typescript
import { log } from "./highlight"

log("warn", "we are almost finished", { minutesRead: 10 })
```

### Errors

In our solution, errors are also sent via traces to Highlight with some configuration details. Again, we will call the trace `highlight.log` to ensure this trace will create a log for you in Highlight. Second, we will record an exception and add any attributes to the span.

Here is an example of a error function below:

```typescript
export const error = (message: string, attributes = {}) => {
	const span = tracer.startSpan('highlight.log')
	span.recordException(new Error(message), new Date())
	span.setAttributes(attributes)
	span.end()
}
```

Again, the benefit of using this error function is flexibility of passing in a custom error name as well as attributes associated with the error. Monkeypatching the `console` method will send any `error` logs to Highlight which will then be processed as an error. After you have created your function, you can export this function to be called in your application code.

```typescript
import { error } from "./highlight"

error("user unset", { defaultAvatar: "batman" })
```

### Autoinstrumentation of console functions

The functions above are great for flexibility and customization, but maybe all you want is to report what is happening in the console to Highlight. We have you covered. We created a hook to call in your code that will monkeypatch the `console` methods to send to Highlight in addition to printing in the console dev tools. This should be called on app load or early on in the lifecycle of the session.

Here is an example of how to monkeypatch the `console` methods:

```typescript
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
```

In this function, we overwrite the console function if it has not been overwritten yet. It will then process the data, determine if its an error, and call the log function from above. There is some additional logic to safely stringify any data without going to deep into recursion.

Finally, this can be called in your application to start recording console data to Highlight:

```typescript
import { hookConsole } from "./highlight"
import { useEffect } from "react"

// within component
useEffect(() => {
  hookConsole()
}, [])

console.log("I'm sending to Highlight")
```

## **Conclusion**

In this guide, we've gone through everything you need to use OpenTelemetry in React Native to be able to send Highlight your logs, traces, and errors. OpenTelemetry is flexible, so this solution is not the only one. Feel free to edit resources, methods, and classes to what works best for your application.

Check out the [example app](https://github.com/highlight/highlight/tree/main/e2e/react-native) and [Highlight code snippets](https://github.com/highlight/highlight/blob/main/e2e/react-native/app/highlight.ts).

If you have any questions, please feel free to reach out to us on [Twitter](https://twitter.com/highlight_io) or [Discord](https://highlight.io/community).
