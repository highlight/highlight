package io.highlight.sdk;

import java.util.Objects;

import io.highlight.sdk.common.HighlightSessionId;
import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.record.HighlightErrorRecord;
import io.highlight.sdk.common.record.HighlightLogRecord;
import io.highlight.sdk.common.record.HighlightRecord;
import io.highlight.sdk.exception.HighlightInvalidRecordException;

/**
 * The HighlightSession class is represents a session for capturing log records
 * and errors. <br>
 * It implements the HighlightSessionId interface which provides a unique
 * identifier for the session.
 */
public final class HighlightSession implements HighlightSessionId {
	private final String sessionId;

	/**
	 *
	 */
	public HighlightSession(String sessionId) {
		this.sessionId = sessionId;
	}

	/**
	 * Captures a record and add the current session ID.
	 *
	 * @param record The builder used to build the log record.
	 */
	public void captureRecord(HighlightRecord.Builder<?> record) {
		record.userSession(this);

		Highlight.captureRecord(record.build());
	}

	/**
	 * Captures the provided record. <br>
	 * If the record is a HighlightLogRecord, a log record will be captured. <br>
	 * If the record is a HighlightErrorRecord, an error record will be captured.
	 * <br>
	 * Otherwise, a HighlightInvalidRecordException will be thrown.
	 *
	 * @param record The record to be captured.
	 * @throws HighlightInvalidRecordException when the given class is invalid
	 */
	public void captureRecord(HighlightRecord record) {
		if (record instanceof HighlightLogRecord) {
			HighlightLogRecord logRecord = (HighlightLogRecord) record;
			this.captureRecord(HighlightRecord.log(logRecord));
		} else if (record instanceof HighlightErrorRecord) {
			HighlightErrorRecord errorRecord = (HighlightErrorRecord) record;
			this.captureRecord(HighlightRecord.error(errorRecord));
		} else {
			throw new HighlightInvalidRecordException("Invalid record type", record);
		}
	}

	/**
	 * Captures an error record for the provided throwable.
	 *
	 * @param error The throwable for which to capture an error record.
	 */
	public void captureException(Throwable error) {
		this.captureRecord(HighlightRecord.error().throwable(error));
	}

	/**
	 * Captures a log record with the provided severity.
	 *
	 * @param severity The severity of the log record to be captured.
	 */
	public void captureLog(Severity severity) {
		this.captureRecord(HighlightRecord.log().severity(severity));
	}

	/**
	 * Captures a log record with the provided severity and message.
	 *
	 * @param severity The severity of the log record to be captured.
	 * @param message  The message to be included in the log record.
	 */
	public void captureLog(Severity severity, String message) {
		this.captureRecord(HighlightRecord.log().severity(severity).message(message));
	}

	@Override
	public String sessionId() {
		return sessionId;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (!(obj instanceof HighlightSession)) {
			return false;
		}
		HighlightSession other = (HighlightSession) obj;
		return Objects.equals(sessionId, other.sessionId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(sessionId);
	}

	@Override
	public String toString() {
		return "HighlightSession [sessionId=" + sessionId + "]";
	}

}