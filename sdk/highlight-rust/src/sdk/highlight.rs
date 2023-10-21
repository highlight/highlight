use core::time::Duration;
use uuid::Uuid;

use opentelemetry::global;
use opentelemetry_api::trace::TracerProvider as _;
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

use super::common::meta;
use super::common::routes;
use super::common::attributes;
use super::HighlightOptions;

pub struct Highlight;

impl Highlight {
    pub fn init(options: HighlightOptions) {
        let backend_url = options.backend_url.clone().unwrap_or_default();
        let resource = Self::detect_resources(options);
        Self::init_tracer(&backend_url, resource.clone());
        Self::init_logger(&backend_url, resource);
    }

    fn init_logger(backend: &str, resource: Resource) {
        let http_exporter = opentelemetry_otlp::new_exporter()
            .http()
            .with_endpoint(routes::build_log_route(backend));
        let log_exporter = LogExporterBuilder::Http(http_exporter)
            .build_log_exporter()
            .unwrap();
        let log_processor = BatchLogProcessor::builder(log_exporter, runtime::TokioCurrentThread)
            .build();    
        let logger_provider = LoggerProvider::builder()
            .with_log_processor(log_processor)
            .with_config(logs::Config::default().with_resource(resource))
            .build();
        global::set_logger_provider(logger_provider);
        log::set_max_level(log::Level::Error.to_level_filter());        
        let highlight_logger = OpenTelemetryLogBridge::new(&global::logger_provider());
        log::set_boxed_logger(Box::new(highlight_logger)).
            expect("Failed to install logger.");
    }

    fn init_tracer(backend: &str, resource: Resource) {
        let http_exporter = opentelemetry_otlp::new_exporter()
            .http()
            .with_endpoint(routes::build_trace_route(backend));
        let trace_exporter = SpanExporterBuilder::Http(http_exporter)
            .build_span_exporter()
            .unwrap();
        let trace_processor = BatchSpanProcessor::builder(trace_exporter, runtime::TokioCurrentThread)
            .with_scheduled_delay(Duration::from_secs(1))
            .with_max_export_batch_size(128)
            .with_max_queue_size(128)
            .build();
        let tracer_provider = TracerProvider::builder()
            .with_span_processor(trace_processor)
            .with_config(
                trace::config()
                .with_sampler(Sampler::AlwaysOn)
                .with_resource(resource)
            )
            .build();
        let tracer = tracer_provider.tracer("highlight-ctx");
        global::set_tracer_provider(tracer_provider);
        let telemetry = tracing_opentelemetry::layer().with_tracer(tracer);
        // let subscriber = Registry::default().with(telemetry);
        let subscriber = tracing_subscriber::FmtSubscriber::new().with(telemetry);
        tracing::subscriber::set_global_default(subscriber)
            .expect("Failed to install tracing subscriber.");
    } 

    fn detect_resources(options: HighlightOptions) -> Resource {
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
