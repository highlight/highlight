package io.highlight.sdk.common;

public record HighlightHeader(String sessionId, String requestId) {

	public static final String X_HIGHLIGHT_REQUEST = "x-highlight-request";

	public static HighlightHeader parse(String header) {
		String[] split = header.split("/");
		if (split.length == 2) {
			return new HighlightHeader(split[0], split[1]);
		}
		return null;
	}
}