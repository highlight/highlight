package io.highlight.sdk.test.record;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.highlight.sdk.common.record.HighlightErrorRecord;
import io.highlight.sdk.common.record.HighlightRecord;
import io.opentelemetry.api.common.AttributeKey;

public class HighlightErrorRecordCopyTest {

	private static final AttributeKey<String> ATTRIBUTE_JUNIT_TEST = AttributeKey.stringKey("junit.test.2");
	private static final String ATTRIBUTE_JUNIT_TEST_VALUE = "test2";

	private static final Long TIME_OCCURED = System.currentTimeMillis();

	private static final String SESSION_ID = "customSessionId";
	private static final String REQUEST_ID = "customRequestId";

	private static final Throwable ERROR = new NullPointerException("Junit test");

	HighlightErrorRecord record;

	@BeforeEach
	void setup() {
		HighlightErrorRecord record = HighlightRecord.error()
				.throwable(ERROR)
				.timeOccured(Instant.ofEpochMilli(TIME_OCCURED))
				.userSession(SESSION_ID)
				.requestId(REQUEST_ID)
				.attributes(attributes -> attributes
						.put(ATTRIBUTE_JUNIT_TEST, ATTRIBUTE_JUNIT_TEST_VALUE)
						.put("junit.test.1", "test1"))
				.build();

		this.record = HighlightErrorRecord.error(record)
				.build();
	}

	@Test
	@DisplayName("Check throwable")
	void testThrowable() {
		assertEquals(ERROR, this.record.getThrowable());
	}

	@Test
	@DisplayName("Check time occured")
	void testTimeOccured() {
		assertEquals(TIME_OCCURED, this.record.getTimeOccured().toEpochMilli());
	}

	@Test
	@DisplayName("Check session id")
	void testSessionId() {
		assertTrue(this.record.hasUserSession());
		assertEquals(SESSION_ID, this.record.getUserSession().sessionId());

		HighlightErrorRecord record2 = HighlightRecord.error(this.record)
				.userSession("")
				.build();

		assertFalse(record2.hasUserSession());
	}

	@Test
	@DisplayName("Check request id")
	void testRequestId() {
		assertTrue(this.record.hasRequestId());
		assertEquals(REQUEST_ID, this.record.getRequestId());

		HighlightErrorRecord record2 = HighlightRecord.error(this.record)
				.requestId("")
				.build();

		assertFalse(record2.hasRequestId());
	}

	@Test
	@DisplayName("Check attributes")
	void testAttribute() {
		assertEquals(ATTRIBUTE_JUNIT_TEST_VALUE, this.record.getAttributes().get(ATTRIBUTE_JUNIT_TEST));
		assertEquals("test1", this.record.getAttributes().get(AttributeKey.stringKey("junit.test.1")));
	}
}
