const DEFAULT_BACKEND: &str = "https://otel.highlight.io:4318";
const ROUTE_LOGS: &str = "v1/logs";
const ROUTE_TRACES: &str = "v1/traces";


pub fn build_log_route(backend: &str) -> String {
    if backend.is_empty() {
        return format!("{}/{}", DEFAULT_BACKEND, ROUTE_LOGS);
    }

    if backend.ends_with(ROUTE_LOGS) {
        return format!("{}", backend);
    }

    if backend.ends_with("/") {
        return format!("{}{}", backend, ROUTE_LOGS);
    }

    format!("{}/{}", backend, ROUTE_LOGS)
}

pub fn build_trace_route(backend: &str) -> String {
    if backend.is_empty() {
        return format!("{}/{}", DEFAULT_BACKEND, ROUTE_TRACES);
    }

    if backend.ends_with(ROUTE_TRACES) {
        return format!("{}", backend);
    }

    if backend.ends_with("/") {
        return format!("{}{}", backend, ROUTE_TRACES);
    }

    format!("{}/{}", backend, ROUTE_TRACES)
}