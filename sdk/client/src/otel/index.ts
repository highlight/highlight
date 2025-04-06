import * as api from '@opentelemetry/api';
import {
	CompositePropagator,
	W3CBaggagePropagator,
	W3CTraceContextPropagator,
} from '@opentelemetry/core';
import {
	Instrumentation,
	registerInstrumentations,
} from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { Resource } from '@opentelemetry/resources';
import {
	BatchSpanProcessor,
	ConsoleSpanExporter,
	ReadableSpan,
	SimpleSpanProcessor,
	StackContextManager,
	WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import * as SemanticAttributes from '@opentelemetry/semantic-conventions';
import { getResponseBody } from '../listeners/network-listener/utils/fetch-listener';
import {
	DEFAULT_URL_BLOCKLIST,
	sanitizeHeaders,
} from '../listeners/network-listener/utils/network-sanitizer';
import {
	shouldNetworkRequestBeRecorded,
	shouldNetworkRequestBeTraced,
} from '../listeners/network-listener/utils/utils';
import {
	BrowserXHR,
	getBodyThatShouldBeRecorded,
} from '../listeners/network-listener/utils/xhr-listener';
import {
	OTLPMetricExporterBrowser,
	OTLPTraceExporterBrowserWithXhrRetry,
	TraceExporterConfig,
} from './exporter';
import { UserInteractionInstrumentation } from './user-interaction';
import {
	MeterProvider,
	PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';

export type BrowserTracingConfig = {
	projectId: string | number;
	sessionSecureId: string;
	otlpEndpoint: string;
	backendUrl?: string;
	environment?: string;
	networkRecordingOptions?: any;
	serviceName?: string;
	tracingOrigins?: boolean | (string | RegExp)[];
	urlBlocklist?: string[];
	instrumentations?: any;
};

let providers: { tracerProvider?: WebTracerProvider; meterProvider?: MeterProvider } = {};
const RECORD_ATTRIBUTE = 'highlight.record';

export const setupBrowserTracing = (config: BrowserTracingConfig) => {
	if (providers.tracerProvider) return;

	const backendUrl = config.backendUrl || import.meta.env.REACT_APP_PUBLIC_GRAPH_URI || 'https://pub.highlight.io';
	const urlBlocklist = [...(config.networkRecordingOptions?.urlBlocklist ?? []), ...DEFAULT_URL_BLOCKLIST];
	const isDebug = import.meta.env.DEBUG === 'true';
	const environment = config.environment ?? 'production';

	const exporterOptions: TraceExporterConfig = {
		url: `${config.otlpEndpoint}/v1/traces`,
		concurrencyLimit: 100,
		timeoutMillis: 5000,
		compression: 'gzip' as any,
		keepAlive: true,
		httpAgentOptions: {
			timeout: 5000,
			keepAlive: true,
		},
	};
	const exporter = new OTLPTraceExporterBrowserWithXhrRetry(exporterOptions);
	const spanProcessor = new CustomBatchSpanProcessor(exporter, {
		maxExportBatchSize: 100,
		maxQueueSize: 1000,
		exportTimeoutMillis: exporterOptions.timeoutMillis,
		scheduledDelayMillis: exporterOptions.timeoutMillis,
	});

	const resource = new Resource({
		[SemanticAttributes.ATTR_SERVICE_NAME]: config.serviceName ?? 'highlight-browser',
		[SemanticAttributes.SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
		'highlight.project_id': config.projectId,
		'highlight.session_id': config.sessionSecureId,
	});

	providers.tracerProvider = new WebTracerProvider({
		resource,
		spanProcessors: isDebug ? [new SimpleSpanProcessor(new ConsoleSpanExporter()), spanProcessor] : [spanProcessor],
	});
	api.trace.setGlobalTracerProvider(providers.tracerProvider);

	const meterExporter = new OTLPMetricExporterBrowser({ ...exporterOptions, url: `${config.otlpEndpoint}/v1/metrics` });
	const reader = new PeriodicExportingMetricReader({
		exporter: meterExporter,
		exportIntervalMillis: exporterOptions.timeoutMillis,
		exportTimeoutMillis: exporterOptions.timeoutMillis,
	});
	providers.meterProvider = new MeterProvider({ resource, readers: [reader] });
	api.metrics.setGlobalMeterProvider(providers.meterProvider);

	let instrumentations: Instrumentation[] = [];
	if (config.instrumentations?.['@opentelemetry/instrumentation-document-load'] !== false) {
		instrumentations.push(new DocumentLoadInstrumentation());
	}
	if (config.instrumentations?.['@opentelemetry/instrumentation-user-interaction'] !== false) {
		instrumentations.push(new UserInteractionInstrumentation());
	}
	if (config.networkRecordingOptions?.enabled) {
		if (config.instrumentations?.['@opentelemetry/instrumentation-fetch'] !== false) {
			instrumentations.push(new FetchInstrumentation());
		}
		if (config.instrumentations?.['@opentelemetry/instrumentation-xml-http-request'] !== false) {
			instrumentations.push(new XMLHttpRequestInstrumentation());
		}
	}

	registerInstrumentations({ instrumentations });
	const contextManager = new StackContextManager();
	contextManager.enable();

	providers.tracerProvider.register({
		contextManager,
		propagator: new CompositePropagator({
			propagators: [
				new W3CBaggagePropagator(),
				new CustomTraceContextPropagator({
					backendUrl,
					otlpEndpoint: config.otlpEndpoint,
					tracingOrigins: config.tracingOrigins,
					urlBlocklist,
				}),
			],
		}),
	});
};

class CustomBatchSpanProcessor extends BatchSpanProcessor {
	onEnd(span: ReadableSpan): void {
		if (span.attributes[RECORD_ATTRIBUTE] === false) return;
		super.onEnd(span);
	}
}

class CustomTraceContextPropagator extends W3CTraceContextPropagator {
	private highlightEndpoints: string[];
	private tracingOrigins: BrowserTracingConfig['tracingOrigins'];
	private urlBlocklist: string[];

	constructor(config: any) {
		super();
		this.highlightEndpoints = [
			config.backendUrl,
			`${config.otlpEndpoint}/v1/traces`,
			`${config.otlpEndpoint}/v1/logs`,
			`${config.otlpEndpoint}/v1/metrics`,
		];
		this.tracingOrigins = config.tracingOrigins;
		this.urlBlocklist = config.urlBlocklist;
	}

	inject(context: api.Context, carrier: unknown, setter: api.TextMapSetter): void {
		const span = api.trace.getSpan(context);
		if (!span || !(span as any).attributes) return;
		const url = (span as unknown as ReadableSpan).attributes['http.url'];
		if (typeof url === 'string') {
			if (!shouldNetworkRequestBeRecorded(url, this.highlightEndpoints, this.tracingOrigins, this.urlBlocklist)) {
				span.setAttribute(RECORD_ATTRIBUTE, false);
			}
			if (!shouldNetworkRequestBeTraced(url, this.tracingOrigins ?? [], this.urlBlocklist)) {
				return;
			}
		}
		super.inject(context, carrier, setter);
	}
}

export const BROWSER_TRACER_NAME = 'highlight-browser';
export const BROWSER_METER_NAME = BROWSER_TRACER_NAME;
export const getTracer = () => providers.tracerProvider?.getTracer(BROWSER_TRACER_NAME);
export const getMeter = () => providers.meterProvider?.getMeter(BROWSER_METER_NAME);
export const getActiveSpan = () => api.trace.getActiveSpan();
export const getActiveSpanContext = () => api.context.active();

export const shutdown = async () => {
	await providers.tracerProvider?.shutdown();
	await providers.meterProvider?.shutdown();
};