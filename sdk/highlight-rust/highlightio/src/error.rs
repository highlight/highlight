use opentelemetry::{logs::LogError, trace::TraceError};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum HighlightError {
    /// Config error during setup
    #[error("Highlight Config error: {0}")]
    Config(String),

    /// Errors from the log SDK
    #[error(transparent)]
    Log(LogError),

    /// Errors from the trace SDK
    #[error(transparent)]
    Trace(TraceError),
}

impl From<LogError> for HighlightError {
    fn from(value: LogError) -> Self {
        HighlightError::Log(value)
    }
}

impl From<TraceError> for HighlightError {
    fn from(value: TraceError) -> Self {
        HighlightError::Trace(value)
    }
}
