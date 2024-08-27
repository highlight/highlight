# frozen_string_literal: true

require 'highlight'

Highlight.init('1jdkoe52', environment: 'dev', otlp_endpoint: 'http://localhost:4318') do |c|
  c.service_name = 'highlight-ruby-demo-backend'
  c.service_version = '1.0.0'
end

Rails.logger = Highlight::Logger.new($stdout)
