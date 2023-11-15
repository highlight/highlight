<?php

namespace Highlight\SDK;

class HighlightRoute {
    // The default backend URL's.
    const DEFAULT_BACKEND = "https://otel.highlight.io:4318";

    // The default routes for sending.
    const ROUTE_LOGS = "v1/logs";
    const ROUTE_TRACES = "v1/traces";

    /**
     * Builds a route for sending logs to Highlight, based on the provided backend
     * URL. If no backend URL is provided, the default backend URL is used.
     *
     * @param string $backend The backend URL to use.
     * @return string The route for sending logs to Highlight.
     */
    public static function buildLogRoute($backend = null) {
        if ($backend === null || trim($backend) === "") {
            return self::DEFAULT_BACKEND . "/" . self::ROUTE_LOGS;
        }

        if (substr($backend, -strlen(self::ROUTE_LOGS)) === self::ROUTE_LOGS) {
            return $backend;
        }

        if (substr($backend, -1) === "/") {
            return $backend . self::ROUTE_LOGS;
        }

        return $backend . "/" . self::ROUTE_LOGS;
    }

    /**
     * Builds a route for sending traces to Highlight, based on the provided backend
     * URL. If no backend URL is provided, the default backend URL is used.
     *
     * @param string $backend The backend URL to use.
     * @return string The route for sending traces to Highlight.
     */
    public static function buildTraceRoute($backend = null) {
        if ($backend === null || trim($backend) === "") {
            return self::DEFAULT_BACKEND . "/" . self::ROUTE_TRACES;
        }

        if (substr($backend, -strlen(self::ROUTE_TRACES)) === self::ROUTE_TRACES) {
            return $backend;
        }

        if (substr($backend, -1) === "/") {
            return $backend . self::ROUTE_TRACES;
        }

        return $backend . "/" . self::ROUTE_TRACES;
    }

    /**
     * Get the default backend URL.
     *
     * @return string The default backend URL.
     */
    public static function getDefaultBackend() {
        return self::DEFAULT_BACKEND;
    }

    // Private constructor to prevent instantiation
    private function __construct() {
    }
}