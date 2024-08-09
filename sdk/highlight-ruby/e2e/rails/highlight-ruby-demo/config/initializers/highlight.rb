require "highlight"

Highlight::H.new("1jdkoe52", environment: "dev", otlp_endpoint: "http://localhost:4318") do |c|
  c.service_name = "highlight-ruby-demo"
  c.service_version = "1.0.0"
end

Rails.logger = Highlight::Logger.new(STDOUT)
