use super::meta::consts::{
    ROUTE_LOGS,
    ROUTE_TRACES,
    DEFAULT_BACKEND
};

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

#[cfg(test)]
mod tests {
    use super::{
        ROUTE_LOGS,
        ROUTE_TRACES,
        DEFAULT_BACKEND,
        build_log_route,
        build_trace_route
    };

    #[test]
    fn create_trace_route() {
        let backend_url = "https://otel.example.com:4318";
        let backend_trace_url = "https://otel.example.com:4318/v1/traces";
        assert_eq!(build_trace_route(""), format!("{}/{}", DEFAULT_BACKEND, ROUTE_TRACES));
        assert_eq!(build_trace_route(backend_url), backend_trace_url);
        assert_eq!(build_trace_route(backend_trace_url), backend_trace_url);
    }

    #[test]
    fn create_log_route() {
        let backend_url = "https://otel.example.com:4318";
        let backend_log_url = "https://otel.example.com:4318/v1/logs";
        assert_eq!(build_log_route(""), format!("{}/{}", DEFAULT_BACKEND, ROUTE_LOGS));
        assert_eq!(build_log_route(backend_url), backend_log_url);
        assert_eq!(build_log_route(backend_log_url), backend_log_url);
    }
}