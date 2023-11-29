use core::time::Duration;
use tracing::subscriber;
use uuid::Uuid;
use std::marker::PhantomData;

use opentelemetry::global;
use opentelemetry_api::{trace::TracerProvider as _, logs::Logger};
use opentelemetry_sdk::{
    runtime, 
    trace::{self, Sampler, TracerProvider, BatchSpanProcessor},
    logs::{self, LoggerProvider, BatchLogProcessor},
    Resource
};
use opentelemetry_otlp::{
    SpanExporterBuilder,
    LogExporterBuilder,
    WithExportConfig
};
use opentelemetry_semantic_conventions::resource;
use opentelemetry_appender_log::OpenTelemetryLogBridge;
// use tracing_subscriber::Registry;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::Registry;

use super::common::meta::{self, consts};
use super::common::routes;
use super::common::attributes;
use super::common::options::HighlightOptions;
use super::common::severity::{self, HighlightLogSeverity};

use super::logger::HighlightLogger;

pub trait HighlightState {}

pub struct New;
impl HighlightState for New {}

pub struct Ready {
    logger_provider: LoggerProvider,
    tracer_provider: TracerProvider,
    // otel_logger: Box<dyn log::Log>,
    otel_trace_collector: Box<dyn tracing::Subscriber>,
    native_logger: Option<Box<dyn log::Log>>,
    native_trace_collector: Option<Box<dyn tracing::Subscriber>>
}
impl HighlightState for Ready {}

pub struct Running {
    logger_provider: LoggerProvider,
    logger: Box<dyn log::Log>
}
impl HighlightState for Running {}

pub struct RunningGlobal {}
impl HighlightState for RunningGlobal {}

#[non_exhaustive]
pub struct Highlight<S: HighlightState> {
    params: S
}

use opentelemetry_otlp::HttpExporterBuilder;

impl Highlight<New> {
    pub fn new(options: HighlightOptions) -> Highlight<Ready> {
        let backend_url = options.backend_url.clone().unwrap_or_default();
        let resource = Self::detect_resource(options);

        // logger provider
        let log_exporter = LogExporterBuilder::Http(
                HttpExporterBuilder::default().with_endpoint(routes::build_log_route(&backend_url))
            )
            .build_log_exporter()
            .unwrap();
        let log_processor = BatchLogProcessor::builder(log_exporter, runtime::TokioCurrentThread)
            .build();    
        let logger_provider = LoggerProvider::builder()
            .with_log_processor(log_processor)
            .with_config(logs::Config::default().with_resource(resource.clone()))
            .build();

        let span_exporter = SpanExporterBuilder::Http(
                HttpExporterBuilder::default().with_endpoint(routes::build_trace_route(&backend_url))
            )
            .build_span_exporter()
            .unwrap();
        let span_processor = BatchSpanProcessor::builder(span_exporter, runtime::TokioCurrentThread)
            .with_scheduled_delay(Duration::from_secs(1))
            .with_max_export_batch_size(128)
            .with_max_queue_size(128)
            .build();
        let tracer_provider = TracerProvider::builder()
            .with_span_processor(span_processor)
            .with_config(
                trace::config()
                .with_sampler(Sampler::AlwaysOn)
                .with_resource(resource)
            )
            .build();
        let tracer = tracer_provider.tracer("highlight-rust");
        let collector = tracing_opentelemetry::layer().with_tracer(tracer);
        let subscriber = Registry::default().with(collector);

        Highlight { 
            params: Ready {
                logger_provider,
                tracer_provider,
                otel_trace_collector: Box::new(subscriber),
                native_logger: None,
                native_trace_collector: None
            } 
        }
    }

    fn detect_resource(options: HighlightOptions) -> Resource {
        let attributes = vec![
            attributes::HIGHLIGHT_PROJECT_ID.string(options.project_id.unwrap_or_default()),
            resource::DEPLOYMENT_ENVIRONMENT.string(options.environment.unwrap_or_default()),
            resource::SERVICE_NAME.string(options.service_name.unwrap_or_default()),
            resource::SERVICE_VERSION.string(options.version.unwrap_or_default()),
            resource::SERVICE_INSTANCE_ID.string(Uuid::new_v4().to_string()),
            resource::TELEMETRY_SDK_NAME.string(meta::sdk::SDK_NAME),
            resource::TELEMETRY_SDK_VERSION.string(meta::sdk::SDK_VERSION),
            resource::TELEMETRY_SDK_LANGUAGE.string(meta::sdk::SDK_LANGUAGE),
            resource::OS_NAME.string(meta::os::os_name()),
            resource::OS_VERSION.string(meta::os::os_version()),
            resource::HOST_ARCH.string(meta::os::HOST_ARCH)
        ];
        Resource::new([&attributes[..], &options.attributes.unwrap_or_default()[..]].concat())
    }
}

impl Highlight<Ready> {
    pub fn with_native_logger(self, logger: Box<dyn log::Log>) -> Highlight<Ready> {
        Highlight {
            params: Ready { 
                native_logger: Some(logger), 
                ..self.params
            }
        }
    }

    pub fn with_native_trace_collector(self, subscriber: Box<dyn tracing::Subscriber>) -> Highlight<Ready>{
        Highlight {
            params: Ready { 
                native_trace_collector: Some(subscriber), 
                ..self.params
            }
        }
    }

    pub fn init(self) -> Highlight<RunningGlobal> {
        // let highlight_logger = HighlightLogger::new(self.params.otel_logger, self.params.native_logger);
        // log::set_max_level(log::Level::Error.to_level_filter());
        // log::set_boxed_logger(Box::new(highlight_logger));
        Highlight {
            params:  RunningGlobal {}
        }
    }

    pub fn init_without_global_telemetry(self) -> Highlight<Running> {
        let logger_provider = self.params.logger_provider;
        let logger = OpenTelemetryLogBridge::new(&logger_provider);
        
        Highlight {
            params:  Running {
                logger_provider,
                logger: Box::new(HighlightLogger::new(Box::new(logger), self.params.native_logger))
            }
        }
    }
}

impl Highlight<Running> {
    pub fn capture_log(&self, record: log::Record) {
        self.params.logger.log(&record);
    }
}