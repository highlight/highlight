package io.highlight.sdk.exception;

import java.util.Objects;

import io.highlight.sdk.common.record.HighlightRecord;

/**
 * Thrown to indicate that an invalid Highlight record was passed as an
 * argument.
 */
public class HighlightInvalidRecordException extends IllegalArgumentException {

	private static final long serialVersionUID = -2870581816932052269L;

	private final HighlightRecord record;

	/**
	 * Constructs a new HighlightInvalidRecordException with the specified detail
	 * message and invalid record.
	 * 
	 * @param message the detail message.
	 * @param record  the invalid record.
	 */
	public HighlightInvalidRecordException(String message, HighlightRecord record) {
		super(message);
		this.record = record;
	}

	/**
	 * Returns the invalid record that caused the exception to be thrown.
	 * 
	 * @return the invalid record.
	 */
	public HighlightRecord getRecord() {
		return this.record;
	}

	/**
	 * Returns the hash code of this exception.
	 * 
	 * @return the hash code of this exception.
	 */
	@Override
	public int hashCode() {
		return Objects.hash(this.record, super.hashCode());
	}

	/**
	 * Compares this exception with the specified object for equality.
	 * 
	 * @param obj the object to compare.
	 * @return true if this exception and the specified object are equal, false
	 *         otherwise.
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (this.getClass() != obj.getClass())
			return false;
		HighlightInvalidRecordException other = (HighlightInvalidRecordException) obj;
		return Objects.equals(this.record, other.record);
	}
}
