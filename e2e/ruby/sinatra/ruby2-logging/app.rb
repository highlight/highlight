require 'sinatra'
require 'active_support'
require 'highlight'
require 'logger'

# Initialize Highlight - modified for v0.2.0
Highlight::H.new('1jdkoe52', environment: 'development', otlp_endpoint: 'http://localhost:4318') do |c|
  c.service_name = 'highlight-ruby-v2'
  c.service_version = '1.0.0'
end

# Set up Rails-like logger
module Rails
  class << self
    def logger
      @logger ||= Highlight::Logger.new($stdout)
    end
  end
end

# Test event class
class TestEvent
  attr_reader :name, :data

  def initialize(name, data)
    @name = name
    @data = data
  end
end

# Routes
get '/' do
  event = TestEvent.new(
    :supporter_notified_of_shifts_change,
    {
      supporter_id: 6875,
      event_id: 34,
      edited_shifts_ids: [200, 203]
    }
  )

  # Log using Rails.logger style
  Rails.logger.info(published_event: event.name, **event.data)

  # Basic log
  Rails.logger.info("Test log...")

  'Event logged! Check your logs.'
end

# Error route to test error logging
get '/error' do
  Rails.logger.error("Test error logging")
  raise "Test error"
end
