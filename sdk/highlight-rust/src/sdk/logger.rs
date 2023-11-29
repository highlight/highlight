use log::Log;
use opentelemetry_appender_log::OpenTelemetryLogBridge;

pub struct HighlightLogger
{
    otel_logger: Box<dyn Log>,
    native_logger: Option<Box<dyn Log>>
}

impl HighlightLogger {
    pub fn new(otel_logger: Box<dyn Log>, native_logger: Option<Box<dyn Log>>) -> Self   {
        Self {
            otel_logger,
            native_logger
        }
    }
}

impl log::Log for HighlightLogger
{
    fn enabled(&self, metadata: &log::Metadata) -> bool {
        true
    }

    fn log(&self, record: &log::Record) {
        println!("recoridnign {:?}", record);
        if self.native_logger.is_some() {
            self.native_logger.as_ref().unwrap().log(record);            
        }
        self.otel_logger.log(record);
    }

    fn flush(&self) {
        if self.native_logger.is_some() {
            self.native_logger.as_ref().unwrap().flush();
        }
        self.otel_logger.flush();
    }
}