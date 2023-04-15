package io.highlight.sdk;

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
public record HighlightSession(String sessionId) implements HighlightSessionId {

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
	 * @throws HighlightInvalidRecordException when the given class is invalid
	 * @param record The record to be captured.
	 */
	public void captureRecord(HighlightRecord record) {
		if (record instanceof HighlightLogRecord logRecord) {
			this.captureRecord(HighlightRecord.log(logRecord));
		} else if (record instanceof HighlightErrorRecord errorRecord) {
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
		this.captureRecord(HighlightRecord.error()
				.throwable(error));
	}

	/**
	 * Captures a log record with the provided severity.
	 *
	 * @param severity The severity of the log record to be captured.
	 */
	public void captureLog(Severity severity) {
		this.captureRecord(HighlightRecord.log()
				.severity(severity));
	}

	/**
	 * Captures a log record with the provided severity and message.
	 *
	 * @param severity The severity of the log record to be captured.
	 * @param message  The message to be included in the log record.
	 */
	public void captureLog(Severity severity, String message) {
		this.captureRecord(HighlightRecord.log()
				.severity(severity)
				.message(message));
	}
}