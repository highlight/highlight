package io.highlight.sdk;

import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import io.highlight.sdk.common.HighlightOptions;
import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.record.HighlightErrorRecord;
import io.highlight.sdk.common.record.HighlightLogRecord;
import io.highlight.sdk.common.record.HighlightRecord;
import io.highlight.sdk.exception.HighlightInvalidRecordException;

public class Highlight {

	private static Highlight highlight = null;

	public static void init(String projectId, Consumer<HighlightOptions.Builder> handle) {
		HighlightOptions.Builder builder = HighlightOptions.builder(projectId);
		handle.accept(builder);

		HighlightOptions options = builder.build();
		Highlight.init(options);
	}

	public static void init(HighlightOptions options) {
		if (Highlight.highlight != null) {
			throw new IllegalAccessError("Highlight was already initialized");
		}

		Highlight.highlight = new Highlight(options);
	}

	public static boolean isInitialized() {
		return Highlight.highlight != null;
	}

	public static void captureException(Throwable throwable) {
		Objects.requireNonNull(Highlight.highlight, "Highlight instance is not initialized");

		Highlight.captureRecord(HighlightRecord.error()
				.throwable(throwable)
				.build());
	}

	public static void captureLog(Severity severity, String message) {
		Objects.requireNonNull(Highlight.highlight, "Highlight instance is not initialized");

		Highlight.captureRecord(HighlightRecord.log()
				.severity(severity)
				.message(message)
				.build());
	}

	public static void captureRecord(HighlightRecord record) {
		Objects.requireNonNull(Highlight.highlight, "Highlight instance is not initialized");

		Highlight.highlight.capture(record);
	}

//	public static void captureMetric() {
//		Objects.requireNonNull(Highlight.highlight, "Highlight instance is not initialized");
//	}
//
//	public static void flush() {
//		Objects.requireNonNull(Highlight.highlight, "Highlight instance is not initialized");
//	}

	private final HighlightOptions options;

	private final HighlightOpenTelemetry openTelemetry;
	private final HighlightTracer tracer;
	private final HighlightLogger logger;

	private Highlight(HighlightOptions options) {
		System.out.println("Highlight is initializing...");
		this.options = options;

		this.openTelemetry = new HighlightOpenTelemetry(this);
		this.tracer = new HighlightTracer(this);
		this.logger = new HighlightLogger(this);

		Runtime.getRuntime().addShutdownHook(new Thread(() -> {
			System.out.println("Highlight is shutting down...");
			long startTime = System.currentTimeMillis();

			this.openTelemetry.shutdown().join(10, TimeUnit.SECONDS);
			// TODO Throw errors when try to log after shutdown

			long finishedTime = System.currentTimeMillis() - startTime;
			System.out.println("Highlight was successfully shutted down in " + finishedTime + "ms.");
		}));

		System.out.println("Highlight was initialized.");
	}

	public void capture(HighlightRecord record) {
		if (record instanceof HighlightLogRecord logRecord) {
			this.logger.process(logRecord);
		} else if (record instanceof HighlightErrorRecord errorRecord) {
			this.tracer.process(errorRecord);
		} else {
			throw new HighlightInvalidRecordException("Invalid record type", record);
		}
	}

	public HighlightOptions getOptions() {
		return this.options;
	}

	public HighlightOpenTelemetry getOpenTelemetry() {
		return this.openTelemetry;
	}

	public HighlightTracer getTracer() {
		return this.tracer;
	}

	public HighlightLogger getLogger() {
		return this.logger;
	}
}
