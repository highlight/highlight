import Config

config :opentelemetry,
  span_processor: :batch,
  traces_exporter: {:otel_exporter_stdout, []},
  resource_detectors: [:otel_resource_env_var, :otel_resource_app_env]
