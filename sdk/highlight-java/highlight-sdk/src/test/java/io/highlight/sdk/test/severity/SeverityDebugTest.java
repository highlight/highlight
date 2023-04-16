package io.highlight.sdk.test.severity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.Severity.Priority;

public class SeverityDebugTest {

	private static final String DEFAULT_TEXT = "highlight-sdk";

	private static final int DEBUG_ID = 5;

	private static final int PRIORITY_LOW = 0;
	private static final int PRIORITY_NORMAL = 1;
	private static final int PRIORITY_MEDIUM = 2;
	private static final int PRIORITY_HIGH = 3;

	@Test
	@DisplayName("Check debug static value")
	void testDebugStatic() {
		assertEquals(DEBUG_ID, Severity.DEBUG.id());
		assertNull(Severity.DEBUG.text());
	}

	@Test
	@DisplayName("Check debug text input")
	void testDebugText() {
		Severity severity = Severity.debug(DEFAULT_TEXT);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(DEBUG_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check debug prioirty is low")
	void testDebugPrioirtyLow() {
		Severity severity = Severity.debug(Priority.LOW);
		assertEquals(DEBUG_ID + PRIORITY_LOW, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check debug prioirty is normal")
	void testDebugPrioirtyNormal() {
		Severity severity = Severity.debug(Priority.NORMAL);
		assertEquals(DEBUG_ID + PRIORITY_NORMAL, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check debug prioirty is medium")
	void testDebugPrioirtyMedium() {
		Severity severity = Severity.debug(Priority.MEDIUM);
		assertEquals(DEBUG_ID + PRIORITY_MEDIUM, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check debug prioirty is high")
	void testDebugPrioirtyHigh() {
		Severity severity = Severity.debug(Priority.HIGH);
		assertEquals(DEBUG_ID + PRIORITY_HIGH, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check debug text input with low prioirty")
	void testDebugTextWithPrioirtyLow() {
		Severity severity = Severity.debug(DEFAULT_TEXT, Priority.LOW);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(DEBUG_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check debug text input with normal prioirty")
	void testDebugTextWithPrioirtyNormal() {
		Severity severity = Severity.debug(DEFAULT_TEXT, Priority.NORMAL);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(DEBUG_ID + PRIORITY_NORMAL, severity.id());
	}

	@Test
	@DisplayName("Check debug text input with medium prioirty")
	void testDebugTextWithPrioirtyMedium() {
		Severity severity = Severity.debug(DEFAULT_TEXT, Priority.MEDIUM);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(DEBUG_ID + PRIORITY_MEDIUM, severity.id());
	}

	@Test
	@DisplayName("Check debug text input with high prioirty")
	void testDebugTextWithPrioirtyHigh() {
		Severity severity = Severity.debug(DEFAULT_TEXT, Priority.HIGH);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(DEBUG_ID + PRIORITY_HIGH, severity.id());
	}
}
