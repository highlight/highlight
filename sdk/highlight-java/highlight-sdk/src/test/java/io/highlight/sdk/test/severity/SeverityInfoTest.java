package io.highlight.sdk.test.severity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.Severity.Priority;

public class SeverityInfoTest {

	private static final String DEFAULT_TEXT = "highlight-sdk";

	private static final int INFO_ID = 9;

	private static final int PRIORITY_LOW = 0;
	private static final int PRIORITY_NORMAL = 1;
	private static final int PRIORITY_MEDIUM = 2;
	private static final int PRIORITY_HIGH = 3;

	@Test
	@DisplayName("Check info static value")
	void testInfoStatic() {
		assertEquals(INFO_ID, Severity.INFO.id());
		assertNull(Severity.INFO.text());
	}

	@Test
	@DisplayName("Check info text input")
	void testInfoText() {
		Severity severity = Severity.info(DEFAULT_TEXT);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(INFO_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check info prioirty is low")
	void testInfoPrioirtyLow() {
		Severity severity = Severity.info(Priority.LOW);
		assertEquals(INFO_ID + PRIORITY_LOW, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check info prioirty is normal")
	void testInfoPrioirtyNormal() {
		Severity severity = Severity.info(Priority.NORMAL);
		assertEquals(INFO_ID + PRIORITY_NORMAL, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check info prioirty is medium")
	void testInfoPrioirtyMedium() {
		Severity severity = Severity.info(Priority.MEDIUM);
		assertEquals(INFO_ID + PRIORITY_MEDIUM, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check info prioirty is high")
	void testInfoPrioirtyHigh() {
		Severity severity = Severity.info(Priority.HIGH);
		assertEquals(INFO_ID + PRIORITY_HIGH, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check info text input with low prioirty")
	void testInfoTextWithPrioirtyLow() {
		Severity severity = Severity.info(DEFAULT_TEXT, Priority.LOW);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(INFO_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check info text input with normal prioirty")
	void testInfoTextWithPrioirtyNormal() {
		Severity severity = Severity.info(DEFAULT_TEXT, Priority.NORMAL);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(INFO_ID + PRIORITY_NORMAL, severity.id());
	}

	@Test
	@DisplayName("Check info text input with medium prioirty")
	void testInfoTextWithPrioirtyMedium() {
		Severity severity = Severity.info(DEFAULT_TEXT, Priority.MEDIUM);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(INFO_ID + PRIORITY_MEDIUM, severity.id());
	}

	@Test
	@DisplayName("Check info text input with high prioirty")
	void testInfoTextWithPrioirtyHigh() {
		Severity severity = Severity.info(DEFAULT_TEXT, Priority.HIGH);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(INFO_ID + PRIORITY_HIGH, severity.id());
	}
}
