package io.highlight.sdk.test.record;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.highlight.sdk.common.Severity;
import io.highlight.sdk.common.Severity.Priority;
import io.highlight.sdk.common.record.HighlightLogRecord;
import io.highlight.sdk.common.record.HighlightRecord;
import io.opentelemetry.api.common.AttributeKey;

public class HighlightLogRecordCopyTest {

	private static final AttributeKey<String> ATTRIBUTE_JUNIT_TEST = AttributeKey.stringKey("junit.test.2");
	private static final String ATTRIBUTE_JUNIT_TEST_VALUE = "test2";

	private static final String MESSAGE = "junit test message record";
	private static final Long TIME_OCCURED = System.currentTimeMillis();

	private static final String SESSION_ID = "customSessionId";
	private static final String REQUEST_ID = "customRequestId";

	HighlightLogRecord record;

	@BeforeEach
	void setup() {
		HighlightLogRecord record = HighlightRecord.log()
				.severity(Severity.info("junit", Priority.HIGH))
				.message(MESSAGE)
				.timeOccured(Instant.ofEpochMilli(TIME_OCCURED))
				.userSession(SESSION_ID)
				.requestId(REQUEST_ID)
				.attributes(attributes -> attributes
						.put(ATTRIBUTE_JUNIT_TEST, ATTRIBUTE_JUNIT_TEST_VALUE)
						.put("junit.test.1", "test1"))
				.build();

		this.record = HighlightLogRecord.log(record)
				.build();
	}

	@Test
	@DisplayName("Check severity")
	void testSeverity() {
		assertEquals(Severity.info(Priority.HIGH).id(), this.record.getSeverity().id());
		assertEquals(Severity.info("junit").text(), this.record.getSeverity().text());
	}

	@Test
	@DisplayName("Check message")
	void testMessage() {
		assertEquals(MESSAGE, this.record.getMessage());
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

		HighlightLogRecord record2 = HighlightRecord.log(this.record)
				.userSession("")
				.build();

		assertFalse(record2.hasUserSession());
	}

	@Test
	@DisplayName("Check request id")
	void testRequestId() {
		assertTrue(this.record.hasRequestId());
		assertEquals(REQUEST_ID, this.record.getRequestId());

		HighlightLogRecord record2 = HighlightRecord.log(this.record)
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
