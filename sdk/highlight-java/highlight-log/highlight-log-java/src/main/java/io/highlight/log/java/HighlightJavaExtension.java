package io.highlight.log.java;

import java.util.Objects;
import java.util.logging.Logger;

import io.highlight.log.api.HighlightExtension;
import io.highlight.sdk.Highlight;

public class HighlightJavaExtension implements HighlightExtension {

	public static void enableGlobalLogging() {
		Logger logger = Logger.getGlobal();
		logger.addHandler(new HighlightLoggerHandler(Highlight.getHighlight()));
	}

	private final Logger logger;
	private final HighlightLoggerHandler loggerHandler;

	private boolean enabled = false;

	public HighlightJavaExtension(Logger logger) {
		this(logger, Highlight.getHighlight());
	}

	public HighlightJavaExtension(Logger logger, Highlight highlight) {
		Objects.requireNonNull(logger, "Logger can't be null!");
		Objects.requireNonNull(highlight, "Highlight can't be null!");

		this.logger = logger;
		this.loggerHandler = new HighlightLoggerHandler(highlight);

		this.enable();
	}

	public void enable() {
		if (!this.enabled) {
			this.logger.addHandler(this.loggerHandler);
			this.enabled = true;
		}
	}

	public void disable() {
		if (this.enabled) {
			this.logger.removeHandler(this.loggerHandler);
			this.enabled = false;
		}
	}

	public boolean isEnabled() {
		return this.enabled;
	}

	public Logger getLogger() {
		return this.logger;
	}
}