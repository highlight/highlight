use highlight_rust::{Highlight, HighlightOptions};
use testcontainers::clients;
use testcontainers::core::WaitFor;
use testcontainers::GenericImage;
use serde_json::Value;
use tempfile::NamedTempFile;
use highlight_rust::state::Running;
use log::{Level, Record};
use notify::{Watcher, RecursiveMode};
use futures::{
    channel::mpsc::channel,
    SinkExt, StreamExt,
};
use std::path::Path;

use notify::event::{Event,DataChange, ModifyKind, EventKind::Modify};

pub fn read_log(path: &str) -> String {
    let data = std::fs::read_to_string(path)
        .expect("Error reading otel collector output file");
    data.lines()
        .next()
        .expect("Error getting the latest log record")
        .into()
}

macro_rules! assert_log_record {
    ($rx:ident, $log_path:ident, $severity:expr, $body:expr) => {
        while let Some(res) = $rx.next().await {
            match res {
                Ok(Event {kind: Modify(ModifyKind::Data(DataChange::Any)), ..}) => {
                    break;
                },
                _ => ()
            }
        }

        let json_str = read_log(&$log_path);
        let data: Value = serde_json::from_str(&json_str).expect("Error parsing json");
        let log_record = &data["resourceLogs"][0]["scopeLogs"][0]["logRecords"][0];
        let log_severity = log_record["severityText"].as_str().unwrap();
        let log_body = log_record["body"]["stringValue"].as_str().unwrap();
        assert_eq!(log_severity, $severity);
        assert_eq!(log_body, $body);
    };
}

fn init_highlight(backend_port: u16) -> Highlight<Running> {
    let options = HighlightOptions::builder("abc123")
        .with_backend_url(format!("http://localhost:{}", backend_port))
        .build();
    Highlight::new(options).init_without_global_telemetry()
}

macro_rules! build_log_record {
    ($severity:tt, $message:tt) => {
        Record::builder()
            .args(format_args!($message))
            .level(Level::$severity)
            .build()
    };
}

macro_rules! setup {
    ($rx:tt, $path:tt, $host_port:tt) => {
        // setup collector container
        let docker = clients::Cli::default();
        let $path = NamedTempFile::new()
            .expect("Error creating temporary output file")
            .into_temp_path()
            .keep()
            .expect("Error marking temporary file as persistent")
            .into_os_string()
            .into_string()
            .unwrap();
        let image = GenericImage::new("collector-highlight-sdk", "latest")
            .with_volume(&$path, "/tmp/highlight-sdk-out.json")
            .with_exposed_port(4318)
            .with_wait_for(WaitFor::Healthcheck);
        let container = docker.run(image);
        let $host_port = container.get_host_port_ipv4(4318);
        // setup file watcher
        let (mut tx, mut $rx) = channel(1);
        let mut watcher = notify::recommended_watcher(move |res| {
            futures::executor::block_on(async {
                tx.send(res).await.unwrap();
            })
        }).unwrap();
        watcher.watch(Path::new(&$path), RecursiveMode::NonRecursive).unwrap();
    };
}

#[tokio::test]
async fn single_error_log_record() {
    setup!(change_notifier, log_path, collector_port);
    let record: Record<'_> = build_log_record!(Error, "test error");
    init_highlight(collector_port).capture_log(record);
    assert_log_record!(change_notifier, log_path, "ERROR", "test error");
}

#[tokio::test]
async fn single_warn_log_record() {
    setup!(change_notifier, log_path, collector_port);
    let record: Record<'_> = build_log_record!(Warn, "test warn");
    init_highlight(collector_port).capture_log(record);
    assert_log_record!(change_notifier, log_path, "WARN", "test warn");
}

#[tokio::test]
async fn single_info_log_record() {
    setup!(change_notifier, log_path, collector_port);
    let record: Record<'_> = build_log_record!(Info, "test info");
    init_highlight(collector_port).capture_log(record);
    assert_log_record!(change_notifier, log_path, "INFO", "test info");
}

#[tokio::test]
async fn single_debug_log_record() {
    setup!(change_notifier, log_path, collector_port);
    let record: Record<'_> = build_log_record!(Debug, "test debug");
    init_highlight(collector_port).capture_log(record);
    assert_log_record!(change_notifier, log_path, "DEBUG", "test debug");
}

#[tokio::test]
async fn single_trace_log_record() {
    setup!(change_notifier, log_path, collector_port);
    let record: Record<'_> = build_log_record!(Trace, "test trace");
    init_highlight(collector_port).capture_log(record);
    assert_log_record!(change_notifier, log_path, "TRACE", "test trace");
}