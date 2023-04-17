package io.highlight.sdk.test.severity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.Severity.Priority;

public class SeverityErrorTest {

	private static final String DEFAULT_TEXT = "highlight-sdk";

	private static final int ERROR_ID = 17;

	private static final int PRIORITY_LOW = 0;
	private static final int PRIORITY_NORMAL = 1;
	private static final int PRIORITY_MEDIUM = 2;
	private static final int PRIORITY_HIGH = 3;

	@Test
	@DisplayName("Check error static value")
	void testErrorStatic() {
		assertEquals(ERROR_ID, Severity.ERROR.id());
		assertNull(Severity.ERROR.text());
	}

	@Test
	@DisplayName("Check error text input")
	void testErrorText() {
		Severity severity = Severity.error(DEFAULT_TEXT);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(ERROR_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check error prioirty is low")
	void testErrorPrioirtyLow() {
		Severity severity = Severity.error(Priority.LOW);
		assertEquals(ERROR_ID + PRIORITY_LOW, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check error prioirty is normal")
	void testErrorPrioirtyNormal() {
		Severity severity = Severity.error(Priority.NORMAL);
		assertEquals(ERROR_ID + PRIORITY_NORMAL, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check error prioirty is medium")
	void testErrorPrioirtyMedium() {
		Severity severity = Severity.error(Priority.MEDIUM);
		assertEquals(ERROR_ID + PRIORITY_MEDIUM, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check error prioirty is high")
	void testErrorPrioirtyHigh() {
		Severity severity = Severity.error(Priority.HIGH);
		assertEquals(ERROR_ID + PRIORITY_HIGH, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check error text input with low prioirty")
	void testErrorTextWithPrioirtyLow() {
		Severity severity = Severity.error(DEFAULT_TEXT, Priority.LOW);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(ERROR_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check error text input with normal prioirty")
	void testErrorTextWithPrioirtyNormal() {
		Severity severity = Severity.error(DEFAULT_TEXT, Priority.NORMAL);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(ERROR_ID + PRIORITY_NORMAL, severity.id());
	}

	@Test
	@DisplayName("Check error text input with medium prioirty")
	void testErrorTextWithPrioirtyMedium() {
		Severity severity = Severity.error(DEFAULT_TEXT, Priority.MEDIUM);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(ERROR_ID + PRIORITY_MEDIUM, severity.id());
	}

	@Test
	@DisplayName("Check error text input with high prioirty")
	void testErrorTextWithPrioirtyHigh() {
		Severity severity = Severity.error(DEFAULT_TEXT, Priority.HIGH);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(ERROR_ID + PRIORITY_HIGH, severity.id());
	}
}
