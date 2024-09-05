defmodule Highlight do
  @moduledoc """
  Documentation for Highlight.

  ## Install SDK

    In your `mix.exs` file:

    ```elixir
    defp deps do
      [
        ...
        {:highlight, "~> 0.1"}
      ]
    end
    ```
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
  Initialize the Highlight SDK with the given configuration.
  This sets up Elixir for automatic log collection.

  ## Examples

    iex> Highlight.init()
  """
  def init() do
    :telemetry.attach(
      "highlight-logger",
      [:logger, :message],
      &Highlight.handle_logger_event/4,
      nil
    )
  end

  def handle_logger_event(_event_name, measurements, metadata, _config) do
    message = metadata[:message] || "No message"

    Tracer.with_span "highlight.log" do
      Tracer.add_event(message, measurements)
    end
  end

  @doc """
  Records an exception and captures relevant contextual information.

  This function integrates with OpenTelemetry to report exceptions according to the OpenTelemetry exception reporting specification.
  It allows you to manually record exceptions in your application, attaching additional context like session and request IDs if available.
  This is useful for tracking errors across distributed systems and associating them with specific user sessions or requests.

  ## Parameters

    - `e`: The exception to be recorded. This can be an exception struct, an error tuple, or any Elixir term that represents an error.
    - `config`: A `%Highlight.Config{}` struct containing the configuration for the Highlight SDK. This includes the project ID, and optionally, the service name and service version.
    - `session_id` (optional): A string representing the session ID associated with this exception, which can be used to trace the error back to a specific user session. Defaults to `nil`.
    - `request_id` (optional): A string representing the request ID associated with this exception, which can be used to trace the error back to a specific HTTP request. Defaults to `nil`.

  ## Examples

    ```elixir
    try do
      # some code that may raise an error
    rescue
      exception ->
        Highlight.record_exception(exception, %Highlight.Config{
          project_id: "your_project_id",
          service_name: "your_service_name",
          service_version: "1.0.0"
        }, "session_12345", "request_67890")
    end
    ```
  """
  def record_exception(e, config, session_id \\ nil, request_id \\ nil) do
    Tracer.with_span "highlight-ctx", base_attributes(config) do
      if session_id do
        Tracer.set_attributes([{:"highlight.session_id", session_id}])
      end

      if request_id do
        Tracer.set_attributes([{:"highlight.trace_id", request_id}])
      end

      Tracer.record_exception(e, [])
    end
  end

  defp base_attributes(config) do
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
