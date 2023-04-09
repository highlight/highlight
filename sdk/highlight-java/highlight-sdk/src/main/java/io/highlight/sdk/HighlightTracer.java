package io.highlight.sdk;

import java.time.Instant;

import io.highlight.sdk.common.HighlightAttributes;
import io.highlight.sdk.common.HighlightOptions;
import io.highlight.sdk.common.record.HighlightErrorRecord;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;

public class HighlightTracer {

	private final String projectId;

	private final Tracer tracer;

	HighlightTracer(Highlight highlight) {
		HighlightOptions options = highlight.getOptions();
		this.projectId = options.projectId();

		HighlightOpenTelemetry openTelemetry = highlight.getOpenTelemetry();
		this.tracer = openTelemetry.getTracer("highlight-java");
	}

	public void process(HighlightErrorRecord record) {
		Span span = this.tracer.spanBuilder("highlight-ctx")
				.setAttribute(HighlightAttributes.HIGHLIGHT_PROJECT_ID, this.projectId)
				.setAllAttributes(record.getAttributes())
				.setStartTimestamp(record.getTimeOccured())
				.setNoParent()
				.startSpan();

		try (Scope scope = span.makeCurrent()) {
			if (record.hasUserSession()) {
				span.setAttribute(HighlightAttributes.HIGHLIGHT_SESSION_ID, record.getUserSession().sessionId());
			}

			if (record.hasRequestId()) {
				span.setAttribute(HighlightAttributes.HIGHLIGHT_TRACE_ID, record.getRequestId());
			}

			span.recordException(record.getThrowable());
		} finally {
			span.end(Instant.now());
		}
	}
}