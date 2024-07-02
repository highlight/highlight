package io.highlight.sdk;

import java.time.Instant;

import io.highlight.sdk.common.HighlightAttributes;
import io.highlight.sdk.common.record.HighlightErrorRecord;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;

/**
 * The HighlightTracer class is used to process error records
 */
public class HighlightTracer {

	private final Tracer tracer;

	/**
	 * Constructs a new HighlightTracer instance.
	 *
	 * @param highlight The Highlight instance.
	 */
	HighlightTracer(Highlight highlight) {
		HighlightOpenTelemetry openTelemetry = highlight.getOpenTelemetry();
		this.tracer = openTelemetry.getTracer("highlight-java");
	}

	/**
	 * Processes the given {@link HighlightErrorRecord}.
	 *
	 * @param record The HighlightErrorRecord to process.
	 */
	public void process(HighlightErrorRecord record) {
		Span span = this.tracer.spanBuilder("highlight-ctx").setAllAttributes(record.getAttributes())
				.setStartTimestamp(record.getTimeOccured()).setNoParent().startSpan();

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