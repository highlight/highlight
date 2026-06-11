import Config

# Configure OpenTelemetry to use the batch processor and OTLP HTTP exporter.
# Highlight.init/1 will override the endpoint at runtime with the value from
# your %Highlight.Config{} struct (defaulting to https://otel.highlight.io:4318).
config :opentelemetry,
  span_processor: :batch,
  traces_exporter: :otlp,
  resource_detectors: [:otel_resource_env_var, :otel_resource_app_env]

config :opentelemetry_exporter,
  otlp_protocol: :http_protobuf,
  otlp_endpoint: "https://otel.highlight.io:4318"

if config_env() == :test do
  # In test mode use a no-op/simple processor so spans are captured locally
  config :opentelemetry,
    traces_exporter: :none
end
