package io.highlight.sdk.common.record;

import java.time.Instant;
import java.util.function.Consumer;

import io.highlight.sdk.common.HighlightHeader;
import io.highlight.sdk.common.HighlightSessionId;
import io.highlight.sdk.common.Severity;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;

/**
 * Represents a record.
 *
 * <p>
 * A {@link HighlightRecord} class contains information about a timestamp,
 * including attributes for own declarations, and a trace id. It can also
 * contains a session id.
 * </p>
 *
 * <p>
 * Instances of this class are created using the static methods class.
 * </p>
 *
 * @see HighlightLogRecord
 * @see HighlightErrorRecord
 * @see Severity
 */
public class HighlightRecord {

	/**
	 * Returns a builder for creating a new error record.
	 *
	 * @return A builder for creating a new error record.
	 */
	public static HighlightErrorRecord.Builder error() {
		return new HighlightErrorRecord.Builder();
	}

	/**
	 * Returns a builder for creating a new error record based on an existing
	 * record.
	 *
	 * @param record The existing record to base the new record on.
	 * @return A builder for creating a new error record based on an existing
	 *         record.
	 */
	public static HighlightErrorRecord.Builder error(HighlightErrorRecord record) {
		return new HighlightErrorRecord.Builder(record);
	}

	/**
	 * Returns a builder for creating a new log record.
	 *
	 * @return A builder for creating a new log record.
	 */
	public static HighlightLogRecord.Builder log() {
		return new HighlightLogRecord.Builder();
	}

	/**
	 * Returns a builder for creating a new log record based on an existing record.
	 *
	 * @param record The existing record to base the new record on.
	 * @return A builder for creating a new log record based on an existing record.
	 */
	public static HighlightLogRecord.Builder log(HighlightLogRecord record) {
		return new HighlightLogRecord.Builder(record);
	}

	private final Instant timeOccured;
	private final Attributes attributes;

	private final HighlightSessionId userSession;
	private final String requestId;

	/**
	 * Constructs a new {@code HighlightRecord} instance.
	 *
	 * @param timeOccured the instant when the record occurred
	 * @param attributes  the attributes associated with the record
	 * @param userSession the user session associated with the record, may be
	 *                    {@code null}
	 * @param requestId   the ID of the request associated with the record, may be
	 *                    {@code null}
	 */
	HighlightRecord(Instant timeOccured, Attributes attributes, HighlightSessionId userSession, String requestId) {
		this.timeOccured = timeOccured;
		this.attributes = attributes;
		this.userSession = userSession;
		this.requestId = requestId;
	}

	/**
	 * Constructs a new instance of {@link HighlightRecord} based on an existing
	 * {@link HighlightRecord}.
	 *
	 * @param record the existing {@link HighlightRecord} to use as the basis for
	 *               the new record
	 */
	HighlightRecord(HighlightRecord record) {
		this.timeOccured = record.getTimeOccured();
		this.attributes = record.attributes;
		this.userSession = record.userSession;
		this.requestId = record.requestId;
	}

	/**
	 * Returns the instant when the record occurred.
	 *
	 * @return the instant when the record occurred
	 */
	public Instant getTimeOccured() {
		return this.timeOccured;
	}

	/**
	 * Returns the attributes associated with the record.
	 *
	 * @return the attributes associated with the record
	 */
	public Attributes getAttributes() {
		return this.attributes;
	}

	/**
	 * Returns the user session associated with the record.
	 *
	 * @return the user session associated with the record, may be {@code null}
	 */
	public HighlightSessionId getUserSession() {
		return this.userSession;
	}

	/**
	 * Returns whether the record has a user session associated with it.
	 *
	 * @return {@code true} if the record has a user session, otherwise
	 *         {@code false}
	 */
	public boolean hasUserSession() {
		return this.userSession != null && this.userSession.sessionId() != null;
	}

	/**
	 * Returns the ID of the request associated with the record.
	 *
	 * @return the ID of the request associated with the record, may be {@code null}
	 */
	public String getRequestId() {
		return this.requestId;
	}

	/**
	 * Returns whether the record has an ID of the request associated with it.
	 *
	 * @return {@code true} if the record has an ID of the request, otherwise
	 *         {@code false}
	 */
	public boolean hasRequestId() {
		return this.requestId != null;
	}

	/**
	 * A builder class for creating instances of {@link HighlightRecord}.
	 */
	@SuppressWarnings("unchecked")
	public static class Builder<T extends Builder<T>> {

		private Instant timeOccured;

		private AttributesBuilder attributesBuilder = Attributes.builder();

		private HighlightSessionId userSession;
		private String requestId;

		/**
		 * Constructs a new instance of {@link Builder}.
		 */
		Builder() {
		}

		/**
		 * Constructs a new instance of {@link Builder} based on an existing
		 * {@link HighlightRecord}.
		 *
		 * @param record the existing {@link HighlightRecord} to use as the basis for
		 *               the new builder
		 */
		Builder(HighlightRecord record) {
			this.timeOccured = record.getTimeOccured();
			this.attributesBuilder.putAll(record.getAttributes());
			this.userSession = record.getUserSession();
			this.requestId = record.getRequestId();
		}

		/**
		 * Sets the time the record occurred.
		 *
		 * @param timeOccured the time the record occurred
		 * @return this {@link Builder} instance
		 */
		public T timeOccured(Instant timeOccured) {
			this.timeOccured = timeOccured;
			return (T) this;
		}

		/**
		 * Sets the user session and request id associated with the record.
		 *
		 * @param header the {@link HighlightHeader} associated with the record
		 * @return this {@link Builder} instance
		 */
		public T requestHeader(HighlightHeader header) {
			this.userSession(header.sessionId());
			this.requestId(header.requestId());
			return (T) this;
		}

		/**
		 * Sets the user session associated with the record using a session ID string.
		 *
		 * @param sessionId the session ID string to use as the user session ID
		 * @return this {@link Builder} instance
		 */
		public T userSession(String sessionId) {
			return this.userSession(sessionId != null && !sessionId.isBlank() ? () -> sessionId : null);
		}

		/**
		 * Sets the user session associated with the record.
		 *
		 * @param userSession the user session associated with the record
		 * @return this {@link Builder} instance
		 */
		public T userSession(HighlightSessionId userSession) {
			this.userSession = userSession;
			return (T) this;
		}

		/**
		 * Sets the request ID associated with the record.
		 *
		 * @param requestId the request ID associated with the record
		 * @return this {@link Builder} instance
		 */
		public T requestId(String requestId) {
			this.requestId = requestId != null && !requestId.isBlank() ? requestId : null;
			return (T) this;
		}

		/**
		 * Applies the specified consumer to the attributes builder.
		 *
		 * @param attributes the consumer to apply to the attributes builder
		 * @return this {@link Builder} instance
		 */
		public T attributes(Consumer<AttributesBuilder> attributes) {
			attributes.accept(this.attributesBuilder);
			return (T) this;
		}

		/**
		 * Builds a new instance of {@link HighlightRecord} using the values specified
		 * in the builder.
		 *
		 * @return a new instance of {@link HighlightRecord}
		 */
		public HighlightRecord build() {
			if (this.timeOccured == null) {
				this.timeOccured = Instant.now();
			}

			return new HighlightRecord(this.timeOccured, this.attributesBuilder.build(), this.userSession,
					this.requestId);
		}
	}
}
