package io.highlight.sdk.common;

import java.util.Objects;

public final class HighlightHeader {

	public static final String X_HIGHLIGHT_REQUEST = "x-highlight-request";
	private final String sessionId;
	private final String requestId;

	public HighlightHeader(String sessionId, String requestId) {
		this.sessionId = sessionId;
		this.requestId = requestId;
	}

	public static HighlightHeader parse(String header) {
		String[] split = header.split("/");
		if (split.length == 2) {
			return new HighlightHeader(split[0], split[1]);
		}
		return null;
	}

	public String sessionId() {
		return sessionId;
	}

	public String requestId() {
		return requestId;
	}

	@Override
	public int hashCode() {
		return Objects.hash(requestId, sessionId);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (!(obj instanceof HighlightHeader)) {
			return false;
		}
		HighlightHeader other = (HighlightHeader) obj;
		return Objects.equals(requestId, other.requestId) && Objects.equals(sessionId, other.sessionId);
	}

	@Override
	public String toString() {
		return "HighlightHeader [sessionId=" + sessionId + ", requestId=" + requestId + "]";
	}
}