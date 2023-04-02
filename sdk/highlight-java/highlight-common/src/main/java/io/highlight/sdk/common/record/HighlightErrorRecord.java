package io.highlight.sdk.common.record;

public class HighlightErrorRecord extends HighlightRecord {

	private final Throwable throwable;

	private HighlightErrorRecord(HighlightRecord record, Throwable throwable) {
		super(record);
		this.throwable = throwable;
	}

	public Throwable getThrowable() {
		return this.throwable;
	}

	public static class Builder extends HighlightRecord.Builder {

		private Throwable throwable;

		Builder() {
		}

		Builder(HighlightErrorRecord record) {
			this.throwable = record.getThrowable();
		}

		public Builder throwable(Throwable throwable) {
			this.throwable = throwable;
			return this;
		}

		public HighlightErrorRecord build() {
			return new HighlightErrorRecord(super.build(), this.throwable);
		}
	}
}
