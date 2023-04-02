package io.highlight.sdk;

import java.util.Arrays;

import io.highlight.sdk.common.HighlightAttributes;
import io.highlight.sdk.common.HighlightOptions;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;
import io.opentelemetry.api.logs.Logger;
import io.opentelemetry.api.trace.TracerProvider;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.exporter.otlp.http.logs.OtlpHttpLogRecordExporter;
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
import io.opentelemetry.extension.trace.propagation.B3Propagator;
import io.opentelemetry.sdk.common.CompletableResultCode;
import io.opentelemetry.sdk.logs.LogRecordProcessor;
import io.opentelemetry.sdk.logs.SdkLoggerProvider;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;
import io.opentelemetry.sdk.logs.export.LogRecordExporter;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.BatchSpanProcessor;
import io.opentelemetry.sdk.trace.export.SpanExporter;
import io.opentelemetry.sdk.trace.samplers.Sampler;
import io.opentelemetry.semconv.resource.attributes.ResourceAttributes;

public class HighlightOpenTelemetry implements OpenTelemetry {

	private final SdkTracerProvider tracerProvider;
	private final SdkLoggerProvider loggerProvider;

	private final ContextPropagators propagator;

	HighlightOpenTelemetry(Highlight highlight) {
		HighlightOptions options = highlight.getOptions();

		AttributesBuilder attributesBuilder = Attributes.builder()
				.put(HighlightAttributes.HIGHLIGHT_PROJECT_ID, options.projectId())
				.put(ResourceAttributes.TELEMETRY_SDK_LANGUAGE, "java") // TODO compile with maven
				.put(ResourceAttributes.TELEMETRY_SDK_NAME, "highlight") // TODO compile with maven
				.put(ResourceAttributes.TELEMETRY_SDK_VERSION, "1.0.0") // TODO compile with maven
				.put(ResourceAttributes.DEPLOYMENT_ENVIRONMENT, options.enviroment())
				.put(ResourceAttributes.SERVICE_VERSION, options.version())
				.putAll(options.defaultAttributes());

		Resource resource = Resource.create(attributesBuilder.build());

		// Tracer
		SpanExporter tracerExporter = OtlpHttpSpanExporter.builder()
				.setEndpoint(HighlightRoute.buildTraceRoute(options.backendUrl()))
				.build();

		BatchSpanProcessor tracerProcessor = BatchSpanProcessor.builder(tracerExporter)
				.build();

		this.tracerProvider = SdkTracerProvider.builder()
				.addSpanProcessor(tracerProcessor)
				.setSampler(Sampler.alwaysOn())
				.setResource(resource)
				.build();

		// Log
		LogRecordExporter logExporter = OtlpHttpLogRecordExporter.builder()
				.setEndpoint(HighlightRoute.buildLogRoute(options.backendUrl()))
				.build();

		LogRecordProcessor logProcessor = BatchLogRecordProcessor.builder(logExporter)
				.build();

		this.loggerProvider = SdkLoggerProvider.builder()
				.addLogRecordProcessor(logProcessor)
				.setResource(resource)
				.build();

		// Propagator
		TextMapPropagator textMapPropagator = TextMapPropagator.composite(
				B3Propagator.injectingMultiHeaders(),
                W3CTraceContextPropagator.getInstance());

		this.propagator = ContextPropagators.create(textMapPropagator);
	}

	public Logger getLogger(String instrumentationScopeName) {
		return this.loggerProvider.get(instrumentationScopeName);
	}

	@Override
	public TracerProvider getTracerProvider() {
		return this.tracerProvider;
	}

	public SdkLoggerProvider getLoggerProvider() {
		return this.loggerProvider;
	}

	@Override
	public ContextPropagators getPropagators() {
		return this.propagator;
	}

	public CompletableResultCode shutdown() {
		return CompletableResultCode.ofAll(Arrays.asList(
				this.tracerProvider.shutdown(),
				this.loggerProvider.shutdown()));
	}
}