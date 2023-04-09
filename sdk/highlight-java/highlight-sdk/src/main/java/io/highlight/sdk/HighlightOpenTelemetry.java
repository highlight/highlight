package io.highlight.sdk;

import java.util.Arrays;

import io.highlight.sdk.common.HighlightAttributes;
import io.highlight.sdk.common.HighlightOptions;
import io.highlight.sdk.common.HighlightVersion;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;
import io.opentelemetry.api.logs.Logger;
import io.opentelemetry.api.trace.TracerProvider;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.exporter.otlp.http.logs.OtlpHttpLogRecordExporter;
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter;
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

	HighlightOpenTelemetry(Highlight highlight) {
		HighlightOptions options = highlight.getOptions();

		AttributesBuilder attributesBuilder = Attributes.builder()
				.put(HighlightAttributes.HIGHLIGHT_PROJECT_ID, options.projectId())
				.put(ResourceAttributes.DEPLOYMENT_ENVIRONMENT, options.enviroment())
				.put(ResourceAttributes.SERVICE_INSTANCE_ID, SessionId.get().toString())
				.put(ResourceAttributes.SERVICE_VERSION, options.version());

		if (options.metric()) {
			attributesBuilder
				.put(ResourceAttributes.TELEMETRY_SDK_NAME, HighlightVersion.getSdkName())
				.put(ResourceAttributes.TELEMETRY_SDK_VERSION, HighlightVersion.getSdkVersion())
				.put(ResourceAttributes.TELEMETRY_SDK_LANGUAGE, HighlightVersion.getSdkLanguage())

				.put(HighlightAttributes.TELEMETRY_JAVA_VENDOR, HighlightVersion.getJavaVendor())
				.put(HighlightAttributes.TELEMETRY_JAVA_VERSION, HighlightVersion.getJavaVersion())
				.put(HighlightAttributes.TELEMETRY_JAVA_VERSION_DATE, HighlightVersion.getJavaVersionDate())

				.put(ResourceAttributes.OS_NAME, HighlightVersion.getOsName())
				.put(ResourceAttributes.OS_VERSION, HighlightVersion.getOsVersion())
				.put(ResourceAttributes.OS_TYPE, HighlightVersion.getOsArch());
		}

		attributesBuilder.putAll(options.defaultAttributes());

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
		return ContextPropagators.noop();
	}

	public CompletableResultCode shutdown() {
		return CompletableResultCode.ofAll(Arrays.asList(
				this.tracerProvider.shutdown(),
				this.loggerProvider.shutdown()));
	}
}