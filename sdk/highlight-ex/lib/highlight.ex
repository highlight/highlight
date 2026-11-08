defmodule Highlight do
  @moduledoc """
  Highlight Elixir SDK (`Highlight`) for OpenTelemetry-native Error Monitoring,
  Elixir `:logger` instrumentation, and Phoenix request/exception telemetry integration.
  """
  require OpenTelemetry.Tracer, as: Tracer
  require Logger

  defmodule Config do
    @enforce_keys [:project_id]
    defstruct [
      :project_id,
      :service_name,
      :service_version
    ]
  end

  @doc """
  Parses the incoming `x-highlight-request` HTTP header (`"session_id/request_id"`)
  and returns `{session_id, request_id}`.
  """
  def parse_highlight_header(header_value) when is_binary(header_value) do
    case String.split(String.trim(header_value), "/", parts: 2) do
      [session_id, request_id] when session_id != "" and request_id != "" ->
        {session_id, request_id}

      _ ->
        {nil, nil}
    end
  end

  def parse_highlight_header(_), do: {nil, nil}

  @doc """
  Initialize the Highlight SDK with an optional `%Highlight.Config{}`.
  Attaches both Erlang `:logger` handler (`Highlight.LoggerHandler`) and
  Phoenix error/request telemetry handlers (`[:phoenix, :router_dispatch, :exception]`
  and `[:phoenix, :error_rendered]`).
  """
  def init(config \\ nil) do
    :telemetry.attach(
      "highlight-logger",
      [:logger, :message],
      &Highlight.handle_logger_event/4,
      config
    )

    :logger.remove_handler(:highlight_logger_handler)
    :logger.add_handler(:highlight_logger_handler, Highlight.LoggerHandler, %{config: config})

    attach_phoenix_telemetry(config)
    :ok
  end

  @doc """
  Attaches telemetry handlers for Phoenix router exceptions and rendered errors.
  """
  def attach_phoenix_telemetry(config \\ nil) do
    :telemetry.detach("highlight-phoenix-exception")
    :telemetry.detach("highlight-phoenix-error-rendered")

    :telemetry.attach(
      "highlight-phoenix-exception",
      [:phoenix, :router_dispatch, :exception],
      &Highlight.handle_phoenix_exception/4,
      config
    )

    :telemetry.attach(
      "highlight-phoenix-error-rendered",
      [:phoenix, :error_rendered],
      &Highlight.handle_phoenix_error_rendered/4,
      config
    )
  end

  def handle_logger_event(_event_name, measurements, metadata, config) do
    message = metadata[:message] || "No message"
    level = to_string(metadata[:level] || :info)
    attrs =
      (if config, do: base_attributes(config), else: []) ++
        [
          {:"log.severity", level},
          {:"log.message", to_string(message)}
        ]

    Tracer.with_span "highlight.log", %{attributes: attrs} do
      Tracer.add_event(to_string(message), measurements)
    end
  end

  def handle_phoenix_exception(_event_name, _measurements, metadata, config) do
    reason = metadata[:reason] || %RuntimeError{message: "Phoenix router exception"}
    stacktrace = metadata[:stacktrace] || []
    conn = metadata[:conn]
    {session_id, request_id} = extract_conn_highlight_ids(conn)
    cfg = config || %Config{project_id: Application.get_env(:highlight, :project_id, "default")}
    record_exception(reason, cfg, session_id, request_id, stacktrace)
  end

  def handle_phoenix_error_rendered(_event_name, _measurements, metadata, config) do
    status = metadata[:status]
    if is_integer(status) and status >= 500 do
      reason = metadata[:reason] || %RuntimeError{message: "Phoenix HTTP #{status} error"}
      stacktrace = metadata[:stacktrace] || []
      conn = metadata[:conn]
      {session_id, request_id} = extract_conn_highlight_ids(conn)
      cfg = config || %Config{project_id: Application.get_env(:highlight, :project_id, "default")}
      record_exception(reason, cfg, session_id, request_id, stacktrace)
    end
  end

  defp extract_conn_highlight_ids(%{req_headers: headers}) when is_list(headers) do
    case List.keyfind(headers, "x-highlight-request", 0) do
      {"x-highlight-request", val} -> parse_highlight_header(val)
      _ -> {nil, nil}
    end
  end

  defp extract_conn_highlight_ids(_), do: {nil, nil}

  @doc """
  Records an exception and captures OpenTelemetry span attributes (`highlight.project_id`,
  `highlight.session_id`, `highlight.trace_id`) and optional stacktrace.
  """
  def record_exception(e, config, session_id \\ nil, request_id \\ nil, stacktrace \\ []) do
    Tracer.with_span "highlight-ctx", %{attributes: base_attributes(config)} do
      if session_id do
        Tracer.set_attributes([{:"highlight.session_id", session_id}])
      end

      if request_id do
        Tracer.set_attributes([{:"highlight.trace_id", request_id}])
      end

      Tracer.record_exception(e, stacktrace, [])
      Tracer.set_status(:error, format_exception_message(e))
    end
  end

  defp format_exception_message(%{__exception__: true} = e), do: Exception.message(e)
  defp format_exception_message(e), do: inspect(e)

  def base_attributes(config) do
    [
      {:"highlight.project_id", config.project_id},
      {:"telemetry.sdk.language", "erlang"},
      {:"telemetry.sdk.name", "opentelemetry"},
      {:"telemetry.sdk.version", "1.4.0"}
    ] ++
      if config.service_name do
        [{:"service.name", config.service_name}]
      else
        []
      end ++
      if config.service_version do
        [{:"service.version", config.service_version}]
      else
        []
      end
  end
end

defmodule Highlight.LoggerHandler do
  @moduledoc """
  Erlang `:logger` handler that forwards Elixir `Logger` events into OpenTelemetry
  `highlight.log` spans with source location and severity metadata.
  """
  require OpenTelemetry.Tracer, as: Tracer

  def log(%{level: level, msg: msg, meta: meta}, %{config: config}) do
    formatted = format_msg(msg)
    attrs =
      (if config, do: Highlight.base_attributes(config), else: []) ++
        [
          {:"log.severity", to_string(level)},
          {:"log.message", formatted},
          {:"code.filepath", to_string(meta[:file] || "")},
          {:"code.lineno", meta[:line] || 0}
        ]

    Tracer.with_span "highlight.log", %{attributes: attrs} do
      Tracer.add_event(formatted, [{:"log.severity", to_string(level)}])
    end

    :ok
  rescue
    _ -> :ok
  end

  defp format_msg({:string, chardata}), do: IO.chardata_to_binary(chardata)
  defp format_msg({:report, report}), do: inspect(report)
  defp format_msg({fmt, args}), do: :io_lib.format(fmt, args) |> IO.chardata_to_binary()
  defp format_msg(other), do: inspect(other)
end
