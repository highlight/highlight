defmodule Highlight.SpanProcessor do
  @moduledoc false

  require Logger

  @doc """
  Sets up the OpenTelemetry SDK with Highlight's configuration.

  Configures the tracer provider, span processors, and resource attributes
  to send telemetry data to the Highlight backend.
  """
  @spec setup(Highlight.Config.t()) :: :ok
  def setup(config) do
    resource = build_resource(config)

    exporter =
      OpenTelemetry.Exporter.OTLP.new(
        endpoint: "#{config.otlp_endpoint}/v1/traces",
        compression: :gzip
      )

    batch_processor =
      {OpenTelemetry.BatchSpanProcessor,
       exporter: exporter,
       schedule_delay: :timer.seconds(5),
       max_queue_size: 1024 * 1024,
       max_export_batch_size: 128 * 1024}

    highlight_processor = {Highlight.SpanProcessor.HighlightProcessor, []}

    :application.ensure_all_started(:opentelemetry)

    :opentelemetry.set_tracer_provider(%{
      id: :highlight_tracer_provider,
      resource: resource,
      span_processors: [highlight_processor, batch_processor],
      sampler: {OpenTelemetry.Sampler.parent_based, %{root: OpenTelemetry.Sampler.trace_id_ratio_based(1.0)}},
      telemetry_distro: %{name: "highlight-elixir", version: Highlight.MixProject.project()[:version]}
    })

    :ok
  rescue
    e ->
      Logger.warning("Failed to setup OpenTelemetry for Highlight: #{inspect(e)}")
      :ok
  end

  @doc """
  Flushes all span processors.
  """
  @spec flush() :: :ok
  def flush do
    try do
      :opentelemetry.force_flush()
    rescue
      _ -> :ok
    end
  end

  @doc """
  Shuts down the OpenTelemetry provider.
  """
  @spec shutdown() :: :ok
  def shutdown do
    try do
      :opentelemetry.shutdown()
    rescue
      _ -> :ok
    end
  end

  defp build_resource(config) do
    base_attrs = %{
      "highlight.project_id" => config.project_id,
      "telemetry.distro.name" => "highlight-elixir",
      "telemetry.distro.version" => Highlight.MixProject.project()[:version] || "0.1.0"
    }

    attrs =
      base_attrs
      |> maybe_put("service.name", config.service_name)
      |> maybe_put("service.version", config.service_version)
      |> maybe_put("deployment.environment", config.environment)

    OpenTelemetry.Resource.create(attrs)
  end

  defp maybe_put(map, _key, nil), do: map
  defp maybe_put(map, _key, ""), do: map
  defp maybe_put(map, key, value), do: Map.put(map, key, value)
end
