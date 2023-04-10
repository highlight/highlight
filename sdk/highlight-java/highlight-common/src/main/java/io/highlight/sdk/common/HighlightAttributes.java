package io.highlight.sdk.common;

import static io.opentelemetry.api.common.AttributeKey.stringKey;

import io.opentelemetry.api.common.AttributeKey;

/**
 * This class defines the attribute keys used in the Highlight SDK.
 */
public class HighlightAttributes {

	/**
	 * The attribute key for the Highlight project ID.
	 */
	public static final AttributeKey<String> HIGHLIGHT_PROJECT_ID = stringKey("highlight.project_id");

	/**
	 * The attribute key for the Highlight session ID.
	 */
	public static final AttributeKey<String> HIGHLIGHT_SESSION_ID = stringKey("highlight.session_id");

	/**
	 * The attribute key for the Highlight trace ID.
	 */
	public static final AttributeKey<String> HIGHLIGHT_TRACE_ID = stringKey("highlight.trace_id");

	/**
	 * The attribute key for the log severity.
	 */
	public static final AttributeKey<String> LOG_SEVERITY = stringKey("log.severity");

	/**
	 * The attribute key for the java version.
	 */
	public static final AttributeKey<String> TELEMETRY_JAVA_VERSION = stringKey("telemetry.java.version");

	/**
	 * The attribute key for the java vendor.
	 */
	public static final AttributeKey<String> TELEMETRY_JAVA_VENDOR = stringKey("telemetry.java.vendor");

	/**
	 * The attribute key for the java vendor date.
	 */
	public static final AttributeKey<String> TELEMETRY_JAVA_VERSION_DATE = stringKey("telemetry.java.date");

	/**
	 * Non accessible constructor because this class just providing static fields
	 */
	private HighlightAttributes() {
	}
}