#[derive(Clone, Copy, Debug, PartialEq)]
#[non_exhaustive]
pub enum HighlightLogSeverity {
    // The values are same as in opentelemetry::logs::Severity
    // with many of them omitted to match the values in log::Level.
    // Here lower value equals higher verbosity. Default is Info.
    Trace = 1,
    Debug = 5,
    Info = 9,
    Warn = 13,
    Error = 17,
}

pub(crate) fn into_log_levels(severity: HighlightLogSeverity) -> log::Level {
    match severity {
        HighlightLogSeverity::Trace => log::Level::Trace,
        HighlightLogSeverity::Debug => log::Level::Debug,
        HighlightLogSeverity::Info => log::Level::Info,
        HighlightLogSeverity::Warn => log::Level::Warn,
        HighlightLogSeverity::Error => log::Level::Error,
    }
}