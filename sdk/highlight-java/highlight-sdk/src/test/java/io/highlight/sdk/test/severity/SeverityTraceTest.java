package io.highlight.sdk.test.severity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.Severity.Priority;

public class SeverityTraceTest {

	private static final String DEFAULT_TEXT = "highlight-sdk";

	private static final int TRACE_ID = 1;

	private static final int PRIORITY_LOW = 0;
	private static final int PRIORITY_NORMAL = 1;
	private static final int PRIORITY_MEDIUM = 2;
	private static final int PRIORITY_HIGH = 3;

	@Test
	@DisplayName("Check trace static value")
	void testTraceStatic() {
		assertEquals(TRACE_ID, Severity.TRACE.id());
		assertNull(Severity.TRACE.text());
	}

	@Test
	@DisplayName("Check trace text input")
	void testTraceText() {
		Severity severity = Severity.trace(DEFAULT_TEXT);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(TRACE_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check trace prioirty is low")
	void testTracePrioirtyLow() {
		Severity severity = Severity.trace(Priority.LOW);
		assertEquals(TRACE_ID + PRIORITY_LOW, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check trace prioirty is normal")
	void testTracePrioirtyNormal() {
		Severity severity = Severity.trace(Priority.NORMAL);
		assertEquals(TRACE_ID + PRIORITY_NORMAL, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check trace prioirty is medium")
	void testTracePrioirtyMedium() {
		Severity severity = Severity.trace(Priority.MEDIUM);
		assertEquals(TRACE_ID + PRIORITY_MEDIUM, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check trace prioirty is high")
	void testTracePrioirtyHigh() {
		Severity severity = Severity.trace(Priority.HIGH);
		assertEquals(TRACE_ID + PRIORITY_HIGH, severity.id());
		assertNull(severity.text());
	}

	@Test
	@DisplayName("Check trace text input with low prioirty")
	void testTraceTextWithPrioirtyLow() {
		Severity severity = Severity.trace(DEFAULT_TEXT, Priority.LOW);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(TRACE_ID + PRIORITY_LOW, severity.id());
	}

	@Test
	@DisplayName("Check trace text input with normal prioirty")
	void testTraceTextWithPrioirtyNormal() {
		Severity severity = Severity.trace(DEFAULT_TEXT, Priority.NORMAL);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(TRACE_ID + PRIORITY_NORMAL, severity.id());
	}

	@Test
	@DisplayName("Check trace text input with medium prioirty")
	void testTraceTextWithPrioirtyMedium() {
		Severity severity = Severity.trace(DEFAULT_TEXT, Priority.MEDIUM);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(TRACE_ID + PRIORITY_MEDIUM, severity.id());
	}

	@Test
	@DisplayName("Check trace text input with high prioirty")
	void testTraceTextWithPrioirtyHigh() {
		Severity severity = Severity.trace(DEFAULT_TEXT, Priority.HIGH);
		assertEquals(DEFAULT_TEXT, severity.text());
		assertEquals(TRACE_ID + PRIORITY_HIGH, severity.id());
	}
}
