package io.highlight.sdk.test.severity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.Severity.Priority;

public class SeverityFatalTest {

	private static final String DEFAULT_TEXT = "highlight-sdk";

	private static final int FATAL_ID = 21;

	private static final int PRIORITY_LOW = 0;
	private static final int PRIORITY_NORMAL = 1;
	private static final int PRIORITY_MEDIUM = 2;
	private static final int PRIORITY_HIGH = 3;

	@Test
	@DisplayName("Check fatal static value")
	void testFatalStatic() {
		assertEquals(FATAL_ID, Severity.FATAL.id());
		assertNull(Severity.FATAL.text());
	}

	@Test
	@DisplayName("Check fatal text input")
	void testFatalText() {
		Severity severity = Severity.fatal(DEFAULT_TEXT);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(FATAL_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check fatal prioirty is low")
	void testFatalPrioirtyLow() {
		Severity severity = Severity.fatal(Priority.LOW);
		assertEquals(FATAL_ID + PRIORITY_LOW, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check fatal prioirty is normal")
	void testFatalPrioirtyNormal() {
		Severity severity = Severity.fatal(Priority.NORMAL);
		assertEquals(FATAL_ID + PRIORITY_NORMAL, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check fatal prioirty is medium")
	void testFatalPrioirtyMedium() {
		Severity severity = Severity.fatal(Priority.MEDIUM);
		assertEquals(FATAL_ID + PRIORITY_MEDIUM, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check fatal prioirty is high")
	void testFatalPrioirtyHigh() {
		Severity severity = Severity.fatal(Priority.HIGH);
		assertEquals(FATAL_ID + PRIORITY_HIGH, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check fatal text input with low prioirty")
	void testFatalTextWithPrioirtyLow() {
		Severity severity = Severity.fatal(DEFAULT_TEXT, Priority.LOW);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(FATAL_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check fatal text input with normal prioirty")
	void testFatalTextWithPrioirtyNormal() {
		Severity severity = Severity.fatal(DEFAULT_TEXT, Priority.NORMAL);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(FATAL_ID + PRIORITY_NORMAL, severity.id());
	}

	@Test
	@DisplayName("Check fatal text input with medium prioirty")
	void testFatalTextWithPrioirtyMedium() {
		Severity severity = Severity.fatal(DEFAULT_TEXT, Priority.MEDIUM);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(FATAL_ID + PRIORITY_MEDIUM, severity.id());
	}

	@Test
	@DisplayName("Check fatal text input with high prioirty")
	void testFatalTextWithPrioirtyHigh() {
		Severity severity = Severity.fatal(DEFAULT_TEXT, Priority.HIGH);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(FATAL_ID + PRIORITY_HIGH, severity.id());
	}
}
