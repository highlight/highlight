package io.highlight.sdk.exception;

/**
 * Thrown to indicate that an invalid option was provided when initializing
 * Highlight.
 */
public class HighlightInvalidOptionException extends IllegalArgumentException {

	private static final long serialVersionUID = 3917081389365928473L;

	/**
	 * Constructs a HighlightInvalidOptionException with the specified detail
	 * message.
	 * 
	 * @param message the detail message
	 */
	public HighlightInvalidOptionException(String message) {
		super(message);
	}
}
