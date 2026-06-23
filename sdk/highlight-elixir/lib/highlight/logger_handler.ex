defmodule Highlight.LoggerHandler do
  @moduledoc false

  require Logger

  @handler_id "highlight-logger-handler"

  @doc """
  Attaches the Highlight logger handler to Elixir's Logger.
  """
  @spec attach() :: :ok | {:error, :already_exists}
  def attach do
    config = %{
      level: :info,
      enabled: true
    }

    case Logger.add_handler(@handler_id, __MODULE__, config) do
      :ok ->
        :ok

      {:error, :already_exists} ->
        :ok
    end
  end

  @doc """
  Detaches the Highlight logger handler.
  """
  @spec detach() :: :ok | {:error, :not_found}
  def detach do
    Logger.remove_handler(@handler_id)
  end

  @doc """
  Logger handler callback. Called for every log message.
  """
  @impl true
  def handle_event(event, _config) do
    if Highlight.ConfigStore.initialized?() do
      log_message = format_log_message(event)
      level = map_level(event.level)

      Highlight.Tracer.record_log(level, log_message, extract_metadata(event))
    end
  end

  def handle_event(_event, _config) do
    :ok
  end

  @doc false
  def handle_config(config) do
    {:ok, config}
  end

  defp format_log_message(%{msg: {format, args}}) do
    try do
      :io_lib.format(format, args) |> IO.iodata_to_binary()
    rescue
      _ ->
        "log event"
    end
  rescue
    _ ->
      "log event"
  end

  defp format_log_message(%{msg: msg}) when is_binary(msg), do: msg
  defp format_log_message(%{msg: msg}), do: inspect(msg)
  defp format_log_message(_), do: "log event"

  defp map_level(:emergency), do: :critical
  defp map_level(:alert), do: :critical
  defp map_level(:critical), do: :critical
  defp map_level(:error), do: :error
  defp map_level(:warning), do: :warning
  defp map_level(:notice), do: :info
  defp map_level(:info), do: :info
  defp map_level(:debug), do: :debug
  defp map_level(_), do: :info

  defp extract_metadata(%{meta: meta}) do
    %{}
    |> maybe_put(:module, meta[:module])
    |> maybe_put(:function, meta[:function])
    |> maybe_put(:file, meta[:file])
    |> maybe_put(:line, meta[:line])
    |> maybe_put(:domain, meta[:domain])
    |> maybe_put(:error_logger, meta[:error_logger])
    |> Map.new(fn {k, v} -> {Atom.to_string(k), v} end)
  end

  defp extract_metadata(_), do: %{}

  defp maybe_put(map, _key, nil), do: map
  defp maybe_put(map, key, value), do: Map.put(map, key, value)
end
