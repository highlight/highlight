package io.highlight.sdk.test.severity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.Severity.Priority;

public class SeverityWarnTest {

	private static final String DEFAULT_TEXT = "highlight-sdk";

	private static final int WARN_ID = 13;

	private static final int PRIORITY_LOW = 0;
	private static final int PRIORITY_NORMAL = 1;
	private static final int PRIORITY_MEDIUM = 2;
	private static final int PRIORITY_HIGH = 3;

	@Test
	@DisplayName("Check warn static value")
	void testWarnStatic() {
		assertEquals(WARN_ID, Severity.WARN.id());
		assertNull(Severity.WARN.text());
	}

	@Test
	@DisplayName("Check warn text input")
	void testWarnText() {
		Severity severity = Severity.warn(DEFAULT_TEXT);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(WARN_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check warn prioirty is low")
	void testWarnPrioirtyLow() {
		Severity severity = Severity.warn(Priority.LOW);
		assertEquals(WARN_ID + PRIORITY_LOW, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check warn prioirty is normal")
	void testWarnPrioirtyNormal() {
		Severity severity = Severity.warn(Priority.NORMAL);
		assertEquals(WARN_ID + PRIORITY_NORMAL, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check warn prioirty is medium")
	void testWarnPrioirtyMedium() {
		Severity severity = Severity.warn(Priority.MEDIUM);
		assertEquals(WARN_ID + PRIORITY_MEDIUM, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check warn prioirty is high")
	void testWarnPrioirtyHigh() {
		Severity severity = Severity.warn(Priority.HIGH);
		assertEquals(WARN_ID + PRIORITY_HIGH, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check warn text input with low prioirty")
	void testWarnTextWithPrioirtyLow() {
		Severity severity = Severity.warn(DEFAULT_TEXT, Priority.LOW);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(WARN_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check warn text input with normal prioirty")
	void testWarnTextWithPrioirtyNormal() {
		Severity severity = Severity.warn(DEFAULT_TEXT, Priority.NORMAL);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(WARN_ID + PRIORITY_NORMAL, severity.id());
	}

	@Test
	@DisplayName("Check warn text input with medium prioirty")
	void testWarnTextWithPrioirtyMedium() {
		Severity severity = Severity.warn(DEFAULT_TEXT, Priority.MEDIUM);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(WARN_ID + PRIORITY_MEDIUM, severity.id());
	}

	@Test
	@DisplayName("Check warn text input with high prioirty")
	void testWarnTextWithPrioirtyHigh() {
		Severity severity = Severity.warn(DEFAULT_TEXT, Priority.HIGH);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(WARN_ID + PRIORITY_HIGH, severity.id());
	}
}
