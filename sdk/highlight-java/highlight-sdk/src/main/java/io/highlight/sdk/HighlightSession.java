package io.highlight.sdk;

import io.highlight.sdk.common.HighlightSessionId;
import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.record.HighlightErrorRecord;
import io.highlight.sdk.common.record.HighlightLogRecord;
import io.highlight.sdk.common.record.HighlightRecord;
import io.highlight.sdk.exception.HighlightInvalidRecordException;

public record HighlightSession(String sessionId) implements HighlightSessionId {

	private void captureRecord(HighlightRecord.Builder record) {
		record.userSession(this);

		Highlight.captureRecord(record.build());
	}

	public void captureRecord(HighlightRecord record) {
		if (record instanceof HighlightLogRecord logRecord) {
			this.captureRecord(HighlightRecord.log(logRecord));
		} else if (record instanceof HighlightErrorRecord errorRecord) {
			this.captureRecord(HighlightRecord.error(errorRecord));
		} else {
			throw new HighlightInvalidRecordException("Invalid record type", record);
		}
	}

	public void captureException(Throwable error) {
		this.captureRecord(HighlightRecord.error()
				.throwable(error));
	}

	public void captureLog(Severity severity) {
		this.captureRecord(HighlightRecord.log()
				.severity(severity));
	}

	public void captureLog(Severity severity, String message) {
		this.captureRecord(HighlightRecord.log()
				.severity(severity)
				.message(message));
	}
}