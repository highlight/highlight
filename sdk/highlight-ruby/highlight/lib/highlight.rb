require "highlight/version"
require "opentelemetry/sdk"
require "opentelemetry/exporter/otlp"
require "opentelemetry/instrumentation/all"
require "opentelemetry/semantic_conventions"
require "logger"

module Highlight
  class H
    HIGHLIGHT_REQUEST_HEADER = "X-Highlight-Request"
    OTLP_HTTP = "https://otel.highlight.io:4318"
    HIGHLIGHT_PROJECT_ATTRIBUTE = "highlight.project_id"
    HIGHLIGHT_SESSION_ATTRIBUTE = "highlight.session_id"
    HIGHLIGHT_TRACE_ATTRIBUTE = "highlight.trace_id"
    LOG_EVENT = "log"
    LOG_SEVERITY_ATTRIBUTE = "log.severity"
    LOG_MESSAGE_ATTRIBUTE = "log.message"
    CODE_FILEPATH = OpenTelemetry::SemanticConventions::Trace::CODE_FILEPATH
    CODE_LINENO = OpenTelemetry::SemanticConventions::Trace::CODE_LINENO
    CODE_FUNCTION = OpenTelemetry::SemanticConventions::Trace::CODE_FUNCTION

    def self.instance
        if @@instance == nil
            raise NotImplementedError "highlight H object is not configured, please instantiate it by calling H()"
        end
        return @@instance
    end

    def initialize(project_id, integrations=[], record_logs=true, otlp_endpoint=OTLP_HTTP)
        @@instance = self

        @project_id = project_id
        @integrations = integrations || []
        @record_logs = record_logs
        @otlp_endpoint = otlp_endpoint || H.OTLP_HTTP

        OpenTelemetry::SDK.configure do |c|
            c.service_name = "highlight-sdk"
            c.add_span_processor(OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(
                OpenTelemetry::Exporter::OTLP::Exporter.new(endpoint: @otlp_endpoint + "/v1/traces")
            ))
        end

        @tracer_provider = OpenTelemetry.tracer_provider
        @tracer = @tracer_provider.tracer("highlight-tracer")
    end

    def flush
        @tracer_provider.force_flush
    end

    def trace(session_id, request_id)
        @tracer.in_span("highlight-ctx", attributes: { 
            HIGHLIGHT_PROJECT_ATTRIBUTE => @project_id, 
            HIGHLIGHT_SESSION_ATTRIBUTE => session_id,
            HIGHLIGHT_TRACE_ATTRIBUTE => request_id,
        }.compact) do |span|
            begin
                yield
            rescue => e
                record_exception(e)
                raise
            end
        end
    end

    def record_exception(e)
        span = OpenTelemetry::Trace.current_span
        if !span
            raise "H.record_exception called without a span context"
        end
        span.record_exception(e)
    end

    def record_log(session_id, request_id, level, message)
        caller_info = caller[0].split(":", 3)
        function = caller_info[2]
        if function
            # format: "in `<function_name>""
            function.delete_prefix!("in `")
            function.delete_suffix!("\"")
        end
        @tracer.in_span("highlight-ctx", attributes: { 
            HIGHLIGHT_PROJECT_ATTRIBUTE => @project_id, 
            HIGHLIGHT_SESSION_ATTRIBUTE => session_id,
            HIGHLIGHT_TRACE_ATTRIBUTE => request_id,
        }.compact) do |span|
            if level == Logger::ERROR || level == Logger::FATAL
                span.status = OpenTelemetry::Trace::Status.error(message)
            end
            span.add_event(LOG_EVENT, attributes: {
                LOG_SEVERITY_ATTRIBUTE => H.log_level_string(level),
                LOG_MESSAGE_ATTRIBUTE => message,
                CODE_FILEPATH => caller_info[0],
                CODE_LINENO => caller_info[1],
                CODE_FUNCTION => function,
            })
        end
    end

    InjectedHeaders = Struct.new("InjectedHeaders", :secureSessionId, :requestId)
    def self.parse_headers(headers)
        if headers && headers[HIGHLIGHT_REQUEST_HEADER]
            secureSessionId, requestId = headers[HIGHLIGHT_REQUEST_HEADER].split("/")
            return InjectedHeaders.new(secureSessionId, requestId)
        end
        return InjectedHeaders.new(nil, nil)
    end

    private
    
    def self.log_level_string(level)
        case level
        when Logger::UNKNOWN
            "UNKNOWN"
        when Logger::FATAL
            "FATAL"
        when Logger::ERROR
            "ERROR"
        when Logger::WARN
            "WARN"
        when Logger::INFO
            "INFO"
        when Logger::DEBUG
            "DEBUG"
        else
            "UNKNOWN"
        end
    end

    class LoggerWrapper < SimpleDelegator
        def add(severity, message = nil, progname = nil)
            if message.nil?
                if block_given?
                    message = yield
                else
                    message = progname
                end
            end
            super(severity, message, progname)
            if severity >= level
                H.instance.record_log(nil, nil, severity, message)
            end
            true
        end
        alias log add

        def debug(progname = nil, &block)
            add(Logger::DEBUG, nil, progname, &block)
        end

        def info(progname = nil, &block)
            add(Logger::INFO, nil, progname, &block)
        end

        def warn(progname = nil, &block)
            add(Logger::WARN, nil, progname, &block)
        end

        def error(progname = nil, &block)
            add(Logger::ERROR, nil, progname, &block)
        end

        def fatal(progname = nil, &block)
            add(Logger::FATAL, nil, progname, &block)
        end

        def unknown(progname = nil, &block)
            add(Logger::UNKNOWN, nil, progname, &block)
        end
    end
  end
end
