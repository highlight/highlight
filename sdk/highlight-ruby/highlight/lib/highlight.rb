require 'date'
require 'highlight/version'
require 'json'
require 'logger'
require 'opentelemetry/exporter/otlp'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry/sdk'
require 'opentelemetry/semantic_conventions'
require 'securerandom'

module Highlight
  HighlightHeaders = Struct.new('HighlightHeaders', :session_id, :request_id)

  module Tracing
    class BaggageSpanProcessor < OpenTelemetry::SDK::Trace::SpanProcessor
      def on_start(span, parent_context)
        span.add_attributes(OpenTelemetry::Baggage.values(context: parent_context))
      end
    end
  end

  def self.init(project_id, environment: '', otlp_endpoint: H::OTLP_HTTP, &block)
    H.new(project_id, environment: environment, otlp_endpoint: otlp_endpoint, &block)
  end

  def self.start_span(name, attrs = {}, &block)
    if H.initialized?
      H.instance.start_span(name, attrs, &block)
    elsif block_given?
      yield(OpenTelemetry::Trace::Span::INVALID)
    end
  end

  def self.log(level, message, attrs = {})
    return unless H.initialized?

    H.instance&.record_log(nil, nil, level, message, attrs)
  end

  def self.exception(error, attrs = {})
    return unless H.initialized?

    H.instance&.record_exception(error, attrs)
  end

  def self.traceparent_meta
    return unless H.initialized?

    Helpers.traceparent_meta
  end

  def self.traceparent_meta_tag
    return unless H.initialized?

    Helpers.traceparent_meta_tag
  end

  def self.flush
    return unless H.initialized?

    H.instance.flush
  end

  def self.shutdown
    return unless H.initialized?

    H.instance.shutdown
  end

  class H
    SDK_NAME = 'highlight-ruby'.freeze
    OTLP_HTTP = 'https://otel.highlight.io:4318'.freeze
    HIGHLIGHT_REQUEST_HEADER = 'X-Highlight-Request'.freeze
    HIGHLIGHT_PROJECT_ATTRIBUTE = 'highlight.project_id'.freeze
    HIGHLIGHT_SESSION_ATTRIBUTE = 'highlight.session_id'.freeze
    HIGHLIGHT_TRACE_ATTRIBUTE = 'highlight.trace_id'.freeze
    LOG_EVENT = 'log'.freeze
    LOG_SEVERITY_ATTRIBUTE = 'log.severity'.freeze
    LOG_MESSAGE_ATTRIBUTE = 'log.message'.freeze
    CODE_FILEPATH = OpenTelemetry::SemanticConventions::Trace::CODE_FILEPATH
    CODE_LINENO = OpenTelemetry::SemanticConventions::Trace::CODE_LINENO
    CODE_FUNCTION = OpenTelemetry::SemanticConventions::Trace::CODE_FUNCTION
    DEPLOYMENT_ENVIRONMENT_ATTRIBUTE = OpenTelemetry::SemanticConventions::Resource::DEPLOYMENT_ENVIRONMENT
    HIGHLIGHT_SDK_VERSION_ATTRIBUTE = 'telemetry.distro.version'.freeze
    HIGHLIGHT_SDK_NAME_ATTRIBUTE = 'telemetry.distro.name'.freeze

    class << self
      attr_reader :instance
    end

    def self.initialized?
      !@instance.nil?
    end

    def self.parse_headers(headers)
      return HighlightHeaders.new(nil, nil) if headers.nil? || !headers.key?(HIGHLIGHT_REQUEST_HEADER)

      session_id, request_id = headers[HIGHLIGHT_REQUEST_HEADER].split('/')
      traceparent = headers['traceparent']
      trace_id = traceparent&.split('-')&.[](1) || request_id
      HighlightHeaders.new(session_id, trace_id)
    end

    def self.log_level_string(level)
      case level
      when Logger::FATAL then 'FATAL'
      when Logger::ERROR then 'ERROR'
      when Logger::WARN then 'WARN'
      when Logger::INFO then 'INFO'
      when Logger::DEBUG then 'DEBUG'
      else 'UNKNOWN'
      end
    end

    def initialize(project_id, environment: '', otlp_endpoint: OTLP_HTTP, &block)
      self.class.instance_variable_set(:@instance, self)

      @project_id = project_id
      @otlp_endpoint = otlp_endpoint
      @environment = environment

      configure_opentelemetry(&block)

      @tracer_provider = OpenTelemetry.tracer_provider
      @tracer = @tracer_provider.tracer('highlight-tracer')
    end

    def initialized?
      !@tracer_provider.nil?
    end

    def flush
      @tracer_provider&.force_flush
    end

    def shutdown
      @tracer_provider&.shutdown
    end

    def trace(session_id, request_id, attrs = {}, name: 'highlight.span', &block)
      return unless initialized?

      ctx = OpenTelemetry::Baggage.set_value(HIGHLIGHT_SESSION_ATTRIBUTE, session_id || '')
      ctx = OpenTelemetry::Baggage.set_value(HIGHLIGHT_TRACE_ATTRIBUTE, request_id || '', context: ctx)
      OpenTelemetry::Context.with_current(ctx) { start_span(name, attrs, &block) }
    end

    def start_span(name, attrs = {})
      return unless initialized?

      @tracer.in_span(name, attributes: attrs.transform_keys(&:to_s)) { |span| yield(span) if block_given? }
    end

    def record_exception(e, attrs = {})
      return unless initialized?

      OpenTelemetry::Trace.current_span&.record_exception(e, attributes: attrs.transform_keys(&:to_s))
    end

    def record_log(session_id, request_id, level, message, attrs = {})
      return unless initialized?

      log_attributes = create_log_attributes(level, message, attrs)

      @tracer.in_span(
        'highlight.log',
        attributes: {
          HIGHLIGHT_SESSION_ATTRIBUTE => session_id || '',
          HIGHLIGHT_TRACE_ATTRIBUTE => request_id || ''
        }.compact
      ) do |span|
        span.status = OpenTelemetry::Trace::Status.error(message) if [Logger::ERROR, Logger::FATAL].include?(level)
        span.add_event(LOG_EVENT, attributes: log_attributes)
      end
    end

    private

    def configure_opentelemetry
      OpenTelemetry::SDK.configure do |c|
        c.add_span_processor(Highlight::Tracing::BaggageSpanProcessor.new)
        c.add_span_processor(create_batch_span_processor)
        c.resource = create_resource
        c.use_all
        yield(c) if block_given?
      end
    end

    def create_batch_span_processor
      OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(
        OpenTelemetry::Exporter::OTLP::Exporter.new(
          endpoint: "#{@otlp_endpoint}/v1/traces",
          compression: 'gzip'
        ),
        schedule_delay: 1000,
        max_export_batch_size: 128,
        max_queue_size: 1024
      )
    end

    def create_resource
      OpenTelemetry::SDK::Resources::Resource.create(
        HIGHLIGHT_PROJECT_ATTRIBUTE => @project_id,
        HIGHLIGHT_SDK_VERSION_ATTRIBUTE => Highlight::VERSION,
        HIGHLIGHT_SDK_NAME_ATTRIBUTE => SDK_NAME,
        DEPLOYMENT_ENVIRONMENT_ATTRIBUTE => @environment
      )
    end

    def create_log_attributes(level, message, attrs)
      caller_info = parse_caller_info

      {
        LOG_SEVERITY_ATTRIBUTE => self.class.log_level_string(level),
        LOG_MESSAGE_ATTRIBUTE => message.to_s,
        CODE_FILEPATH => caller_info.first,
        CODE_LINENO => caller_info[1],
        CODE_FUNCTION => caller_info[2]
      }.merge(attrs).transform_keys(&:to_s)
    end

    def parse_caller_info
      caller_info = caller.first.split(':', 3)
      function = caller_info[2]&.gsub(/^in `|'$/, '')
      [caller_info.first, caller_info[1], function]
    end
  end

  class Logger < ::Logger
    include ActiveSupport::LoggerSilence if defined?(::ActiveSupport::LoggerSilence)

    def initialize(*args)
      super
      @local_level = nil
    end

    def add(severity, message = nil, progname = nil, &block)
      severity ||= ::Logger::UNKNOWN
      return true if @logdev.nil? || severity < level

      progname ||= @progname
      message = yield if message.nil? && block_given?
      message = progname if message.nil?

      super
      H.instance&.record_log(nil, nil, severity, message)
    end
  end

  module Integrations
    module Rails
      def self.included(base)
        base.extend(ClassMethods)
        base.helper_method(:highlight_headers)
        base.around_action(:with_highlight_context)
        base.helper(ViewHelpers)
      end

      def with_highlight_context(&block)
        return yield unless H.initialized?

        set_highlight_headers
        H.instance.trace(
          highlight_headers.session_id,
          highlight_headers.request_id,
          name: "#{request.method.upcase} #{request.path}",
          &block
        )
      end

      private

      def set_highlight_headers
        @highlight_headers = H.parse_headers(request.headers)
        return if @highlight_headers.session_id

        session_id = request.cookies['sessionID'].presence || SecureRandom.alphanumeric(28)
        session_data_key = "sessionData_#{session_id}"
        @session_data = request.cookies[session_data_key] || create_session_data(session_id)

        set_cookies(session_id, session_data_key)
        @highlight_headers = HighlightHeaders.new(session_id, nil)
      end

      def create_session_data(session_id)
        {
          sessionSecureID: session_id,
          projectID: @project_id,
          payloadID: 1,
          sessionStartTime: Time.now.strftime('%Q'),
          lastPushTime: Time.now.strftime('%Q')
        }
      end

      def set_cookies(session_id, session_data_key)
        expiration = 15.minutes.from_now

        cookies[:sessionID] = { value: session_id, expires: expiration }
        cookies[session_data_key] = { value: @session_data.to_json, expires: expiration }
      end

      def highlight_headers
        @highlight_headers
      end

      module ClassMethods
      end

      module ViewHelpers
        def highlight_traceparent_meta
          tag.meta(name: 'traceparent', content: Helpers.traceparent_meta)
        end
      end
    end
  end

  module Helpers
    if defined?(ActionView)
      include ActionView::Helpers
      extend ActionView::Helpers::TagHelper
    end

    def self.traceparent_meta
      current_trace = OpenTelemetry::Trace.current_span
      trace_id = current_trace&.context&.trace_id
      span_id = current_trace&.context&.span_id
      hex_trace_id = trace_id&.unpack1('H*') || ('0' * 32)
      hex_span_id = span_id&.unpack1('H*') || ('0' * 16)

      "00-#{hex_trace_id}-#{hex_span_id}-01"
    end

    def self.traceparent_meta_tag
      "<meta name=\"traceparent\" content=\"#{traceparent_meta}\">"
    end
  end

  if defined?(::Rails::Railtie)
    class Railtie < ::Rails::Railtie
      config.after_initialize do
        ActiveSupport.on_load(:action_controller) do
          include ::Highlight::Integrations::Rails
        end
      end
    end
  end
end
