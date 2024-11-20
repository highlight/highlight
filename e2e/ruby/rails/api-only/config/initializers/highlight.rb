# frozen_string_literal: true

require 'highlight'

Highlight.init('1jdkoe52', environment: Rails.env, otlp_endpoint: 'http://localhost:4318') do |c|
  c.service_name = 'highlight-ruby-api-only-'
  c.service_version = '1.0.0'
end

highlight_logger = Highlight::Logger.new(nil)
Rails.logger.broadcast_to(highlight_logger)
