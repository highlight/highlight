/// Official [Highlight.io](https://highlight.io) SDK for Rust. Refer to our docs on how to get started with
/// [error monitoring](https://www.highlight.io/docs/getting-started/backend-sdk/rust/other)
/// [logging](https://www.highlight.io/docs/getting-started/backend-logging/rust/other), and
/// [tracing](https://www.highlight.io/docs/getting-started/backend-tracing/rust/manual), or you can also check out the
/// [detailed API reference](https://www.highlight.io/docs/sdk/rust).

#[cfg(not(any(feature = "sync", feature = "tokio", feature = "tokio-current-thread", feature = "async-std")))]
compile_error!("No runtime enabled for highlightio, please specify one of the following features: sync (default), tokio, async-std");

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
    trace::{Status, TraceContextExt, Tracer as _},
    KeyValue,
};
use opentelemetry_appender_tracing::layer::OpenTelemetryTracingBridge;
use opentelemetry_otlp::{
    LogExporterBuilder, OtlpLogPipeline, OtlpTracePipeline, SpanExporterBuilder, WithExportConfig,
};
use opentelemetry_sdk::{
    logs::{self, Logger},
    propagation::TraceContextPropagator,
    resource::Resource,
    trace::{self, BatchConfig, Span, Tracer},
};

mod error;

pub use error::HighlightError;
use opentelemetry_semantic_conventions::resource::{SERVICE_NAME, SERVICE_VERSION};
use tracing_subscriber::{layer::SubscriberExt as _, util::SubscriberInitExt as _};

pub mod otel {
    pub use opentelemetry::KeyValue;
}

pub struct HighlightConfig {
    /// Your highlight.io Project ID
    pub project_id: String,

    /// The name of your app.
    pub service_name: Option<String>,

    /// The version of your app. We recommend setting this to the most recent deploy SHA of your app.
    pub service_version: Option<String>,

    /// The current logger (implements log::Log).
    ///
    /// By default, Highlight will initialize an env_logger for you, but if you want to provide a custom logger, you can specify it here.
    /// If you provide a custom logger, do not make it global, as Highlight will do it for you.
    pub logger: Box<dyn Log>,
}

impl Default for HighlightConfig {
    fn default() -> Self {
        Self {
            project_id: Default::default(),
            service_name: Default::default(),
            service_version: Default::default(),
            logger: Box::new(env_logger::Logger::from_default_env()),
        }
    }
}

struct HighlightInner {
    config: HighlightConfig,
    logger: Logger,
    tracer: Tracer,
}

#[derive(Clone)]
pub struct Highlight(Arc<HighlightInner>);

impl Highlight {
    #[cfg(not(any(feature = "sync", feature = "tokio", feature = "tokio-current-thread", feature = "async-std")))]
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

    #[cfg(all(feature = "tokio-current-thread", not(any(feature = "sync"))))]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        Ok((
            logging.install_batch(opentelemetry_sdk::runtime::TokioCurrentThread)?,
            tracing.install_batch(opentelemetry_sdk::runtime::TokioCurrentThread)?,
        ))
    }

    #[cfg(all(feature = "tokio", not(any(feature = "sync", feature = "tokio-current-thread"))))]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        Ok((
            logging.install_batch(opentelemetry_sdk::runtime::Tokio)?,
            tracing.install_batch(opentelemetry_sdk::runtime::Tokio)?,
        ))
    }

    #[cfg(all(feature = "async-std", not(any(feature = "sync", feature = "tokio", feature = "tokio-current-thread"))))]
    fn install_pipelines(
        logging: OtlpLogPipeline<LogExporterBuilder>,
        tracing: OtlpTracePipeline<SpanExporterBuilder>,
    ) -> Result<(Logger, Tracer), HighlightError> {
        Ok((
            logging.install_batch(opentelemetry_sdk::runtime::AsyncStd)?,
            tracing.install_batch(opentelemetry_sdk::runtime::AsyncStd)?,
        ))
    }

    fn get_default_resource(config: &HighlightConfig) -> Resource {
        let mut attrs = Vec::with_capacity(2);
        attrs.push(KeyValue::new(
            "highlight.project_id",
            config.project_id.clone(),
        ));

        if let Some(service_name) = &config.service_name {
            attrs.push(KeyValue::new(SERVICE_NAME, service_name.to_owned()));
        }

        if let Some(service_version) = &config.service_version {
            attrs.push(KeyValue::new(SERVICE_VERSION, service_version.to_owned()));
        }

        Resource::new(attrs)
    }

    fn make_install_pipelines(
        config: &HighlightConfig,
    ) -> Result<(Logger, Tracer), HighlightError> {
        let logging = opentelemetry_otlp::new_pipeline()
            .logging()
            .with_log_config(
                logs::Config::default().with_resource(Self::get_default_resource(config)),
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
                    .with_resource(Self::get_default_resource(config)),
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

        Self::install_pipelines(logging, tracing)
    }

    /// Initialize Highlight.
    pub fn init(config: HighlightConfig) -> Result<Highlight, HighlightError> {
        if config.project_id == String::default() {
            return Err(HighlightError::Config(
                "You must specify a project_id in your HighlightConfig".to_string(),
            ));
        }

        global::set_text_map_propagator(TraceContextPropagator::new());
        let (logger, tracer) = Self::make_install_pipelines(&config)?;

        let layer = OpenTelemetryTracingBridge::new(&global::logger_provider());
        tracing_subscriber::registry().with(layer).init();

        let h = Highlight(Arc::new(HighlightInner {
            config,
            logger,
            tracer,
        }));

        log::set_boxed_logger(Box::new(h.clone())).unwrap();
        log::set_max_level(log::LevelFilter::Trace);

        Ok(h)
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

            cx.span().set_status(Status::error(format!("{:?}", err)));
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

    /// Returns the project ID.
    pub fn project_id(&self) -> String {
        self.0.config.project_id.clone()
    }

    /// Shuts down the Highlight logger and tracer.
    /// This allows for the logs and traces to flush while the runtime is still around.
    /// If this method is not called, logs and traces that happened right before your app exits will not be transmitted to Highlight.
    pub fn shutdown(self) {
        global::shutdown_logger_provider();
        global::shutdown_tracer_provider();
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

        self.0.config.logger.log(record);
    }

    fn flush(&self) {
        if let Some(provider) = self.0.logger.provider() {
            provider.force_flush();
        }
    }
}
