package io.highlight.log.java;

import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;

import io.highlight.sdk.Highlight;
import io.highlight.sdk.common.HighlightAttributes;
import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.record.HighlightRecord;

public class HighlightLoggerHandler extends Handler {

	private final Highlight highlight;

	public HighlightLoggerHandler(Highlight highlight) {
		this.highlight = highlight;
	}

	@Override
	public void publish(LogRecord logRecord) {
		if (logRecord.getLevel() == Level.OFF) {
			return;
		}

		HighlightRecord.Builder<?> highlightRecord;
		Throwable throwable = logRecord.getThrown();
		if (throwable != null) {
			highlightRecord = HighlightRecord.error()
					.throwable(throwable)
					.timeOccured(logRecord.getInstant());
		} else {
			Severity severity;
			int logLevel = logRecord.getLevel().intValue();
			if (logLevel > 999) {
				severity = Severity.FATAL;
			} else if (logLevel > 899) {
				severity = Severity.WARN;
			} else {
				severity = Severity.INFO;
			}
			
			highlightRecord = HighlightRecord.log()
					.message(logRecord.getMessage())
					.timeOccured(logRecord.getInstant())
					.severity(severity);
		}

		highlightRecord.attributes(attribute -> attribute
				.put(HighlightAttributes.HIGHLIGHT_JAVA_LOGGER_NAME, logRecord.getLoggerName())
				.put(HighlightAttributes.HIGHLIGHT_JAVA_SEQUENCE_NUMBER, logRecord.getSequenceNumber())
				.put(HighlightAttributes.HIGHLIGHT_JAVA_SOURCE_CLASS_NAME, logRecord.getSourceClassName())
				.put(HighlightAttributes.HIGHLIGHT_JAVA_SOURCE_METHOD_NAME, logRecord.getSourceMethodName())
				.put(HighlightAttributes.HIGHLIGHT_JAVA_THREAD_ID, logRecord.getLongThreadID()));

		this.highlight.capture(highlightRecord.build());
	}

	@Override
	public void flush() {
	}

	@Override
	public void close() throws SecurityException {
	}
}