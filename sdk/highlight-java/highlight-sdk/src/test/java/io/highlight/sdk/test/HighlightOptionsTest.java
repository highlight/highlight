package io.highlight.sdk.test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.highlight.sdk.common.HighlightOptions;
import io.opentelemetry.api.common.AttributeKey;

public class HighlightOptionsTest {

	private static final String PROJECT_ID = "projectId";
	private static final String PROJECT_ENVIRONMENT = "production";
	private static final String PROJECT_VERSION = "04.27.20-b605";
	private static final String PROJECT_NAME = "java-test";

	private static final AttributeKey<String> ATTRIBUTE_JUNIT_TEST = AttributeKey.stringKey("junit.test.2");
	private static final String ATTRIBUTE_JUNIT_TEST_VALUE = "test2";

	HighlightOptions options;

	@BeforeEach
	void setup() {
		this.options = HighlightOptions.builder(PROJECT_ID)
				.environment(PROJECT_ENVIRONMENT)
				.version(PROJECT_VERSION)
				.serviceName(PROJECT_NAME)
				.metric(false)
				.attributes(attribute -> attribute
						.put("junit.test.1", true)
						.put(ATTRIBUTE_JUNIT_TEST, ATTRIBUTE_JUNIT_TEST_VALUE))
				.build();
	}

	@Test
	@DisplayName("Project id was correctly set")
	void testProjectId() {
		assertEquals(PROJECT_ID, this.options.projectId());
	}

	@Test
	@DisplayName("Enviroment was correctly set")
	void testEnviroment() {
		assertEquals(PROJECT_ENVIRONMENT, this.options.enviroment());
	}

	@Test
	@DisplayName("Version was correctly set")
	void testVersion() {
		assertEquals(PROJECT_VERSION, this.options.version());
	}

	@Test
	@DisplayName("Service name was correctly set")
	void testServiceName() {
		assertEquals(PROJECT_NAME, this.options.serviceName());
	}

	@Test
	@DisplayName("Metric was correctly set")
	void testMetric() {
		assertFalse(this.options.metric());
	}

	@Test
	@DisplayName("Check default attributes")
	void testAttributes() {
		assertTrue(this.options.defaultAttributes().get(AttributeKey.booleanKey("junit.test.1")));
		assertEquals(ATTRIBUTE_JUNIT_TEST_VALUE, this.options.defaultAttributes().get(ATTRIBUTE_JUNIT_TEST));
	}
}
