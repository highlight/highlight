package io.highlight.sdk.test;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.highlight.sdk.HighlightRoute;

public class HighlightRouteTest {

	private static final String TRACE_ROUTE = "https://otel.highlight.io:4318/v1/traces";
	private static final String LOG_ROUTE = "https://otel.highlight.io:4318/v1/logs";

	@Test
	@DisplayName("Trace route was correctly set")
	void testRouteTrace() {
		assertEquals(TRACE_ROUTE, HighlightRoute.buildTraceRoute(""));
		assertEquals(TRACE_ROUTE, HighlightRoute.buildTraceRoute(null));
		assertEquals("https://otel.example.com:4318/v1/traces", HighlightRoute.buildTraceRoute("https://otel.example.com:4318"));
		assertEquals("https://otel.example.com:4318/v1/traces", HighlightRoute.buildTraceRoute("https://otel.example.com:4318/v1/traces"));
	}

	@Test
	@DisplayName("Log route was correctly set")
	void testRouteLog() {
		assertEquals(LOG_ROUTE, HighlightRoute.buildLogRoute(""));
		assertEquals(LOG_ROUTE, HighlightRoute.buildLogRoute(null));
		assertEquals("https://otel.example.com:4318/v1/logs", HighlightRoute.buildLogRoute("https://otel.example.com:4318"));
		assertEquals("https://otel.example.com:4318/v1/logs", HighlightRoute.buildLogRoute("https://otel.example.com:4318/v1/logs"));
	}
}
