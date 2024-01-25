#[cfg(not(any(
    feature = "sync",
    feature = "tokio",
    feature = "tokio-current-thread",
    feature = "async-std"
)))]
compile_error!("No runtime enabled for highlightio, please specify one of the following features: sync (default), tokio, tokio-current-thread, async-std");

use std::{
    borrow::Cow,
    error::Error,
    sync::Arc,
    time::{Duration, SystemTime},
};

use log::{Level, Log};
pub use opentelemetry::trace::Span as SpanTrait;
use opentelemetry::{
    global,
    logs::{LogRecordBuilder, Logger as _, Severity},
    trace::{TraceContextExt, Tracer as _},
    KeyValue,
};
use opentelemetry_appender_tracing::layer::OpenTelemetryTracingBridge;
use opentelemetry_otlp::{
    LogExporterBuilder, OtlpLogPipeline, OtlpTracePipeline, SpanExporterBuilder, WithExportConfig,
};
use opentelemetry_sdk::{
    logs::{self, Logger},
    resource::Resource,
    trace::{self, BatchConfig, Span, Tracer},
};

mod error;

pub use error::HighlightError;
use tracing_subscriber::{layer::SubscriberExt as _, util::SubscriberInitExt as _};

struct HighlightInner {
    log_logger: Box<dyn Log>,
    logger: Logger,
    tracer: Tracer,
}

#[derive(Clone)]
pub struct Highlight(Arc<HighlightInner>);

impl Highlight {
    #[cfg(not(any(
        feature = "sync",
        feature = "tokio",
        feature = "tokio-current-thread",
        feature = "async-std"
    )))]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        panic!("install_pipelines called without a runtime feature flag");
    }

    #[cfg(feature = "sync")]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        Ok((logging.install_simple()?, tracing.install_simple()?))
    }

    #[cfg(all(feature = "tokio-current-thread", not(feature = "sync")))]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        Ok((
            logging.install_batch(opentelemetry_sdk::runtime::TokioCurrentThread)?,
            tracing.install_batch(opentelemetry_sdk::runtime::TokioCurrentThread)?,
        ))
    }

    #[cfg(all(
        feature = "tokio",
        not(any(feature = "sync", feature = "tokio-current-thread"))
    ))]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        Ok((
            logging.install_batch(opentelemetry_sdk::runtime::Tokio)?,
            tracing.install_batch(opentelemetry_sdk::runtime::Tokio)?,
        ))
    }

    #[cfg(all(
        feature = "async-std",
        not(any(feature = "sync", feature = "tokio", feature = "tokio-current-thread"))
    ))]
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
        Resource::new(vec![KeyValue::new(
            "highlight.project_id",
            project_id.clone(),
        )])
    }

    /// Initialize Highlight using a custom logger.
    ///
    /// Highlight automatically uses env_logger to emit your log messages onto the command line.
    /// If you want to use a different logger, initialize with this function instead.
    pub fn init_with_logger(
        project_id: impl ToString,
        log_logger: impl Log + 'static,
    ) -> Result<Highlight, HighlightError> {
        let project_id = project_id.to_string();

        // TODO: missing batch config
        let logging = opentelemetry_otlp::new_pipeline()
            .logging()
            .with_log_config(
                logs::Config::default()
                    .with_resource(Self::get_default_resource(project_id.clone())),
            )
            .with_exporter(
                opentelemetry_otlp::new_exporter()
                    .http()
                    .with_endpoint("https://otel.highlight.io:4318"),
            );

        let tracing = opentelemetry_otlp::new_pipeline()
            .tracing()
            .with_trace_config(
                trace::config()
                    .with_sampler(trace::Sampler::AlwaysOn)
                    .with_resource(Self::get_default_resource(project_id.to_string())),
            )
            .with_batch_config(
                BatchConfig::default()
                    .with_scheduled_delay(Duration::from_millis(1000))
                    .with_max_export_batch_size(128)
                    .with_max_queue_size(1024),
            )
            .with_exporter(
                opentelemetry_otlp::new_exporter()
                    .http()
                    .with_endpoint("https://otel.highlight.io:4318"),
            );

        let (logger, tracer) = Self::install_pipelines(logging, tracing)?;

        let layer = OpenTelemetryTracingBridge::new(&global::logger_provider());
        tracing_subscriber::registry().with(layer).init();

        let h = Highlight(Arc::new(HighlightInner {
            log_logger: Box::new(log_logger),
            logger,
            tracer,
        }));

        log::set_boxed_logger(Box::new(h.clone())).unwrap();
        log::set_max_level(log::LevelFilter::Trace);

        Ok(h)
    }

    /// Initialize Highlight
    pub fn init(project_id: impl ToString) -> Result<Highlight, HighlightError> {
        Self::init_with_logger(project_id, env_logger::Logger::from_default_env())
    }

    /// Capture an error with session info
    ///
    /// Like Highlight::capture_error, but also lets you provide your session_id and request_id
    pub fn capture_error_with_session(
        &self,
        err: &dyn Error,
        session_id: Option<String>,
        request_id: Option<String>,
    ) {
        self.0.tracer.in_span("highlight-ctx", |cx| {
            cx.span().record_error(err);

            if let Some(session_id) = session_id {
                cx.span()
                    .set_attribute(KeyValue::new("highlight.session_id", session_id));
            }

            if let Some(request_id) = request_id {
                cx.span()
                    .set_attribute(KeyValue::new("highlight.trace_id", request_id));
            }
        });
    }

    /// Capture an error
    ///
    /// Explicitly captures any type with trait Error and sends it to Highlight.
    pub fn capture_error(&self, err: &dyn Error) {
        self.capture_error_with_session(err, None, None);
    }

    /// Create a span
    ///
    /// Creates a span for tracing. You can end it with span.end() by importing highlightio::SpanTrait.
    pub fn span(&self, name: impl Into<Cow<'static, str>>) -> Span {
        self.0.tracer.start(name)
    }
}

impl log::Log for Highlight {
    fn enabled(&self, _metadata: &log::Metadata) -> bool {
        true
    }

    fn log(&self, record: &log::Record) {
        self.0.logger.emit(
            LogRecordBuilder::new()
                .with_severity_number(match record.level() {
                    Level::Trace => Severity::Trace,
                    Level::Debug => Severity::Debug,
                    Level::Info => Severity::Info,
                    Level::Warn => Severity::Warn,
                    Level::Error => Severity::Error,
                })
                .with_severity_text(record.level().to_string())
                .with_body(format!("{}", record.args()).into())
                .with_observed_timestamp(SystemTime::now())
                .build(),
        );

        self.0.log_logger.log(record);
    }

    fn flush(&self) {
        if let Some(provider) = self.0.logger.provider() {
            provider.force_flush();
        }
    }
}

impl Drop for Highlight {
    fn drop(&mut self) {
        global::shutdown_logger_provider();
        global::shutdown_tracer_provider();
    }
}
