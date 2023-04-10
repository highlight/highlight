package io.highlight.sdk.exception;

/**
 * 
 * Exception thrown when Highlight is already initialized and someone is trying
 * to initialize it again.
 */
public class HighlightIllegalStateException extends IllegalStateException {

	private static final long serialVersionUID = -9207374326290760484L;

	/**
	 * Constructs a new HighlightIllegalStateException with the given message.
	 * 
	 * @param message the detail message
	 */
	public HighlightIllegalStateException(String message) {
		super(message);
	}
}