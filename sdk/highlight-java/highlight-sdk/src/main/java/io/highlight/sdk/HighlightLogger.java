package io.highlight.sdk;

import io.highlight.sdk.common.HighlightAttributes;
import io.highlight.sdk.common.HighlightOptions;
import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.record.HighlightLogRecord;
import io.opentelemetry.api.logs.LogRecordBuilder;
import io.opentelemetry.api.logs.Logger;

public class HighlightLogger {

	private final String projectId;

	private final Logger logger;

	HighlightLogger(Highlight highlight) {
		HighlightOptions options = highlight.getOptions();
		this.projectId = options.projectId();

		HighlightOpenTelemetry openTelemetry = highlight.getOpenTelemetry();
		this.logger = openTelemetry.getLogger("highlight-node");
	}

	public void process(HighlightLogRecord record) {
		Severity severity = record.getSeverity();

		LogRecordBuilder builder = this.logger.logRecordBuilder()
			.setAttribute(HighlightAttributes.HIGHLIGHT_PROJECT_ID, this.projectId)
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