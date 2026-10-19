defmodule Highlight.LiveView do
  @moduledoc """
  Phoenix LiveView instrumentation for Highlight.

  Automatically attaches to Phoenix LiveView telemetry events to report unhandled
  exceptions and error lifecycles to Highlight via OpenTelemetry:
  - `[:phoenix, :live_view, :mount, :exception]`
  - `[:phoenix, :live_view, :handle_params, :exception]`
  - `[:phoenix, :live_view, :handle_event, :exception]`
  """

  require OpenTelemetry.Tracer, as: Tracer

  @events [
    [:phoenix, :live_view, :mount, :exception],
    [:phoenix, :live_view, :handle_params, :exception],
    [:phoenix, :live_view, :handle_event, :exception]
  ]

  @doc """
  Attaches telemetry handlers to Phoenix LiveView lifecycle exception events.
  """
  def attach(config \\ nil) do
    for event <- @events do
      handler_id = "highlight-#{Enum.join(event, "-")}"

      # Detach existing if re-attaching
      :telemetry.detach(handler_id)

      :telemetry.attach(
        handler_id,
        event,
        &__MODULE__.handle_event/4,
        config
      )
    end

    :ok
  end

  @doc """
  Detaches all Highlight LiveView telemetry handlers.
  """
  def detach() do
    for event <- @events do
      handler_id = "highlight-#{Enum.join(event, "-")}"
      :telemetry.detach(handler_id)
    end

    :ok
  end

  @doc false
  def handle_event(event_name, measurements, metadata, config) do
    socket = metadata[:socket]
    view_module = if is_map(socket), do: Map.get(socket, :view), else: nil
    socket_id = if is_map(socket), do: Map.get(socket, :id), else: nil

    session_id =
      cond do
        is_map(socket) and is_map(Map.get(socket, :assigns)) and
            Map.has_key?(socket.assigns, :highlight_session_id) ->
          socket.assigns.highlight_session_id

        socket_id ->
          socket_id

        true ->
          nil
      end

    reason = metadata[:reason] || "LiveView exception"
    event_type = metadata[:event] || List.last(event_name) |> to_string()

    span_attrs =
      (if config, do: Highlight.base_attributes(config), else: []) ++
        [
          {:"highlight.source", "live_view"},
          {:"live_view.event", to_string(event_type)}
        ] ++
        (if view_module, do: [{:"live_view.module", inspect(view_module)}], else: []) ++
        (if session_id, do: [{:"highlight.session_id", to_string(session_id)}], else: [])

    Tracer.with_span "highlight.live_view.exception", span_attrs do
      if is_map(measurements) and Map.has_key?(measurements, :duration) do
        Tracer.set_attributes([
          {:duration_ms, System.convert_time_unit(measurements.duration, :native, :millisecond)}
        ])
      end

      stacktrace = metadata[:stacktrace] || []
      Tracer.record_exception(reason, stacktrace)
    end
  end
end
