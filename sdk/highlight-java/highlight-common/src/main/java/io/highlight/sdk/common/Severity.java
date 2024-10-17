package io.highlight.sdk.common;

import java.util.Objects;

/**
 * <p>
 * Represents the severity of a log message, along with its text and priority.
 * <br>
 * The severity can be one of TRACE, DEBUG, INFO, WARN, ERROR, or FATAL, and
 * each severity level can have an associated identifier and priority level.
 * </p>
 * <p>
 * See: <a href=
 * "https://opentelemetry.io/docs/reference/specification/logs/data-model/#severity-fields">severity-fields</a>
 */
public final class Severity {

	// ID values for the different severity levels.
	private static final int TRACE_ID = 1;
	private static final int DEBUG_ID = 5;
	private static final int INFO_ID = 9;
	private static final int WARN_ID = 13;
	private static final int ERROR_ID = 17;
	private static final int FATAL_ID = 21;

	// Predefined instances of Severity for each severity level.
	public static final Severity TRACE = Severity.trace(Priority.LOW);
	public static final Severity DEBUG = Severity.debug(Priority.LOW);
	public static final Severity INFO = Severity.info(Priority.LOW);
	public static final Severity WARN = Severity.warn(Priority.LOW);
	public static final Severity ERROR = Severity.error(Priority.LOW);
	public static final Severity FATAL = Severity.fatal(Priority.LOW);
	private final String text;
	private final int id;
	private final Priority priority;

	/**
	 *
	 */
	public Severity(String text, int id, Priority priority) {
		this.text = text;
		this.id = id;
		this.priority = priority;
	}

	/**
	 * Creates a new log message with severity level TRACE and the given text and a
	 * default low priority level.
	 *
	 * @param text the text of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity trace(String text) {
		return Severity.trace(text, Priority.LOW);
	}

	/**
	 * Creates a new log message with severity level TRACE and the given priority.
	 *
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity trace(Priority priority) {
		return Severity.trace(null, priority);
	}

	/**
	 * Creates a new log message with severity level TRACE and the given text and
	 * priority.
	 *
	 * @param text     the text of the log message, or null if not provided
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity trace(String text, Priority priority) {
		return new Severity(text, TRACE_ID, priority);
	}

	/**
	 * Creates a new log message with severity level DEBUG and the given text and a
	 * default low priority level.
	 *
	 * @param text the text of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity debug(String text) {
		return Severity.debug(text, Priority.LOW);
	}

	/**
	 * Creates a new log message with severity level DEBUG and the given priority.
	 *
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity debug(Priority priority) {
		return Severity.debug(null, priority);
	}

	/**
	 * Creates a new log message with severity level DEBUG and the given text and
	 * priority.
	 *
	 * @param text     the text of the log message, or null if not provided
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity debug(String text, Priority priority) {
		return new Severity(text, DEBUG_ID, priority);
	}

	/**
	 * Creates a new log message with severity level INFO and the given text and a
	 * default low priority level.
	 *
	 * @param text the text of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity info(String text) {
		return Severity.info(text, Priority.LOW);
	}

	/**
	 * Creates a new log message with severity level INFO and the given priority.
	 *
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity info(Priority priority) {
		return Severity.info(null, priority);
	}

	/**
	 * Creates a new log message with severity level INFO and the given text and
	 * priority.
	 *
	 * @param text     the text of the log message, or null if not provided
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity info(String text, Priority priority) {
		return new Severity(text, INFO_ID, priority);
	}

	/**
	 * Creates a new log message with severity level WARN and the given text and a
	 * default low priority level.
	 *
	 * @param text the text of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity warn(String text) {
		return Severity.warn(text, Priority.LOW);
	}

	/**
	 * Creates a new log message with severity level WARN and the given priority.
	 *
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity warn(Priority priority) {
		return Severity.warn(null, priority);
	}

	/**
	 * Creates a new log message with severity level WARN and the given text and
	 * priority.
	 *
	 * @param text     the text of the log message, or null if not provided
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity warn(String text, Priority priority) {
		return new Severity(text, WARN_ID, priority);
	}

	/**
	 * Creates a new log message with severity level ERROR and the given text and a
	 * default low priority level.
	 *
	 * @param text the text of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity error(String text) {
		return Severity.error(text, Priority.LOW);
	}

	/**
	 * Creates a new log message with severity level ERROR and the given priority.
	 *
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity error(Priority priority) {
		return Severity.error(null, priority);
	}

	/**
	 * Creates a new log message with severity level ERROR and the given text and
	 * priority.
	 *
	 * @param text     the text of the log message, or null if not provided
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity error(String text, Priority priority) {
		return new Severity(text, ERROR_ID, priority);
	}

	/**
	 * Creates a new log message with severity level FATAL and the given text and a
	 * default low priority level.
	 *
	 * @param text the text of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity fatal(String text) {
		return Severity.fatal(text, Priority.LOW);
	}

	/**
	 * Creates a new log message with severity level FATAL and the given priority.
	 *
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity fatal(Priority priority) {
		return Severity.fatal(null, priority);
	}

	/**
	 * Creates a new log message with severity level FATAL and the given text and
	 * priority.
	 *
	 * @param text     the text of the log message, or null if not provided
	 * @param priority the priority level of the log message
	 * @return a new instance of the Severity class with the given parameters
	 */
	public static Severity fatal(String text, Priority priority) {
		return new Severity(text, FATAL_ID, priority);
	}

	/**
	 * Return the severity level combined with the priority
	 *
	 * @return severity level with priority
	 */
	public int id() {
		return this.id + priority.difference;
	}

	/**
	 * Return a readable severity level name without the priority level
	 *
	 * @return severity level name
	 */
	public String name() {
		if (this.id == TRACE_ID) {
			return "TRACE";
		} else if (this.id == DEBUG_ID) {
			return "DEBUG";
		} else if (this.id == INFO_ID) {
			return "INFO";
		} else if (this.id == WARN_ID) {
			return "WARN";
		} else if (this.id == ERROR_ID) {
			return "ERROR";
		} else if (this.id == FATAL_ID) {
			return "FATAL";
		} else {
			throw new IllegalArgumentException("Unexpected value: " + this.id);
		}
	}

	/**
	 * Return a readable severity level name with the priority level
	 * <p>
	 * See: <a href=
	 * "https://opentelemetry.io/docs/reference/specification/logs/data-model/#displaying-severity">displaying-severity</a>
	 *
	 * @return severity level name
	 */
	public String shortName() {
		StringBuilder stringBuilder = new StringBuilder();
		stringBuilder.append(this.name());

		if (this.priority != Priority.LOW) {
			stringBuilder.append(this.priority.difference);
		}

		return stringBuilder.toString();
	}

	/**
	 * Transform the currently severity into the opentelemetry
	 * {@code io.opentelemetry.api.logs.Severity} class
	 *
	 * @return severity transformed into {@code io.opentelemetry.api.logs.Severity}
	 */
	public io.opentelemetry.api.logs.Severity toOpenTelemetry() {
		return io.opentelemetry.api.logs.Severity.values()[this.id];
	}

	public String text() {
		return text;
	}

	public Priority priority() {
		return priority;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (!(obj instanceof Severity)) {
			return false;
		}
		Severity other = (Severity) obj;
		return id == other.id && priority == other.priority && Objects.equals(text, other.text);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, priority, text);
	}

	@Override
	public String toString() {
		return "Severity [text=" + text + ", id=" + id + ", priority=" + priority + "]";
	}

	/**
	 * Represents the priority of a log message. The priority can be one of LOW,
	 * NORMAL, MEDIUM, or HIGH, and each priority level have an associated numeric
	 * difference value that is added to the severity ID when calculating the
	 * overall priority of a log message.
	 */
	public static enum Priority {
		/**
		 * LOW priority is the default one and represent a value from zero
		 */
		LOW(0),

		/**
		 * NORMAL priority represent a value from one
		 */
		NORMAL(1),

		/**
		 * MEDIUM priority represent a value from two
		 */
		MEDIUM(2),

		/**
		 * HIGH priority represent a value from three
		 */
		HIGH(3);

		final int difference;

		/**
		 * Constructs a new instance of Priority with the specified numeric difference
		 * value.
		 *
		 * @param difference the numeric difference value for this priority level
		 */
		private Priority(int difference) {
			this.difference = difference;
		}
	}
}