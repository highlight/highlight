package io.highlight.sdk.common;

import io.opentelemetry.api.common.AttributeKey;

/**
 * This class defines the attribute keys used in the Highlight SDK.
 */
public class HighlightAttributes {

	/**
	 * The attribute key for the Highlight project ID.
	 */
	public static final AttributeKey<String> HIGHLIGHT_PROJECT_ID = AttributeKey.stringKey("highlight.project_id");

	/**
	 * The attribute key for the Highlight session ID.
	 */
	public static final AttributeKey<String> HIGHLIGHT_SESSION_ID = AttributeKey.stringKey("highlight.session_id");

	/**
	 * The attribute key for the Highlight trace ID.
	 */
	public static final AttributeKey<String> HIGHLIGHT_TRACE_ID = AttributeKey.stringKey("highlight.trace_id");

	/**
	 * The attribute key for the log severity.
	 */
	public static final AttributeKey<String> LOG_SEVERITY = AttributeKey.stringKey("log.severity");
}