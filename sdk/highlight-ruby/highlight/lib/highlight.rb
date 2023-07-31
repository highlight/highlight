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
            return @@instance
        end

        def initialize(project_id, otlp_endpoint=OTLP_HTTP)
            @@instance = self

            @project_id = project_id
            @otlp_endpoint = otlp_endpoint

            OpenTelemetry::SDK.configure do |c|
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
            return unless span
            span.record_exception(e)
        end

        def record_log(session_id, request_id, level, message, attrs = {})
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
                }.merge(attrs))
            end
        end

        HighlightHeaders = Struct.new("HighlightHeaders", :session_id, :request_id)
        def self.parse_headers(headers)
            if headers && headers[HIGHLIGHT_REQUEST_HEADER]
                session_id, request_id = headers[HIGHLIGHT_REQUEST_HEADER].split("/")
                return HighlightHeaders.new(session_id, request_id)
            end
            return HighlightHeaders.new(nil, nil)
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
    end

    class Logger < ::Logger
        def add(severity, message = nil, progname = nil)
            # https://github.com/ruby/logger/blob/master/lib/logger.rb
            severity ||= UNKNOWN
            if @logdev.nil? or severity < level
                return true
            end
            if progname.nil?
                progname = @progname
            end
            if message.nil?
                if block_given?
                    message = yield
                else
                    message = progname
                    progname = @progname
                end
            end
            super
            H.instance.record_log(nil, nil, severity, message)
        end
    end

    module Integrations
        module Rails
            def with_highlight_context
                highlight_headers = H.parse_headers(request.headers)
                H.instance.trace(highlight_headers.session_id, highlight_headers.request_id) { yield }
            end
        end
    end
end
