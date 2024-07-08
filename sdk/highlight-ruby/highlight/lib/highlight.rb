require 'opentelemetry/sdk'
require 'opentelemetry/exporter/otlp'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry/semantic_conventions'
require 'logger'

module Highlight
  class H
    HIGHLIGHT_REQUEST_HEADER = 'X-Highlight-Request'.freeze
    OTLP_HTTP = 'https://otel.highlight.io:4318'.freeze
    HIGHLIGHT_PROJECT_ATTRIBUTE = 'highlight.project_id'.freeze
    HIGHLIGHT_SESSION_ATTRIBUTE = 'highlight.session_id'.freeze
    HIGHLIGHT_TRACE_ATTRIBUTE = 'highlight.trace_id'.freeze
    LOG_EVENT = 'log'.freeze
    LOG_SEVERITY_ATTRIBUTE = 'log.severity'.freeze
    LOG_MESSAGE_ATTRIBUTE = 'log.message'.freeze
    CODE_FILEPATH = OpenTelemetry::SemanticConventions::Trace::CODE_FILEPATH
    CODE_LINENO = OpenTelemetry::SemanticConventions::Trace::CODE_LINENO
    CODE_FUNCTION = OpenTelemetry::SemanticConventions::Trace::CODE_FUNCTION

    def self.instance
      @@instance
    end

    def initialize(project_id, environment: '', otlp_endpoint: OTLP_HTTP)
      @@instance = self # rubocop:disable Style/ClassVars

      @project_id = project_id
      @otlp_endpoint = otlp_endpoint

      OpenTelemetry::SDK.configure do |c|
        c.add_span_processor(OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(
                               OpenTelemetry::Exporter::OTLP::Exporter.new(
                                 endpoint: "#{@otlp_endpoint}/v1/traces", compression: 'gzip'
                               ), schedule_delay: 1000, max_export_batch_size: 128, max_queue_size: 1024
                             ))

        c.resource = OpenTelemetry::SDK::Resources::Resource.create(
          OpenTelemetry::SemanticConventions::Resource::DEPLOYMENT_ENVIRONMENT => environment
        )

        yield c if block_given?
      end

      @tracer_provider = OpenTelemetry.tracer_provider
      @tracer = @tracer_provider.tracer('highlight-tracer')
    end

    def flush
      @tracer_provider.force_flush
    end

    def trace(session_id, request_id, attrs = {})
      @tracer.in_span('highlight-ctx', attributes: {
        HIGHLIGHT_PROJECT_ATTRIBUTE => @project_id,
        HIGHLIGHT_SESSION_ATTRIBUTE => session_id,
        HIGHLIGHT_TRACE_ATTRIBUTE => request_id
      }.merge(attrs).compact) do |_span|
        yield
      end
    end

    def record_exception(e, attrs = {})
      span = OpenTelemetry::Trace.current_span
      return unless span

      span.record_exception(e, attributes: attrs)
    end

    # rubocop:disable Metrics/AbcSize
    def record_log(session_id, request_id, level, message, attrs = {})
      caller_info = caller[0].split(':', 3)
      function = caller_info[2]
      if function
        # format: "in `<function_name>""
        function.delete_prefix!('in `')
        function.delete_suffix!('"')
      end
      @tracer.in_span('highlight-ctx', attributes: {
        HIGHLIGHT_PROJECT_ATTRIBUTE => @project_id,
        HIGHLIGHT_SESSION_ATTRIBUTE => session_id,
        HIGHLIGHT_TRACE_ATTRIBUTE => request_id
      }.compact) do |span|
        span.status = OpenTelemetry::Trace::Status.error(message) if [Logger::ERROR, Logger::FATAL].include?(level)
        span.add_event(LOG_EVENT, attributes: {
          LOG_SEVERITY_ATTRIBUTE => H.log_level_string(level),
          LOG_MESSAGE_ATTRIBUTE => message.to_s,
          CODE_FILEPATH => caller_info[0],
          CODE_LINENO => caller_info[1],
          CODE_FUNCTION => function
        }.merge(attrs))
      end
    end
    # rubocop:enable Metrics/AbcSize

    HighlightHeaders = Struct.new('HighlightHeaders', :session_id, :request_id)
    def self.parse_headers(headers)
      if headers && headers[HIGHLIGHT_REQUEST_HEADER]
        session_id, request_id = headers[HIGHLIGHT_REQUEST_HEADER].split('/')
        return HighlightHeaders.new(session_id, request_id)
      end
      HighlightHeaders.new(nil, nil)
    end

    def self.log_level_string(level)
      case level
      when Logger::UNKNOWN
        'UNKNOWN'
      when Logger::FATAL
        'FATAL'
      when Logger::ERROR
        'ERROR'
      when Logger::WARN
        'WARN'
      when Logger::INFO
        'INFO'
      when Logger::DEBUG
        'DEBUG'
      else
        'UNKNOWN'
      end
    end
  end

  class Logger < ::Logger
    def add(severity, message = nil, progname = nil)
      # https://github.com/ruby/logger/blob/master/lib/logger.rb
      severity ||= UNKNOWN
      return true if @logdev.nil? or severity < level # rubocop:disable Style/AndOr

      progname = @progname if progname.nil?
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
      def with_highlight_context(&block)
        highlight_headers = H.parse_headers(request.headers)
        H.instance.trace(highlight_headers.session_id, highlight_headers.request_id, &block)
      end
    end
  end
end
