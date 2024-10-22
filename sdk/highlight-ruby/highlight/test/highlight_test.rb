require_relative 'test_helper'
require 'opentelemetry/sdk'

class HighlightTest < Minitest::Test
  def setup
    @project_id = 'qe9y4yg1'
    @environment = 'ci-test'
    @service_name = 'my-app'
    @service_version = '1.0.0'

    @highlight =
      Highlight.init(@project_id, environment: @environment) do |c|
        c.service_name = @service_name
        c.service_version = @service_version
      end

    @memory_exporter = OpenTelemetry::SDK::Trace::Export::InMemorySpanExporter.new
    span_processor = OpenTelemetry::SDK::Trace::Export::SimpleSpanProcessor.new(@memory_exporter)
    OpenTelemetry.tracer_provider.add_span_processor(span_processor)
  end

  def teardown
    Highlight.flush
    Highlight.shutdown
  end

  def test_initialization
    assert_equal(@project_id, @highlight.instance_variable_get(:@project_id))
    assert_equal(Highlight::H::OTLP_HTTP, @highlight.instance_variable_get(:@otlp_endpoint))
    assert(@highlight.initialized?)

    resource = OpenTelemetry.tracer_provider.resource
    resource_attributes = resource.attribute_enumerator.to_h
    assert_equal(Highlight::H::SDK_NAME, resource_attributes['telemetry.distro.name'])
    assert_equal(Highlight::VERSION, resource_attributes['telemetry.distro.version'])
  end

  def test_logger
    logger = Highlight::Logger.new(StringIO.new)

    OpenTelemetry.stub(:handle_error, -> { raise('handle_error was called') }) do
      logger.info('ruby test log info!')
      logger.warn('ruby test log warning!')
      logger.error('ruby test log error!')
      logger.debug { 'ruby test log debug block!' }
      logger.info({ hash: 'ruby test log hash!' })
    end
  end

  def test_record_log
    Highlight::H.instance.record_log(nil, nil, Logger::INFO, 'ruby test record_log info!')
    Highlight.log(Logger::ERROR, 'ruby test record_log error!')
    Highlight::H.instance.record_log(
      'session123',
      'request456',
      Logger::WARN,
      'ruby test record_log with session and request!'
    )
  end

  def test_trace
    @highlight.trace('session123', 'request456', { 'some.attribute': 12 }, name: 'test_span') do
      logger = Highlight::Logger.new(StringIO.new)
      logger.info('ruby test trace!')
    end

    spans = @memory_exporter.finished_spans
    assert_equal(2, spans.length)

    trace_span = spans.last
    assert_equal('test_span', trace_span.name)

    expected_attributes = {
      'some.attribute' => 12,
      'highlight.session_id' => 'session123',
      'highlight.trace_id' => 'request456'
    }
    assert_equal(expected_attributes, trace_span.attributes)

    trace_resource_attributes = trace_span.resource.attribute_enumerator.to_h
    assert_equal(Highlight::H::SDK_NAME, trace_resource_attributes['telemetry.distro.name'])
    assert_equal(Highlight::VERSION, trace_resource_attributes['telemetry.distro.version'])
    assert_equal(@service_name, trace_resource_attributes['service.name'])
    assert_equal(@service_version, trace_resource_attributes['service.version'])
    assert_equal(@environment, trace_resource_attributes['deployment.environment'])
  end

  def test_start_span
    Highlight.start_span('test_span', { attr1: 'value1' }) do |span|
      span.set_attribute('attr2', 'value2')
      Highlight.log(Logger::INFO, 'ruby test start_span!')
    end

    spans = @memory_exporter.finished_spans
    assert_equal(2, spans.length)

    log_span = spans.first
    log_span_events = log_span.events
    assert_equal('highlight.log', log_span.name)
    assert_equal(1, log_span_events.length)
    assert_equal('log', log_span_events.first.name)
    assert_equal('ruby test start_span!', log_span_events.first.attributes['log.message'])

    test_span = spans.last
    assert_equal('test_span', test_span.name)
    assert_equal({ 'attr1' => 'value1', 'attr2' => 'value2' }, test_span.attributes)
  end

  def test_exception_handling
    raise(StandardError, 'Test error')
  rescue StandardError => e
    @highlight.record_exception(e, { custom_attr: 'test' })
  end

  def test_trace_processor
    @highlight.trace('session123', 'request456', { 'some.attribute' => 12 }) do
      baggage = OpenTelemetry::Baggage.values(context: OpenTelemetry::Context.current)
      assert_equal(baggage['highlight.session_id'], 'session123')
      assert_equal(baggage['highlight.trace_id'], 'request456')
      puts('a test trace!')
    end
  end

  def test_highlight_traceparent_meta
    traceparent_content = Highlight.traceparent_meta

    assert_match(/00-[a-f0-9]{32}-[a-f0-9]{16}-01/, traceparent_content)
  end

  def test_highlight_traceparent_meta_tag
    meta_tag = Highlight.traceparent_meta_tag

    assert_match(/<meta name="traceparent" content="00-[a-f0-9]{32}-[a-f0-9]{16}-01">/, meta_tag)
  end

  def test_with_highlight_context_when_not_initialized
    Highlight::H.instance_variable_set(:@instance, nil)

    controller = OpenStruct.new(request: OpenStruct.new(method: 'GET', path: '/test', headers: {}), cookies: {})
    controller.extend(Highlight::Integrations::Rails)

    error = nil
    begin
      controller.with_highlight_context do
        'Test action'
      end
    rescue StandardError => e
      error = e
    end
    assert_equal(nil, error)

    result = controller.with_highlight_context { 'Test result' }
    assert_equal('Test result', result)
  end

  def test_parse_headers
    headers = {}
    headers[Highlight::H::HIGHLIGHT_REQUEST_HEADER] = 'session123/request456'
    headers['traceparent'] = '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'

    highlight_headers = Highlight::H.parse_headers(headers)

    assert_equal('session123', highlight_headers.session_id)
    assert_equal('0af7651916cd43dd8448eb211c80319c', highlight_headers.request_id)
  end

  def test_log_level_string
    assert_equal('INFO', Highlight::H.log_level_string(Logger::INFO))
    assert_equal('ERROR', Highlight::H.log_level_string(Logger::ERROR))
    assert_equal('WARN', Highlight::H.log_level_string(Logger::WARN))
    assert_equal('DEBUG', Highlight::H.log_level_string(Logger::DEBUG))
    assert_equal('FATAL', Highlight::H.log_level_string(Logger::FATAL))
    assert_equal('UNKNOWN', Highlight::H.log_level_string(Logger::UNKNOWN))
    assert_equal('UNKNOWN', Highlight::H.log_level_string(999)) # Invalid level
  end
end
