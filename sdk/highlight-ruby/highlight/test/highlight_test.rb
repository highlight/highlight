require_relative './test_helper'

class HighlightTest < Minitest::Test
  def test_logger
    Highlight::H.new('qe9y4yg1') do |c|
      c.service_name = 'my-app'
      c.service_version = '1.0.0'
    end
    logger = Highlight::Logger.new($stdout)
    logger.add(Logger::INFO, 'ruby test log add!')
    logger.info('ruby test log info!')
    logger.info { 'ruby test log block!' }
    Highlight::H.instance.flush
  end

  def test_record_log
    Highlight::H.new('qe9y4yg1')
    Highlight::H.instance.record_log(nil, nil, Logger::INFO, 'ruby test record_log info!')
    Highlight::H.instance.record_log(nil, nil, Logger::ERROR, 'ruby test record_log error!')
    Highlight::H.instance.flush
  end

  def test_trace
    Highlight::H.new('qe9y4yg1')
    Highlight::H.instance.trace(1, nil, { 'some.attribute' => 12 }) do
      logger = Highlight::Logger.new($stdout)
      logger.info('ruby test trace!')
      raise 'ruby test error handler!'
    end
    Highlight::H.instance.flush
    expect_any_instance_of(OpenTelemetryTracer).to have_received(:in_span).with(
      'highlight-ctx',
      hash_including(
        "some.attribute": 12,
        "project_id": nil
      )
    )
  rescue StandardError # rubocop:disable Lint/SuppressedException
  end
end
