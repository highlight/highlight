defmodule Highlight.Tracer do
  @moduledoc false

  require Logger

  @tracer_name "highlight-elixir"
  @error_span_name "highlight.error"
  @log_span_name "highlight.log"

  @doc """
  Records an exception on the current OpenTelemetry span.
  """
  @spec record_exception(Exception.t(), map()) :: :ok
  def record_exception(exception, attributes \\ %{}) do
    span_ctx = OpenTelemetry.Tracer.current_span_ctx()

    if span_ctx != :undefined do
      exception_type = exception.__struct__ |> Module.split() |> List.last()
      message = Exception.message(exception)
      stacktrace = Exception.format_stacktrace(__STACKTRACE__)

      event_attrs = %{
        "exception.type" => exception_type,
        "exception.message" => message,
        "exception.stacktrace" => stacktrace
      }

      merged_attrs = Map.merge(event_attrs, map_attributes(attributes))

      OpenTelemetry.Span.add_event(
        span_ctx,
        "exception",
        merged_attrs
      )

      OpenTelemetry.Span.set_status(span_ctx, OpenTelemetry.status(:error, message))
    end

    :ok
  end

  @doc """
  Records an exception by creating a new error span.
  Used when there is no active span context.
  """
  @spec record_exception_in_new_span(Exception.t(), map()) :: :ok
  def record_exception_in_new_span(exception, attributes \\ %{}) do
    attributes = Map.put(attributes, "highlight.source", "backend")

    OpenTelemetry.Tracer.with_span @error_span_name,
      attributes: map_attributes(attributes),
      kind: :client do
      exception_type = exception.__struct__ |> Module.split() |> List.last()
      message = Exception.message(exception)

      OpenTelemetry.Span.set_status(OpenTelemetry.status(:error, message))

      OpenTelemetry.Span.add_event("exception", %{
        "exception.type" => exception_type,
        "exception.message" => message
      })
    end

    :ok
  end

  @doc """
  Records a log message as an OpenTelemetry span event.
  """
  @spec record_log(atom(), String.t(), map()) :: :ok
  def record_log(level, message, attributes \\ %{}) do
    span_ctx = OpenTelemetry.Tracer.current_span_ctx()

    config = Highlight.ConfigStore.get()

    log_attrs =
      %{
        "log.severity" => format_log_level(level),
        "log.message" => message
      }
      |> maybe_put_project_id(config)
      |> Map.merge(map_attributes(attributes))

    if span_ctx != :undefined and is_span_recording?(span_ctx) do
      OpenTelemetry.Span.add_event(span_ctx, "log", log_attrs)
    else
      OpenTelemetry.Tracer.with_span @log_span_name,
        attributes: log_attrs,
        kind: :internal do
        :ok
      end
    end

    :ok
  end

  defp is_span_recording?(span_ctx) do
    case OpenTelemetry.Span.kind(span_ctx) do
      kind when is_atom(kind) -> true
      _ -> false
    end
  rescue
    _ -> true
  end

  defp map_attributes(map) when is_map(map) do
    Enum.into(map, %{}, fn {k, v} ->
      key = if is_atom(k), do: Atom.to_string(k), else: to_string(k)
      {key, v}
    end)
  end

  defp map_attributes(_), do: %{}

  defp maybe_put_project_id(attrs, nil), do: attrs
  defp maybe_put_project_id(attrs, config), do: Map.put(attrs, "highlight.project_id", config.project_id)

  defp format_log_level(:debug), do: "DEBUG"
  defp format_log_level(:info), do: "INFO"
  defp format_log_level(:warning), do: "WARNING"
  defp format_log_level(:error), do: "ERROR"
  defp format_log_level(:critical), do: "CRITICAL"
  defp format_log_level(level) when is_atom(level), do: level |> Atom.to_string() |> String.upcase()
  defp format_log_level(_), do: "UNKNOWN"
end
