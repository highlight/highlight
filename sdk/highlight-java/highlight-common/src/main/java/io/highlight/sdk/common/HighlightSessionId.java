package io.highlight.sdk.common;

/**
 * The HighlightSessionId defines a method to retrieve a sessionId witch
 * represents a currently session.
 */
public interface HighlightSessionId {

	/**
	 * Returns the current sessionId.
	 * 
	 * @return the sessionId as a string
	 */
	String sessionId();
}
