require_relative './test_helper'

class HighlightTest < Minitest::Test
  def setup
    @project_id = 'qe9y4yg1'
    @environment = 'ci-test'
    @service_name = 'my-app'
    @service_version = '1.0.0'
  end

  def test_initialization
    highlight = Highlight::H.new(@project_id, environment: @environment) do |c|
      c.service_name = @service_name
      c.service_version = @service_version
    end

    assert_equal @project_id, highlight.instance_variable_get(:@project_id)
    assert_equal Highlight::H::OTLP_HTTP, highlight.instance_variable_get(:@otlp_endpoint)
    assert highlight.initialized?

    resource = OpenTelemetry.tracer_provider.resource
    resource_attributes = resource.attribute_enumerator.to_h
    assert_equal Highlight::H::SDK_NAME, resource_attributes['telemetry.distro.name']
    assert_equal Highlight::VERSION, resource_attributes['telemetry.distro.version']
  end

  def test_highlight_init
    highlight = Highlight.init(@project_id, environment: @environment) do |c|
      c.service_name = @service_name
      c.service_version = @service_version
    end

    assert_instance_of Highlight::H, highlight
    assert_equal @project_id, highlight.instance_variable_get(:@project_id)
  end

  def test_logger
    Highlight::H.new(@project_id, environment: @environment) do |c|
      c.service_name = @service_name
      c.service_version = @service_version
    end
    logger = Highlight::Logger.new(StringIO.new)

    OpenTelemetry.stub(:handle_error, -> { raise 'handle_error was called' }) do
      logger.info('ruby test log info!')
      logger.warn('ruby test log warning!')
      logger.error('ruby test log error!')
      logger.debug { 'ruby test log debug block!' }
      logger.info({ hash: 'ruby test log hash!' })
      Highlight::H.instance.flush
    end
  end

  def test_record_log
    Highlight::H.new('qe9y4yg1')
    Highlight::H.instance.record_log(nil, nil, Logger::INFO, 'ruby test record_log info!')
    Highlight.log(Logger::ERROR, 'ruby test record_log error!')
    Highlight::H.instance.record_log(
      'session123',
      'request456',
      Logger::WARN,
      'ruby test record_log with session and request!'
    )
    Highlight::H.instance.flush
  end

  def test_trace
    mock = Minitest::Mock.new
    mock.expect :in_span, true do |name, attributes:|
      name == 'test_span' && attributes == { 'some.attribute' => 12 }
    end

    OpenTelemetry::Trace::Tracer.stub :new, mock do
      highlight = Highlight::H.new(@project_id, environment: @environment)
      highlight.trace('session123', 'request456', { 'some.attribute' => 12 }, name: 'test_span') do
        logger = Highlight::Logger.new(StringIO.new)
        logger.info('ruby test trace!')
      end
      highlight.flush
    end

    mock.verify
  end

  def test_start_span
    mock = Minitest::Mock.new
    mock.expect :in_span, true do |name, attributes:|
      name == 'test_span' && attributes == { 'attr1' => 'value1' }
    end

    OpenTelemetry::Trace::Tracer.stub :new, mock do
      Highlight.init(@project_id)
      Highlight.start_span('test_span', { 'attr1' => 'value1' }) do
        Highlight.log(Logger::INFO, 'ruby test start_span!')
      end
      Highlight::H.instance.flush
    end

    mock.verify
  end

  def test_exception_handling
    highlight = Highlight::H.new(@project_id)

    begin
      raise StandardError, 'Test error'
    rescue StandardError => e
      highlight.record_exception(e, { custom_attr: 'test' })
    end

    highlight.flush
  end

  def test_trace_processor
    mock = Minitest::Mock.new
    mock.expect :on_start, true do |span, parent_context|
      span.attributes
      OpenTelemetry::Baggage.values(context: parent_context) == {
        'highlight.session_id' => 'session123',
        'highlight.trace_id' => 'request456'
      }
    end
    mock.expect :on_finish, true do |span|
      span.attributes == { 'some.attribute' => 12 }
    end

    Highlight::Tracing::BaggageSpanProcessor.stub :new, mock do
      highlight = Highlight::H.new(@project_id, environment: @environment)
      highlight.trace('session123', 'request456', { 'some.attribute' => 12 }) do
        puts 'ruby test trace!'
      end
    end

    mock.verify
  end

  def test_highlight_traceparent_meta
    Highlight.init(@project_id)
    meta_tag = Highlight.traceparent_meta

    assert_match(/<meta name="traceparent" content="00-[a-f0-9]{32}-[a-f0-9]{16}-01">/, meta_tag)
  end

  def test_parse_headers
    headers = {
      'X-Highlight-Request' => 'session123/request456',
      'traceparent' => '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'
    }

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
