require_relative './test_helper'

class HighlightTest < Minitest::Test
  def test_logger
    Highlight::H.new('qe9y4yg1', environment: 'ci-test') do |c|
      c.service_name = 'my-app'
      c.service_version = '1.0.0'
    end
    logger = Highlight::Logger.new($stdout)
    logger.add(Logger::INFO, 'ruby test log add!')

    OpenTelemetry.stub(:handle_error, -> { raise 'handle_error was called' }) do
      logger.info('ruby test log info!')
      logger.info { 'ruby test log block!' }
      logger.info({ hash: 'ruby test log hash!' })
      Highlight::H.instance.flush
    end
  end

  def test_record_log
    Highlight::H.new('qe9y4yg1')
    Highlight::H.instance.record_log(nil, nil, Logger::INFO, 'ruby test record_log info!')
    Highlight::H.instance.record_log(nil, nil, Logger::ERROR, 'ruby test record_log error!')
    Highlight::H.instance.flush
  end

  def test_trace
    mock = MiniTest::Mock.new
    mock.expect :in_span, true do |attributes:|
      attributes == { 'highlight.project_id' => 'qe9y4yg1', 'highlight.session_id' => 1, 'some.attribute' => 12 }
    end

    begin
      OpenTelemetry::Trace::Tracer.stub :new, mock do
        Highlight::H.new('qe9y4yg1', environment: 'ci-test')
        Highlight::H.instance.trace(1, nil, { 'some.attribute' => 12 }) do
          logger = Highlight::Logger.new($stdout)
          logger.info('ruby test trace!')
          raise 'ruby test error handler!'
        end
        Highlight::H.instance.flush
      end
    ensure
      assert_mock mock
    end
  end
end
