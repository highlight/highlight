package io.highlight.sdk;

public class HighlightRoute {

	public static final String DEFAULT_OTEL_BACKEND = "https://otel.highlight.io:4318";
	public static final String DEFAULT_GRAPHQL_BACKEND = "https://pub.highlight.run";

	public static final String ROUTE_LOGS = "v1/logs";
	public static final String ROUTE_TRACES = "v1/traces";

	public static String buildLogRoute(String backend) {
		if (backend == null) {
			return DEFAULT_OTEL_BACKEND + "/" + ROUTE_LOGS;
		}

		if (backend.endsWith(ROUTE_LOGS)) {
			return backend;
		}

		if (backend.endsWith("/")) {
			return backend + ROUTE_LOGS;
		}

		return backend + "/" + ROUTE_LOGS;
	}

	public static String buildTraceRoute(String backend) {
		if (backend == null) {
			return DEFAULT_OTEL_BACKEND + "/" + ROUTE_TRACES;
		}

		if (backend.endsWith(ROUTE_TRACES)) {
			return backend;
		}

		if (backend.endsWith("/")) {
			return backend + ROUTE_TRACES;
		}

		return backend + "/" + ROUTE_TRACES;
	}
}