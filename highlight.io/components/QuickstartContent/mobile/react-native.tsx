import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

export const ReactNativeContent: QuickStartContent = {
	title: 'React Native',
	subtitle:
		'Learn how to set up highlight.io errors, logs, and traces in your React Native application using OpenTelemetry.',
	logoUrl: siteUrl('/images/quickstart/react.svg'),
	entries: [
		{
			title: 'Install the OpenTelemetry npm packages.',
			content:
				'Install the following npm packages from `@opentelemetry` in your terminal.',
			code: [
				{
					key: 'npm',
					text: `# with npm
npm install @opentelemetry/api @opentelemetry/core @opentelemetry/resources @opentelemetry/sdk-trace-base`,
					language: 'bash',
				},
				{
					key: 'yarn',
					text: `# with yarn
yarn add @opentelemetry/api @opentelemetry/core @opentelemetry/resources @opentelemetry/sdk-trace-base`,
					language: 'bash',
				},
				{
					key: 'pnpm',
					text: `# with pnpm
pnpm add @opentelemetry/api @opentelemetry/core @opentelemetry/resources @opentelemetry/sdk-trace-base`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Create the OpenTelemetry tracer.',
			content: `Some OpenTelemetry packages can't be used with the React Native's bundler, metro, due to some
browser compatibility issues. As a work around, we created a custom exporter to serialize the data. A bundler-based
solution is also in progress`,
			code: [
				{
					key: 'tracer',
					language: 'typescript',
					text: `// create tracer with resource
const resource = new Resource({
  "highlight.project_id": "YOUR_PROJECT_ID",
  // add more resource attributes here for every trace/log/error
  "service.name": "reactnativeapp"
  // see more in @opentelemetry/semantic-conventions
});
const tracerProvider = new BasicTracerProvider({resource})
const otlpExporter = new ReactNativeOTLPTraceExporter({
  url: 'https://otel.highlight.io:4318/v1/traces'
});
tracerProvider.addSpanProcessor(new BatchSpanProcessor(otlpExporter));
tracerProvider.register();
export const tracer = tracerProvider.getTracer('react-native-tracer');`,
				},
				{
					key: 'exporter',
					language: 'typescript',
					text: `import { BatchSpanProcessor, BasicTracerProvider, SpanExporter, ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base';
import type { Link, Attributes } from '@opentelemetry/api';
import { ExportResultCode } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';'

type KeyValue = {
  key: string;
  value: KeyValue
};

class ReactNativeOTLPTraceExporter implements SpanExporter {
  url: string;  

  constructor(options: { url: string; }) {
    this.url = options.url;

    this._buildResourceSpans = this._buildResourceSpans.bind(this);
    this._convertEvent = this._convertEvent.bind(this);
    this._convertToOTLPFormat = this._convertToOTLPFormat.bind(this);
    this._convertLink = this._convertLink.bind(this);
    this._convertAttributes = this._convertAttributes.bind(this);
    this._convertKeyValue = this._convertKeyValue.bind(this);
    this._toAnyValue = this._toAnyValue.bind(this);
  }

  export(spans: ReadableSpan[], resultCallback: any) {
    fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: this._buildResourceSpans(spans),
      })
      .then((resp) => {
        resultCallback({ code: ExportResultCode.SUCCESS });
      })
      .catch((err) => {
        resultCallback({ code: ExportResultCode.FAILED, error: err });
      });
  }

  shutdown() {
    return Promise.resolve();
  }

  _buildResourceSpans(spans: ReadableSpan[] = []) {
    const resource = spans[0]?.resource;

    return JSON.stringify({
      "resourceSpans": [
        {
          "resource": {
            "attributes": resource.attributes ? this._convertAttributes(resource.attributes) : [],
					},
          "scopeSpans": [
            {
              "scope": {
                "name": "@opentelemetry/instrumentation-http",
                "version": "0.41.0",
              },
              "spans": spans.map(this._convertToOTLPFormat),
            },
          ],
        },
      ],
    });
  }

  _convertToOTLPFormat(span: ReadableSpan) {
    const spanContext = span.spanContext();
    const status = span.status;

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
      attributes: span.attributes ? this._convertAttributes(span.attributes) : [],
      droppedAttributesCount: span.droppedAttributesCount || 0,
      events: span.events?.map(this._convertEvent) || [],
      droppedEventsCount: span.droppedEventsCount || 0,
      status: {
        code: status.code,
        message: status.message,
      },
      links: span.links?.map(this._convertLink) || [],
      droppedLinksCount: span.droppedLinksCount,
    };
  }

  _convertEvent(timedEvent: TimedEvent) {
    return {
      attributes: timedEvent.attributes
        ? this._convertAttributes(timedEvent.attributes)
        : [],
      name: timedEvent.name,
      timeUnixNano: timedEvent.time[0] * 1e9 + timedEvent.time[1],
      droppedAttributesCount: timedEvent.droppedAttributesCount || 0,
    };
  }

  _convertLink(link: Link) {
    return {
      attributes: link.attributes ? this._convertAttributes(link.attributes) : [],
      spanId: link.context.spanId,
      traceId: link.context.traceId,
      traceState: link.context.traceState?.serialize(),
      droppedAttributesCount: link.droppedAttributesCount || 0,
    };
  }

  _convertAttributes(attributes: Attributes) {
    return Object.keys(attributes).map(key => this._convertKeyValue(key, attributes[key]));
  }

  _convertKeyValue(key: string, value: any): KeyValue {
    return {
      key: key,
      value: this._toAnyValue(value),
    };
  }

  _toAnyValue(value: any): any {
    const t = typeof value;
    if (t === 'string') return { stringValue: value as string };
    if (t === 'number') {
      if (!Number.isInteger(value)) return { doubleValue: value as number };
      return { intValue: value as number };
    }
    if (t === 'boolean') return { boolValue: value as boolean };
    if (value instanceof Uint8Array) return { bytesValue: value };
    if (Array.isArray(value))
      return { arrayValue: { values: value.map(this._toAnyValue) } };
    if (t === 'object' && value != null)
      return {
        kvlistValue: {
          values: Object.entries(value as object).map(([k, v]) =>
            this._convertKeyValue(k, v)
          ),
        },
      };

    return {};
  }
}`,
				},
			],
		},
		{
			title: 'Create logging function',
			content: 'Send logs to highlight.io via creating a log trace.',
			code: [
				{
					key: 'logger',
					language: 'typescript',
					text: `type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

// send logs via trace
export const log = (level: LogLevel, message: string, attributes = {}) => {
    const span = tracer.startSpan('highlight.log')
    span.addEvent('log', {
      ...attributes,
	    ['log.severity']: level,
	    ['log.message']: message,
	}, new Date())
    span.end()
};`,
				},
			],
		},
		{
			title: 'Create error function',
			content: 'Send errors to highlight.io',
			code: [
				{
					key: 'error',
					language: 'typescript',
					text: `// send errors via trace
export const error = (message: string, attributes = {}) => {
    const span = tracer.startSpan('highlight.log')
    span.recordException(
      new Error(message),
      new Date(),
    )
    span.setAttributes(attributes)
    span.end()
};`,
				},
			],
		},
		{
			title: 'Execution of functions',
			content: 'Call the tracer, log, and error when needed',
			code: [
				{
					key: 'import',
					language: 'typescript',
					text: `import * as H from "[PATH TO HIGHLIGHT FILE]"`,
				},
				{
					key: 'trace',
					language: 'typescript',
					text: `const span = H.tracer.startSpan('Custom span name')
...
span.recordException(
  new Error('this is a otel tracer error'),
)
span.end()`,
				},
				{
					key: 'log',
					language: 'typescript',
					text: `H.log('WARN', 'Default sending information loaded', { sender: "spencer" })`,
				},
				{
					key: 'error',
					language: 'typescript',
					text: `H.error('Divide by 0 error', { numerator: 623 })`,
				},
			],
		},
		{
			title: 'Monkey patching console.log and errors',
			content:
				'More coming soon on how to best monkey patch console.log and errors, so they can be sent to highlight.io.',
		},
	],
}
