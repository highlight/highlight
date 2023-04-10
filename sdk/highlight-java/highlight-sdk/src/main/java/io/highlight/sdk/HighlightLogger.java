package io.highlight.sdk;

import io.highlight.sdk.common.HighlightAttributes;
import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.record.HighlightLogRecord;
import io.opentelemetry.api.logs.LogRecordBuilder;
import io.opentelemetry.api.logs.Logger;

/**
 * The HighlightLogger class is used to process log records
 */
public class HighlightLogger {

	private final Logger logger;

	/**
	 * Constructs a new HighlightLogger instance.
	 *
	 * @param highlight The Highlight instance.
	 */
	HighlightLogger(Highlight highlight) {
		HighlightOpenTelemetry openTelemetry = highlight.getOpenTelemetry();
		this.logger = openTelemetry.getLogger("highlight-java");
	}

	/**
	 * Processes the given {@link HighlightLogRecord}.
	 *
	 * @param record The HighlightLogRecord to process.
	 */
	public void process(HighlightLogRecord record) {
		Severity severity = record.getSeverity();

		LogRecordBuilder builder = this.logger.logRecordBuilder()
				.setAllAttributes(record.getAttributes())
				.setEpoch(record.getTimeOccured())
				.setSeverity(severity.toOpenTelemetry())
				.setSeverityText(severity.text())
				.setBody(record.getMessage());

		if (record.hasUserSession()) {
			builder.setAttribute(HighlightAttributes.HIGHLIGHT_SESSION_ID, record.getUserSession().sessionId());
		}

		if (record.hasRequestId()) {
			builder.setAttribute(HighlightAttributes.HIGHLIGHT_TRACE_ID, record.getRequestId());
		}

		builder.emit();
	}
}