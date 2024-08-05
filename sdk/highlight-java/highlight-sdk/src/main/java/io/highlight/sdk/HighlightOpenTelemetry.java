package io.highlight.sdk;

import java.time.Duration;
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

/**
 * Represents an OpenTelemetry instance that is used to create and manage spans
 * and logs.
 */
public class HighlightOpenTelemetry implements OpenTelemetry {

	private final SdkTracerProvider tracerProvider;
	private final SdkLoggerProvider loggerProvider;

	/**
	 * Creates a new instance of {@code HighlightOpenTelemetry} with the given
	 * {@code Highlight} instance.
	 * 
	 * @param highlight the {@code Highlight} instance used to configure the
	 *                  OpenTelemetry instance
	 */
	HighlightOpenTelemetry(Highlight highlight) {
		HighlightOptions options = highlight.getOptions();

		AttributesBuilder attributesBuilder = Attributes.builder()
				.put(HighlightAttributes.HIGHLIGHT_PROJECT_ID, options.projectId())
				.put(ResourceAttributes.DEPLOYMENT_ENVIRONMENT, options.enviroment())
				.put(ResourceAttributes.SERVICE_INSTANCE_ID, SessionId.get().toString())
				.put(ResourceAttributes.SERVICE_VERSION, options.version());

		if (options.serviceName() != null) {
			attributesBuilder.put(ResourceAttributes.SERVICE_NAME, options.serviceName());
		}

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
				.setCompression("gzip")
				.setTimeout(Duration.ofSeconds(30))
				.build();

		BatchSpanProcessor tracerProcessor = BatchSpanProcessor.builder(tracerExporter)
				.setExporterTimeout(Duration.ofSeconds(30))
		        .setScheduleDelay(Duration.ofSeconds(1))
		        .setMaxExportBatchSize(128)
		        .setMaxQueueSize(1024)
				.build();

		this.tracerProvider = SdkTracerProvider.builder()
				.addSpanProcessor(tracerProcessor)
				.setSampler(Sampler.alwaysOn())
				.setResource(resource)
				.build();

		// Log
		LogRecordExporter logExporter = OtlpHttpLogRecordExporter.builder()
				.setEndpoint(HighlightRoute.buildLogRoute(options.backendUrl()))
				.setCompression("gzip")
				.setTimeout(Duration.ofSeconds(30))
				.build();

		LogRecordProcessor logProcessor = BatchLogRecordProcessor.builder(logExporter)
				.setExporterTimeout(Duration.ofSeconds(30))
				.setScheduleDelay(Duration.ofSeconds(1))
				.setMaxExportBatchSize(128)
				.setMaxQueueSize(1024)
				.build();

		this.loggerProvider = SdkLoggerProvider.builder()
				.addLogRecordProcessor(logProcessor)
				.setResource(resource)
				.build();
	}

	/**
	 * Returns a {@code Logger} instance with the given instrumentation scope name.
	 * 
	 * @param instrumentationScopeName the name of the instrumentation scope
	 * @return a {@code Logger} instance
	 */
	public Logger getLogger(String instrumentationScopeName) {
		return this.loggerProvider.get(instrumentationScopeName);
	}

	/**
	 * Returns the {@code TracerProvider} instance associated with this
	 * OpenTelemetry instance.
	 * 
	 * @return the {@code TracerProvider} instance
	 */
	@Override
	public TracerProvider getTracerProvider() {
		return this.tracerProvider;
	}

	/**
	 * Returns the {@code SdkLoggerProvider} instance associated with this
	 * OpenTelemetry instance.
	 * 
	 * @return the {@code SdkLoggerProvider} instance
	 */
	public SdkLoggerProvider getLoggerProvider() {
		return this.loggerProvider;
	}

	/**
	 * Returns a noop {@code ContextPropagators} instance that is used to propagate
	 * context between threads and processes.
	 * 
	 * @return a {@code ContextPropagators} instance
	 */
	@Override
	public ContextPropagators getPropagators() {
		return ContextPropagators.noop();
	}

	/**
	 * Shuts down this OpenTelemetry instance and releases any resources associated
	 * with it.
	 * 
	 * @return a {@code CompletableResultCode} indicating whether the shutdown was
	 *         successful
	 */
	public CompletableResultCode shutdown() {
		return CompletableResultCode.ofAll(Arrays.asList(
				this.tracerProvider.shutdown(),
				this.loggerProvider.shutdown()));
	}
}
