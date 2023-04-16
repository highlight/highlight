package io.highlight.sdk.common;

import java.util.function.Consumer;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;

/**
 * Represents the options for highlighting in a project, including project ID,
 * backend URL, environment, version, and default attributes.
 */
public record HighlightOptions(String projectId, String backendUrl, String enviroment, String version, boolean metric,
		Attributes defaultAttributes) {

	/**
	 * Returns a new builder for constructing {@link HighlightOptions} with the
	 * specified project ID.
	 *
	 * @param projectId the project ID to use
	 * @return a new builder for constructing {@link HighlightOptions}
	 */
	public static Builder builder(String projectId) {
		return new Builder(projectId);
	}

	/**
	 * A builder class for constructing {@link HighlightOptions}.
	 */
	public static class Builder {

		private static final String DEFAULT_ENVIROMENT = "development";
		private static final String DEFAULT_VERSION = "unknown";

		private final String projectId;

		private String backendUrl = null;

		private String environment = null;
		private String version = null;

		private boolean metric = true;

		private AttributesBuilder defaultAttributes = Attributes.builder();

		/**
		 * Creates a new builder for constructing {@link HighlightOptions} with the
		 * specified project ID.
		 *
		 * @param projectId the project ID to use
		 */
		public Builder(String projectId) {
			this.projectId = projectId;
		}

		/**
		 * Sets the backend URL for the highlight options being constructed. <br>
		 * If not set, the default value is <b>https://otel.highlight.io:4318</b>
		 *
		 * @param backendUrl the backend URL to set
		 * @return this builder
		 */
		public Builder backendUrl(String backendUrl) {
			this.backendUrl = backendUrl;
			return this;
		}

		/**
		 * Sets the environment for the highlight options being constructed. <br>
		 * If not set, the default value is <b>development</b>.
		 *
		 * @param environment the environment to set
		 * @return this builder
		 */
		public Builder environment(String environment) {
			this.environment = environment;
			return this;
		}

		/**
		 * Sets the version for the highlight options being constructed. <br>
		 * If not set, the default value is <b>"unknown"</b>.
		 *
		 * @param version the version to set
		 * @return this builder
		 */
		public Builder version(String version) {
			this.version = version;
			return this;
		}

		/**
		 * Sets whether metric is enabled or not for the highlight options being
		 * constructed. <br>
		 * If not set, the default value is <b>true</b>.
		 *
		 * @param enabled whether to enable metric or not
		 * @return this builder
		 */
		public Builder metric(boolean enabled) {
			this.metric = enabled;
			return this;
		}

		/**
		 * Sets the default attributes for the highlight options being constructed using
		 * the specified consumer function.
		 *
		 * @param attributes a consumer function that accepts an
		 *                   {@link AttributesBuilder}
		 * @return this builder
		 */
		public Builder attributes(Consumer<AttributesBuilder> attributes) {
			attributes.accept(this.defaultAttributes);
			return this;
		}

		/**
		 * Builds the {@link HighlightOptions} using the specified project ID, backend
		 * URL, environment, version, metric, and default attributes.
		 *
		 * @return the constructed {@link HighlightOptions}
		 */
		public HighlightOptions build() {
			if (this.environment == null) {
				this.environment = DEFAULT_ENVIROMENT;
			}
			if (this.version == null) {
				this.version = DEFAULT_VERSION;
			}

			return new HighlightOptions(this.projectId, this.backendUrl, this.environment, this.version, this.metric,
					this.defaultAttributes.build());
		}
	}
}
