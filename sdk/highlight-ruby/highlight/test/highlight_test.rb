require_relative "./test_helper"

class HighlightTest < Minitest::Test
  def test_logger

    Highlight::H.new("qe9y4yg1")
    logger = Highlight::Logger.new(STDOUT)
    logger.add(Logger::INFO, 'ruby test log add!')
    logger.info('ruby test log info!')
    logger.info { 'ruby test log block!' }
    Highlight::H.instance.flush
  end

  def test_record_log
    Highlight::H.new("qe9y4yg1")
    Highlight::H.instance.record_log(nil, nil, Logger::INFO, 'ruby test record_log info!')
    Highlight::H.instance.record_log(nil, nil, Logger::ERROR, 'ruby test record_log error!')
    Highlight::H.instance.flush
  end

  def test_trace
    begin
      Highlight::H.new("qe9y4yg1")
      Highlight::H.instance.trace(nil, nil) do
          raise RuntimeError.new('ruby test error handler!')
      end
      Highlight::H.instance.flush
    rescue
    end
  end
end
