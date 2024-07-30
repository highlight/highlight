require 'opentelemetry/sdk'
require 'opentelemetry/exporter/otlp'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry/semantic_conventions'
require 'active_support/logger_silence'
require 'logger'

module Highlight
  module Tracing
    class BaggageSpanProcessor < OpenTelemetry::SDK::Trace::SpanProcessor
      def on_start(span, parent_context)
        span.add_attributes(OpenTelemetry::Baggage.values(context: parent_context))
      end
    end
  end

  def self.start_span(name, attrs = {})
    if block_given?
      H.instance.start_span(name, attrs) { |span| yield span }
    else
      H.instance.start_span(name, attrs) { |_| }
    end
  end

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
        c.add_span_processor(Highlight::Tracing::BaggageSpanProcessor.new)

        c.add_span_processor(
          OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(
            OpenTelemetry::Exporter::OTLP::Exporter.new(
              endpoint: "#{@otlp_endpoint}/v1/traces",
              compression: 'gzip'
            ),
            schedule_delay: 1000,
            max_export_batch_size: 128,
            max_queue_size: 1024,
          )
        )

        c.resource = OpenTelemetry::SDK::Resources::Resource.create(
          OpenTelemetry::SemanticConventions::Resource::DEPLOYMENT_ENVIRONMENT => environment
        )

        yield c if block_given?
      end

      @tracer_provider = OpenTelemetry.tracer_provider
      @tracer = @tracer_provider.tracer('highlight-tracer')
    end

    def initialized?
      defined?(@tracer_provider)
    end

    def flush
      return unless initialized?
      @tracer_provider.force_flush
    end

    def trace(session_id, request_id, attrs = {})
      return unless initialized?

      # TODO: Need to figure out why propogation isn't working for associating
      # spans.

      # Passed along by the BaggageSpanProcessor to child spans as attributes
      OpenTelemetry::Baggage.set_value(HIGHLIGHT_SESSION_ATTRIBUTE, session_id)
      OpenTelemetry::Baggage.set_value(HIGHLIGHT_TRACE_ATTRIBUTE, request_id)

      start_span('highlight-ctx', attrs) do |span|
        yield span
      end
    end

    def start_span(name, attrs = {})
      return unless initialized?

      attributes = {
        HIGHLIGHT_PROJECT_ATTRIBUTE => @project_id,
      }.merge(attrs).compact

      if block_given?
        @tracer.in_span(name, attributes: attributes) { |span| yield span }
      else
        @tracer.in_span(name, attributes: attributes) { |_| }
      end
    end

    def record_exception(e, attrs = {})
      return unless initialized?

      span = OpenTelemetry::Trace.current_span
      return unless span

      span.record_exception(e, attributes: attrs)
    end

    # rubocop:disable Metrics/AbcSize
    def record_log(session_id, request_id, level, message, attrs = {})
      return unless initialized?

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
        traceparent = headers['traceparent']
        trace_id = traceparent&.split('-')&.second || request_id
        puts "trace_id: #{trace_id}"
        return HighlightHeaders.new(session_id, trace_id)
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

    private

    def trace_id_from_headers(headers)
      return headers.traceparent&.split('-')&.first
    end
  end

  class Logger < ::Logger
    include ActiveSupport::LoggerSilence

    def initialize(*args)
      super
      @local_level = nil # Ensure compatibility with LoggerSilence
    end

    def add(severity, message = nil, progname = nil, &block)
      severity ||= UNKNOWN
      return true if @logdev.nil? || severity < level

      progname = @progname if progname.nil?
      if message.nil?
        if block_given?
          message = yield
        else
          message = progname
          progname = @progname
        end
      end
      super(severity, message, progname, &block)
      H.instance.record_log(nil, nil, severity, message)
    end
  end

  module Integrations
    module Rails
      def self.included(base)
        base.extend(ClassMethods)
        base.helper_method(:highlight_headers)
      end

      def with_highlight_context(&block)
        set_highlight_headers
        H.instance.trace(highlight_headers.session_id, highlight_headers.request_id, &block)
      end

      private

      def set_highlight_headers
        @highlight_headers = H.parse_headers(request.headers)
      end

      def highlight_headers
        @highlight_headers
      end

      module ClassMethods
      end
    end
  end
end
