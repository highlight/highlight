package io.highlight.sdk;

/**
 * This class build the route for the log and trace backend URL's
 */
public class HighlightRoute {

	// The default backend URL's.
	public static final String DEFAULT_OTEL_BACKEND = "https://otel.highlight.io:4318";
	public static final String DEFAULT_GRAPHQL_BACKEND = "https://pub.highlight.run";

	// The default routes for sending.
	public static final String ROUTE_LOGS = "v1/logs";
	public static final String ROUTE_TRACES = "v1/traces";

	/**
	 * Builds a route for sending logs to Highlight, based on the provided backend
	 * URL. <br>
	 * If no backend URL is provided, the default backend URL is used.
	 * 
	 * @param backend The backend URL to use.
	 * @return The route for sending logs to Highlight.
	 */
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

	/**
	 * Builds a route for sending traces to Highlight, based on the provided backend
	 * URL. <br>
	 * If no backend URL is provided, the default backend URL is used.
	 * 
	 * @param backend The backend URL to use.
	 * @return The route for sending traces to Highlight.
	 */
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

	/**
	 * Non accessible constructor because this class just providing static fields
	 */
	private HighlightRoute() {
	}
}