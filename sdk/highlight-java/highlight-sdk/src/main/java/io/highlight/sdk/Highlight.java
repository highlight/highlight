package io.highlight.sdk;

import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;

import io.highlight.sdk.common.HighlightOptions;
import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.record.HighlightErrorRecord;
import io.highlight.sdk.common.record.HighlightLogRecord;
import io.highlight.sdk.common.record.HighlightRecord;
import io.highlight.sdk.exception.HighlightIllegalStateException;
import io.highlight.sdk.exception.HighlightInvalidRecordException;

public class Highlight {

	private static Highlight highlight = null;

	public static void init(String projectId, Consumer<HighlightOptions.Builder> options) {
		HighlightOptions.Builder builder = HighlightOptions.builder(projectId);
		options.accept(builder);

		Highlight.init(builder.build());
	}

	public static void init(HighlightOptions options) {
		if (Highlight.highlight != null) {
			throw new HighlightIllegalStateException("Highlight is already initialized");
		}

		Highlight.highlight = new Highlight(options);
	}

	public static boolean isInitialized() {
		return Highlight.highlight != null;
	}

	public static void captureException(Throwable throwable) {
		Highlight.captureException(throwable, null, null);
	}

	public static void captureException(Throwable throwable, String sessionId, String requestId) {
		Objects.requireNonNull(Highlight.highlight, "Highlight instance is not initialized");

		Highlight.captureRecord(HighlightRecord.error()
				.throwable(throwable)
				.requestId(requestId)
				.userSession(sessionId)
				.build());
	}

	public static void captureLog(Severity severity, String message) {
		Objects.requireNonNull(Highlight.highlight, "Highlight instance is not initialized");

		Highlight.captureLog(severity, message, null, null);
	}

	public static void captureLog(Severity severity, String message, String sessionId, String requestId) {
		Objects.requireNonNull(Highlight.highlight, "Highlight instance is not initialized");

		Highlight.captureRecord(HighlightRecord.log()
				.severity(severity)
				.message(message)
				.requestId(requestId)
				.userSession(sessionId)
				.build());
	}

	public static void captureRecord(HighlightRecord.Builder<?> builder) {
		Highlight.captureRecord(builder.build());
	}

	public static void captureRecord(HighlightRecord record) {
		Objects.requireNonNull(Highlight.highlight, "Highlight instance is not initialized");

		Highlight.highlight.capture(record);
	}

	private final HighlightOptions options;

	private final HighlightOpenTelemetry openTelemetry;
	private final HighlightTracer tracer;
	private final HighlightLogger logger;

	private AtomicReference<State> state = new AtomicReference<>(State.INITIALIZE);

	private Highlight(HighlightOptions options) {
		System.out.println("Highlight is initializing...");
		this.options = options;

		this.openTelemetry = new HighlightOpenTelemetry(this);
		this.tracer = new HighlightTracer(this);
		this.logger = new HighlightLogger(this);

		Runtime.getRuntime().addShutdownHook(new Thread(() -> {
			System.out.println("Highlight is shutting down...");
			long startTime = System.currentTimeMillis();

			if (!this.state.compareAndSet(State.RUNNING, State.SHUTDOWN)) {
				System.out.println("Highlight is trying to force shutdown everyting because the currently state is invalid!");
			}

			if (this.openTelemetry != null) {
				this.openTelemetry.shutdown().join(10, TimeUnit.SECONDS);
			}

			long finishedTime = System.currentTimeMillis() - startTime;
			System.out.println("Highlight was successfully shut down in " + finishedTime + "ms.");
		}));

		this.state.compareAndSet(State.INITIALIZE, State.RUNNING);
		System.out.println("Highlight was initialized.");
	}

	public void capture(HighlightRecord record) {
		if (this.state.get() != State.RUNNING) {
			throw new HighlightIllegalStateException("Highlight state is not running");
		}

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

	private enum State {
		INITIALIZE,
		RUNNING,
		SHUTDOWN
	}
}
