use std::{borrow::Cow, error::Error, sync::Arc};

use opentelemetry::{global, trace::{TraceContextExt, Tracer as _}, KeyValue};
use opentelemetry_appender_tracing::layer::OpenTelemetryTracingBridge;
use opentelemetry_otlp::{WithExportConfig, OtlpLogPipeline, OtlpTracePipeline, LogExporterBuilder, SpanExporterBuilder};
use opentelemetry_sdk::{logs::{self, Logger}, resource::Resource, trace::{self, Span, Tracer}};

mod error;

pub use error::HighlightError;
use tracing_subscriber::{layer::SubscriberExt as _, util::SubscriberInitExt as _};

struct HighlightInner {
    tracer: Tracer,
}

pub struct Highlight(Arc<HighlightInner>);

impl Highlight {
    #[cfg(not(any(feature = "tokio", feature = "tokio-current-thread", feature = "async-std")))]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        Ok((
            logging.install_simple()?,
            tracing.install_simple()?,
        ))
    }

    #[cfg(feature = "tokio")]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        Ok((
            logging.install_batch(opentelemetry_sdk::runtime::Tokio)?,
            tracing.install_batch(opentelemetry_sdk::runtime::Tokio)?,
        ))
    }

    #[cfg(feature = "tokio-current-thread")]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        Ok((
            logging.install_batch(opentelemetry_sdk::runtime::TokioCurrentThread)?,
            tracing.install_batch(opentelemetry_sdk::runtime::TokioCurrentThread)?,
        ))
    }

    #[cfg(feature = "async-std")]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        Ok((
            logging.install_batch(opentelemetry_sdk::runtime::AsyncStd)?,
            tracing.install_batch(opentelemetry_sdk::runtime::AsyncStd)?,
        ))
    }

    fn get_default_resource(project_id: String) -> Resource {
        Resource::new(vec![
            KeyValue::new("highlight.project_id", project_id.clone()),
            // KeyValue::new("highlight.trace_id", ""),
            // KeyValue::new("highlight.session_id", ""),
        ])
    }

    pub fn init(project_id: impl ToString) -> Result<Highlight, HighlightError> {
        let project_id = project_id.to_string();
        
        // TODO: missing batch config
        let logging = opentelemetry_otlp::new_pipeline()
            .logging()
            .with_log_config(
                logs::Config::default().with_resource(Self::get_default_resource(project_id.clone()))
            )
            .with_exporter(
                opentelemetry_otlp::new_exporter()
                    .http()
                    .with_endpoint("https://otel.highlight.io:4318"),
            );
        
        let tracing = opentelemetry_otlp::new_pipeline()
            .tracing()
            .with_trace_config(
                trace::Config::default().with_resource(Self::get_default_resource(project_id.clone()))
            )
            // .with_batch_config(
            //     BatchConfig::default()
            //         .with_scheduled_delay(Duration::from_millis(1000))
            //         .with_max_export_batch_size(128)
            //         .with_max_queue_size(1024)
            // )
            .with_exporter(
                opentelemetry_otlp::new_exporter()
                    .http()
                    .with_endpoint("https://otel.highlight.io:4318"),
            );
        
        let (_, tracer) = Self::install_pipelines(logging, tracing)?;

        let layer = OpenTelemetryTracingBridge::new(&global::logger_provider());
        tracing_subscriber::registry().with(layer).init();
    
        Ok(Highlight(Arc::new(HighlightInner {
            tracer,
        })))
    }

    pub fn capture_error_with_session(
        &self,
        err: &dyn Error,
        session_id: Option<String>,
        request_id: Option<String>,
    ) {
        self.0.tracer.in_span("highlight-ctx", |cx| {
            cx.span().record_error(err);

            if let Some(session_id) = session_id {
                cx.span().set_attribute(
                    KeyValue::new("highlight.session_id", session_id),
                );
            }

            if let Some(request_id) = request_id {
                cx.span().set_attribute(
                    KeyValue::new("highlight.trace_id", request_id),
                );
            }
        });
    }

    pub fn capture_error(&self, err: &dyn Error) {
        self.capture_error_with_session(err, None, None);
    }

    pub fn span(&self, name: impl Into<Cow<'static, str>>) -> Span {
        self.0.tracer.start(name)
    }
}

impl Drop for Highlight {
    fn drop(&mut self) {
        global::shutdown_logger_provider();
        global::shutdown_tracer_provider();
    }
}
