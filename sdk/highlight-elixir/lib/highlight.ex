defmodule Highlight do
  @moduledoc """
  Highlight.io SDK for Elixir using OpenTelemetry.
  """

  def init(project_id, opts \\ []) do
    endpoint = Keyword.get(opts, :endpoint, "https://pub.highlight.io/v1/traces")
    
    Application.put_env(:opentelemetry, :processors, [
      {:otel_batch_processor, %{
        exporter: {:opentelemetry_exporter, %{
          endpoints: [endpoint],
          headers: [{"x-highlight-project", project_id}]
        }}
      }}
    ])
    
    Application.ensure_all_started(:opentelemetry)
  end
end
