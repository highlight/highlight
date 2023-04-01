package io.highlight.sdk.common.record;

import java.util.Objects;

import io.highlight.sdk.common.Severity;

public class HighlightLogRecord extends HighlightRecord {

	private final Severity severity;
	private final String message;

	private HighlightLogRecord(HighlightRecord record, Severity severity, String message) {
		super(record);
		this.severity = severity;
		this.message = message;
	}

	public Severity getSeverity() {
		return this.severity;
	}

	public String getMessage() {
		return this.message;
	}

	public static class Builder extends HighlightRecord.Builder {

		private Severity severity;
		private String message;

		Builder() {
		}

		Builder(HighlightLogRecord record) {
			super(record);
			this.severity = record.getSeverity();
			this.message = record.getMessage();
		}

		public Builder severity(Severity severity) {
			this.severity = severity;
			return this;
		}

		public Builder message(String message) {
			this.message = message;
			return this;
		}

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
