package io.highlight.sdk.common.record;

import java.util.Objects;

import io.highlight.sdk.common.Severity;

/**
 * Represents a log record.
 *
 * <p>
 * A log record is a specific type of {@link HighlightRecord} that contains
 * information about a log message, including the severity of the message.
 * </p>
 *
 * <p>
 * Instances of this class are created using the {@link Builder} class.
 * </p>
 *
 * @see HighlightRecord
 * @see HighlightErrorRecord
 * @see Severity
 */
public class HighlightLogRecord extends HighlightRecord {

	private final Severity severity;
	private final String message;

	/**
	 * Constructs a new {@link HighlightLogRecord} with the specified severity and
	 * message based on {@link HighlightRecord}.
	 *
	 * @param record   the record
	 * @param severity the severity of the log record
	 * @param message  the message of the log record
	 */
	private HighlightLogRecord(HighlightRecord record, Severity severity, String message) {
		super(record);
		this.severity = severity;
		this.message = message;
	}

	/**
	 * Returns the severity level associated with the log.
	 *
	 * @return the severity level associated with the log
	 */
	public Severity getSeverity() {
		return this.severity;
	}

	/**
	 * Returns the log message associated with the record.
	 *
	 * @return the log message associated with the record
	 */
	public String getMessage() {
		return this.message;
	}

	/**
	 * Builder class for {@link HighlightLogRecord}.
	 */
	public static class Builder extends HighlightRecord.Builder {

		private Severity severity;
		private String message;

		/**
		 * Constructs a new instance of {@link Builder}.
		 */
		Builder() {
		}

		/**
		 * Constructs a new instance of {@link Builder} based on an existing
		 * {@link HighlightLogRecord}.
		 *
		 * @param record the existing {@link HighlightLogRecord} to use as the basis for
		 *               the new builder
		 */
		Builder(HighlightLogRecord record) {
			super(record);
			this.severity = record.getSeverity();
			this.message = record.getMessage();
		}

		/**
		 * Sets the severity of the log record.
		 *
		 * @param severity the severity of the log record.
		 * @return this builder instance.
		 */
		public Builder severity(Severity severity) {
			this.severity = severity;
			return this;
		}

		/**
		 * Sets the message of the log record.
		 *
		 * @param message the message of the log record.
		 * @return this builder instance.
		 */
		public Builder message(String message) {
			this.message = message;
			return this;
		}

		/**
		 * Builds a new {@link HighlightLogRecord} instance.
		 *
		 * @return the new instance.
		 */
		public HighlightLogRecord build() {
			Objects.requireNonNull(this.severity, "Severity can't be null");
			Objects.requireNonNullElse(this.message, this.severity.text());

			if (this.message == null) {
				this.message = this.severity.text();
			}

			return new HighlightLogRecord(super.build(), this.severity, this.message);
		}
	}
}
