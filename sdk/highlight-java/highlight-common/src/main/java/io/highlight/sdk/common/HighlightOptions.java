package io.highlight.sdk.common;

import java.util.function.Consumer;

import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.common.AttributesBuilder;

public record HighlightOptions(String projectId, String backendUrl, String enviroment, String version, boolean metric, Attributes defaultAttributes) {

	public static Builder builder(String projectId) {
		return new Builder(projectId);
	}

	public static class Builder {

		private static final String DEFAULT_ENVIROMENT = "development";
		private static final String DEFAULT_VERSION = "unknown";

		private final String projectId;

		private String backendUrl = null;

		private String environment = null;
		private String version = null;

		private boolean metric = true;

		private AttributesBuilder defaultAttributes = Attributes.builder();

		public Builder(String projectId) {
			this.projectId = projectId;
		}

		public Builder backendUrl(String backendUrl) {
			this.backendUrl = backendUrl;
			return this;
		}

		public Builder environment(String environment) {
			this.environment = environment;
			return this;
		}

		public Builder version(String version) {
			this.version = version;
			return this;
		}

		public Builder metric(boolean enabled) {
			this.metric = enabled;
			return this;
		}

		public Builder attributes(Consumer<AttributesBuilder> handle) {
			handle.accept(this.defaultAttributes);
			return this;
		}

		public HighlightOptions build() {
			//TODO check project id is valid
			
			if (this.environment == null) {
				this.environment = DEFAULT_ENVIROMENT;
			}
			if (this.version == null) {
				this.version = DEFAULT_VERSION;
			}
			
			return new HighlightOptions(this.projectId, this.backendUrl, this.environment, this.version, this.metric, this.defaultAttributes.build());
		}
	}
}
