package io.highlight.sdk;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;

import io.highlight.sdk.common.HighlightHeader;
import io.highlight.sdk.common.HighlightOptions;
import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.record.HighlightErrorRecord;
import io.highlight.sdk.common.record.HighlightLogRecord;
import io.highlight.sdk.common.record.HighlightRecord;
import io.highlight.sdk.exception.HighlightIllegalStateException;
import io.highlight.sdk.exception.HighlightInvalidRecordException;

/**
 * The Highlight class is the main entry point for Highlight. <br>
 * It provides methods to initialize the library and capture logs and errors.
 */
public class Highlight {

	private static Highlight highlight = null;

	/**
	 * Check if highlight was initialized else throw a
	 * {@code HighlightIllegalStateException} exception
	 * 
	 * @throws HighlightIllegalStateException if Highlight is not initialized
	 */
	private static void requireInitialization() {
		if (!Highlight.isInitialized()) {
			throw new HighlightIllegalStateException("Highlight instance is not initialized");
		}
	}

	/**
	 * Initializes Highlight with the provided options and the given projectId.
	 * 
	 * @param projectId the projectId to use
	 * @param options   the options to use for initialization
	 * @throws HighlightIllegalStateException if Highlight is already initialized
	 */
	public static void init(String projectId, Consumer<HighlightOptions.Builder> options) {
		HighlightOptions.Builder builder = HighlightOptions.builder(projectId);
		options.accept(builder);

		Highlight.init(builder.build());
	}

	/**
	 * Initializes Highlight with the provided options.
	 * 
	 * @param options the options to use for initialization
	 * @throws HighlightIllegalStateException if Highlight is already initialized
	 */
	public static void init(HighlightOptions options) {
		if (Highlight.highlight != null) {
			throw new HighlightIllegalStateException("Highlight is already initialized");
		}

		Highlight.highlight = new Highlight(options);
	}

	/**
	 * Returns true if Highlight is already initialized.
	 * 
	 * @return true if Highlight is already initialized, false otherwise
	 */
	public static boolean isInitialized() {
		return Highlight.highlight != null;
	}

	/**
	 * Captures an exception and sends it to Highlight.
	 * 
	 * @param throwable the throwable to capture
	 * @throws HighlightIllegalStateException  if Highlight is not initialized
	 * @throws HighlightInvalidRecordException if the record is invalid
	 */
	public static void captureException(Throwable throwable) {
		Highlight.captureException(throwable, null, null);
	}

	/**
	 * Captures an exception and sends it to Highlight.
	 * 
	 * @param throwable the throwable to capture
	 * @param sessionId the session ID associated with the record
	 * @param requestId the request ID associated with the record
	 * @throws HighlightIllegalStateException  if Highlight is not initialized
	 * @throws HighlightInvalidRecordException if the record is invalid
	 */
	public static void captureException(Throwable throwable, String sessionId, String requestId) {
		Highlight.requireInitialization();

		Highlight.captureRecord(HighlightRecord.error()
				.throwable(throwable)
				.requestId(requestId)
				.userSession(sessionId)
				.build());
	}

	/**
	 * Captures an exception and sends it to Highlight.
	 * 
	 * @param throwable the throwable to capture
	 * @param header    the {@link HighlightHeader} associated with the record
	 * @throws HighlightIllegalStateException  if Highlight is not initialized
	 * @throws HighlightInvalidRecordException if the record is invalid
	 */
	public static void captureException(Throwable throwable, HighlightHeader header) {
		Highlight.requireInitialization();

		Highlight.captureRecord(HighlightRecord.error()
				.throwable(throwable)
				.requestHeader(header)
				.build());
	}

	/**
	 * Captures a log and sends it to Highlight.
	 * 
	 * @param severity the severity of the log
	 * @param message  the message to log
	 * @throws HighlightIllegalStateException  if Highlight is not initialized
	 * @throws HighlightInvalidRecordException if the record is invalid
	 */
	public static void captureLog(Severity severity, String message) {
		Highlight.requireInitialization();

		Highlight.captureLog(severity, message, null, null);
	}

	/**
	 * Captures a log and sends it to Highlight.
	 * 
	 * @param severity  the severity of the log
	 * @param message   the message to log
	 * @param sessionId the session ID associated with the record
	 * @param requestId the request ID associated with the record
	 * @throws HighlightIllegalStateException  if Highlight is not initialized
	 * @throws HighlightInvalidRecordException if the record is invalid
	 */
	public static void captureLog(Severity severity, String message, String sessionId, String requestId) {
		Highlight.requireInitialization();

		Highlight.captureRecord(HighlightRecord.log()
				.severity(severity)
				.message(message)
				.requestId(requestId)
				.userSession(sessionId)
				.build());
	}

	/**
	 * Captures a log and sends it to Highlight.
	 * 
	 * @param severity the severity of the log
	 * @param message  the message to log
	 * @param header   the {@link HighlightHeader} associated with the record
	 * @throws HighlightIllegalStateException  if Highlight is not initialized
	 * @throws HighlightInvalidRecordException if the record is invalid
	 */
	public static void captureLog(Severity severity, String message, HighlightHeader header) {
		Highlight.requireInitialization();

		Highlight
				.captureRecord(HighlightRecord.log()
						.severity(severity)
						.message(message)
						.requestHeader(header)
						.build());
	}

	/**
	 * Captures a record using a record builder and sends it to Highlight.
	 * 
	 * @param builder the builder to use for the record
	 * @throws HighlightIllegalStateException  if Highlight is not initialized
	 * @throws HighlightInvalidRecordException if the record is invalid
	 */
	public static void captureRecord(HighlightRecord.Builder<?> builder) {
		Highlight.captureRecord(builder.build());
	}

	/**
	 * Captures a record and sends it to Highlight.
	 * 
	 * @param record the record to capture
	 * @throws HighlightIllegalStateException  if Highlight is not initialized
	 * @throws HighlightInvalidRecordException if the record is invalid
	 */
	public static void captureRecord(HighlightRecord record) {
		Highlight.requireInitialization();

		Highlight.highlight.capture(record);
	}

	/**
	 * Return the currently initialized instance.
	 * 
	 * @return highlight instance
	 */
	public static Highlight getHighlight() {
		return Highlight.highlight;
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
				System.out.println(
						"Highlight is trying to force shutdown everyting because the currently state is invalid!");
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

		if (record instanceof HighlightLogRecord) {
			HighlightLogRecord logRecord = (HighlightLogRecord) record;
			this.logger.process(logRecord);
		} else if (record instanceof HighlightErrorRecord) {
			HighlightErrorRecord errorRecord = (HighlightErrorRecord) record;
			this.tracer.process(errorRecord);
		} else {
			throw new HighlightInvalidRecordException("Invalid record type", record);
		}
	}

	/**
	 * Returns the options.
	 * 
	 * @return the options
	 */
	public HighlightOptions getOptions() {
		return this.options;
	}

	/**
	 * 
	 * Returns the {@code HighlightOpenTelemetry}
	 * 
	 * @return the {@code HighlightOpenTelemetry} instance
	 */
	public HighlightOpenTelemetry getOpenTelemetry() {
		return this.openTelemetry;
	}

	/**
	 * 
	 * Returns the {@code HighlightTracer}
	 * 
	 * @return the {@code HighlightTracer} instance
	 */
	public HighlightTracer getTracer() {
		return this.tracer;
	}

	/**
	 * Returns the {@code HighlightLogger} instance.
	 * 
	 * @return the {@code HighlightLogger} instance
	 */
	public HighlightLogger getLogger() {
		return this.logger;
	}

	/**
	 * This class contains the currently highlight states.
	 */
	private enum State {
		INITIALIZE,
		RUNNING,
		SHUTDOWN
	}
}
