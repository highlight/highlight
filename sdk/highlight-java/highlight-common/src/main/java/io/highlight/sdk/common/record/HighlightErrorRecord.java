package io.highlight.sdk.common.record;

import io.highlight.sdk.common.Severity;

/**
 * Represents a error record.
 *
 * <p>
 * A error record is a specific type of {@link HighlightRecord} that contains
 * information about a thrown exception.
 * </p>
 *
 * <p>
 * Instances of this class are created using the {@link Builder} class.
 * </p>
 *
 * @see HighlightRecord
 * @see HighlightLogRecord
 * @see Severity
 */
public final class HighlightErrorRecord extends HighlightRecord {

	private final Throwable throwable;

	/**
	 * Constructs a new {@link HighlightErrorRecord} with the specified throwable
	 * based on {@link HighlightRecord}.
	 *
	 * @param record    the record
	 * @param throwable the throwable of the log record
	 */
	private HighlightErrorRecord(HighlightRecord record, Throwable throwable) {
		super(record);
		this.throwable = throwable;
	}

	/**
	 * Returns the throwable associated with the record.
	 *
	 * @return the throwable associated with the record
	 */
	public Throwable getThrowable() {
		return this.throwable;
	}

	/**
	 * Builder class for {@link HighlightErrorRecord}.
	 */
	public static class Builder extends HighlightRecord.Builder<Builder> {

		private Throwable throwable;

		/**
		 * Constructs a new instance of {@link Builder}.
		 */
		Builder() {
		}

		/**
		 * Constructs a new instance of {@link Builder} based on an existing
		 * {@link HighlightErrorRecord}.
		 *
		 * @param record the existing {@link HighlightErrorRecord} to use as the basis
		 *               for the new builder
		 */
		Builder(HighlightErrorRecord record) {
			super(record);
			this.throwable = record.getThrowable();
		}

		/**
		 * Sets the throwable that caused the error.
		 *
		 * @param throwable the throwable that caused the error.
		 * @return this builder instance.
		 */
		public Builder throwable(Throwable throwable) {
			this.throwable = throwable;
			return this;
		}

		/**
		 * Builds a new {@link HighlightErrorRecord} instance.
		 *
		 * @return the new instance.
		 */
		public HighlightErrorRecord build() {
			return new HighlightErrorRecord(super.build(), this.throwable);
		}
	}
}
