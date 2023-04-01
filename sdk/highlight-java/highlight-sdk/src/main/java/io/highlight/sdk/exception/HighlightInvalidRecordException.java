package io.highlight.sdk.exception;

import java.util.Objects;

import io.highlight.sdk.common.record.HighlightRecord;

public class HighlightInvalidRecordException extends IllegalArgumentException {

	private static final long serialVersionUID = -2870581816932052269L;

	private final HighlightRecord record;

	public HighlightInvalidRecordException(String message, HighlightRecord record) {
		super(message);
		this.record = record;
	}

	public HighlightRecord getRecord() {
		return this.record;
	}

	@Override
	public int hashCode() {
		return Objects.hash(record);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		HighlightInvalidRecordException other = (HighlightInvalidRecordException) obj;
		return Objects.equals(record, other.record);
	}

	@Override
	public String toString() {
		return "HighlightInvalidRecordException [record=" + record + "]";
	}
}
