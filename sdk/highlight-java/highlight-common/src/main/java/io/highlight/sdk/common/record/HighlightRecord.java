package io.highlight.sdk.common.record;

import java.time.Instant;
import java.util.function.Consumer;

import io.highlight.sdk.common.HighlightSessionId;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;

public class HighlightRecord {

	public static HighlightErrorRecord.Builder error() {
		return new HighlightErrorRecord.Builder();
	}

	public static HighlightErrorRecord.Builder error(HighlightErrorRecord record) {
		return new HighlightErrorRecord.Builder(record);
	}

	public static HighlightLogRecord.Builder log() {
		return new HighlightLogRecord.Builder();
	}

	public static HighlightLogRecord.Builder log(HighlightLogRecord record) {
		return new HighlightLogRecord.Builder(record);
	}

	private final Instant timeOccured;
	private final Attributes attributes;

	private final HighlightSessionId userSession;
	private final String requestId;

	HighlightRecord(Instant timeOccured, Attributes attributes, HighlightSessionId userSession, String requestId) {
		this.timeOccured = timeOccured;
		this.attributes = attributes;
		this.userSession = userSession;
		this.requestId = requestId;
	}

	HighlightRecord(HighlightRecord record) {
		this.timeOccured = record.getTimeOccured();
		this.attributes = record.attributes;
		this.userSession = record.userSession;
		this.requestId = record.requestId;
	}

	public Instant getTimeOccured() {
		return this.timeOccured;
	}

	public Attributes getAttributes() {
		return this.attributes;
	}

	public HighlightSessionId getUserSession() {
		return this.userSession;
	}

	public boolean hasUserSession() {
		return this.userSession != null;
	}

	public String getRequestId() {
		return this.requestId;
	}

	public boolean hasRequestId() {
		return this.requestId != null;
	}

	public static class Builder {

		private Instant timeOccured;

		private AttributesBuilder attributesBuilder = Attributes.builder();

		private HighlightSessionId userSession;
		private String requestId;

		Builder() {
		}

		Builder(HighlightRecord record) {
			this.timeOccured = record.getTimeOccured();
			this.attributesBuilder.putAll(record.getAttributes());
			this.userSession = record.getUserSession();
			this.requestId = record.getRequestId();
		}

		public Builder timeOccured(Instant timeOccured) {
			this.timeOccured = timeOccured;
			return this;
		}

		public Builder userSession(HighlightSessionId userSession) {
			this.userSession = userSession;
			return this;
		}

		public Builder requestId(String requestId) {
			this.requestId = requestId;
			return this;
		}

		public Builder attributes(Consumer<AttributesBuilder> handle) {
			handle.accept(this.attributesBuilder);
			return this;
		}

		public HighlightRecord build() {
			if (this.timeOccured == null) {
				this.timeOccured = Instant.now();
			}

			return new HighlightRecord(this.timeOccured, this.attributesBuilder.build(), this.userSession, this.requestId);
		}
	}
}
