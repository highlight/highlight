package io.highlight.sdk.common;

import io.opentelemetry.api.common.AttributeKey;

public class HighlightAttributes {

	public static final AttributeKey<String> HIGHLIGHT_PROJECT_ID = AttributeKey.stringKey("highlight.project_id");
	public static final AttributeKey<String> HIGHLIGHT_SESSION_ID = AttributeKey.stringKey("highlight.session_id");
	public static final AttributeKey<String> HIGHLIGHT_TRACE_ID = AttributeKey.stringKey("highlight.trace_id");

	public static final AttributeKey<String> LOG_SEVERITY = AttributeKey.stringKey("log.severity");
}