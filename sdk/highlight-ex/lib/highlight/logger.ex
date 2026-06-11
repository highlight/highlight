defmodule Highlight.Logger do
  @moduledoc """
  An Elixir Logger backend that forwards log messages to Highlight via
  OpenTelemetry log records, shipped to the configured OTLP endpoint.

  ## Setup

  Add this backend to your Logger configuration:

  ```elixir
  # config/config.exs
  config :logger,
    backends: [:console, Highlight.Logger]

  config :logger, Highlight.Logger,
    level: :info,
    metadata: [:request_id, :session_id]
  ```

  The backend emits each log message as an OpenTelemetry span event named
  `"highlight.log"` and also records span attributes for the log level,
  message, and any configured metadata keys.
  """

  @behaviour :gen_event

  require OpenTelemetry.Tracer, as: Tracer
  require OpenTelemetry.Ctx, as: Ctx

  # OTel severity number mapping (OTLP log data model)
  @severity_number %{
    debug: 5,
    info: 9,
    notice: 10,
    warning: 13,
    error: 17,
    critical: 21,
    alert: 21,
    emergency: 21
  }

  # ---------------------------------------------------------------------------
  # :gen_event callbacks
  # ---------------------------------------------------------------------------

  @impl true
  def init(__MODULE__) do
    config = Application.get_env(:logger, __MODULE__, [])
    {:ok, configure(config)}
  end

  @impl true
  def init({__MODULE__, opts}) when is_list(opts) do
    config = Keyword.merge(Application.get_env(:logger, __MODULE__, []), opts)
    {:ok, configure(config)}
  end

  @impl true
  def handle_call({:configure, opts}, state) do
    config = Keyword.merge(Application.get_env(:logger, __MODULE__, []), opts)
    {:ok, :ok, configure(config, state)}
  end

  @impl true
  def handle_event({level, _gl, {Logger, msg, ts, meta}}, state) do
    if Logger.compare_levels(level, state.level) != :lt do
      emit_log(level, msg, ts, meta, state)
    end

    {:ok, state}
  end

  def handle_event(:flush, state) do
    {:ok, state}
  end

  @impl true
  def handle_info(_, state) do
    {:ok, state}
  end

  @impl true
  def terminate(_reason, _state) do
    :ok
  end

  @impl true
  def code_change(_old_vsn, state, _extra) do
    {:ok, state}
  end

  # ---------------------------------------------------------------------------
  # Internal helpers
  # ---------------------------------------------------------------------------

  defp configure(opts, base_state \\ %{}) do
    level = Keyword.get(opts, :level, :debug)
    metadata = Keyword.get(opts, :metadata, [])

    Map.merge(base_state, %{level: level, metadata: metadata})
  end

  defp emit_log(level, msg, _ts, meta, state) do
    message = IO.iodata_to_binary(msg)
    severity_num = Map.get(@severity_number, level, 9)

    # Pull highlight.session_id / highlight.trace_id from Logger metadata if present
    session_id = meta[:highlight_session_id] || meta[:session_id]
    trace_id = meta[:highlight_trace_id] || meta[:request_id]

    highlight_config = Application.get_env(:highlight, :config)
    project_id = if highlight_config, do: highlight_config.project_id, else: nil

    attrs =
      [
        {:"log.severity", to_string(level)},
        {:"log.severity_number", severity_num},
        {:"log.message", message}
      ]
      |> maybe_add_attr(:"highlight.project_id", project_id)
      |> maybe_add_attr(:"highlight.session_id", session_id)
      |> maybe_add_attr(:"highlight.trace_id", trace_id)
      |> add_user_metadata(meta, state.metadata)

    Tracer.with_span "highlight.log", %{attributes: attrs} do
      Tracer.add_event(message, [{:"log.severity", to_string(level)}])
    end
  end

  defp maybe_add_attr(attrs, _key, nil), do: attrs
  defp maybe_add_attr(attrs, key, value), do: attrs ++ [{key, value}]

  defp add_user_metadata(attrs, meta, keys) do
    Enum.reduce(keys, attrs, fn key, acc ->
      case Map.get(meta, key) do
        nil -> acc
        val -> acc ++ [{key, inspect(val)}]
      end
    end)
  end
end
