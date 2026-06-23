defmodule Highlight do
  @moduledoc """
  Elixir SDK for [Highlight.io](https://highlight.io) error monitoring and logging.

  This SDK provides integration with Highlight for:
  - Error monitoring via `record_exception/1`
  - Logging support via `log/2` and `log/3`
  - Phoenix framework integration

  ## Configuration

      config :highlight,
        project_id: "YOUR_PROJECT_ID",
        otlp_endpoint: "https://otel.highlight.io:4318"

  ## Usage

      # In your application startup (e.g., application.ex)
      Highlight.init(project_id: "YOUR_PROJECT_ID")

      # Record an exception
      try do
        risky_operation()
      rescue
        e -> Highlight.record_exception(e)
      end

      # Log a message
      Highlight.log(:info, "Application started")
  """

  alias Highlight.Config
  alias Highlight.Tracer

  require Logger

  @otlp_endpoint "https://otel.highlight.io:4318"

  @doc """
  Initializes the Highlight SDK.

  ## Options

    * `:project_id` - Your Highlight project ID (required)
    * `:otlp_endpoint` - Custom OTLP endpoint (defaults to `https://otel.highlight.io:4318`)
    * `:service_name` - Service name for tracing (defaults to application name)
    * `:service_version` - Service version (optional)
    * `:environment` - Deployment environment (optional)
    * `:instrument_logging` - Whether to auto-instrument Logger (defaults to `true`)

  ## Examples

      Highlight.init(project_id: "abc123")

      Highlight.init(
        project_id: "abc123",
        service_name: "my_app",
        environment: "production",
        instrument_logging: true
      )
  """
  def init(opts \\ []) do
    project_id = opts[:project_id] || System.get_env("HIGHLIGHT_PROJECT_ID")

    unless project_id do
      raise ArgumentError, """
      Highlight project_id is required.
      Pass it via opts: Highlight.init(project_id: "YOUR_PROJECT_ID")
      Or set the HIGHLIGHT_PROJECT_ID environment variable.
      """
    end

    config = %Config{
      project_id: project_id,
      otlp_endpoint: opts[:otlp_endpoint] || @otlp_endpoint,
      service_name: opts[:service_name] || default_service_name(),
      service_version: opts[:service_version] || "",
      environment: opts[:environment] || System.get_env("HIGHLIGHT_ENVIRONMENT") || "",
      instrument_logging: Keyword.get(opts, :instrument_logging, true)
    }

    Highlight.ConfigStore.put(config)
    Highlight.SpanProcessor.setup(config)

    if config.instrument_logging do
      Highlight.LoggerHandler.attach()
    end

    Logger.info("Highlight SDK initialized for project #{config.project_id}")
    :ok
  end

  @doc """
  Records an exception with Highlight.

  This function captures an exception and associates it with the current
  OpenTelemetry span, following the OTEL exception reporting spec.

  ## Options

    * `:attributes` - Additional key-value attributes to attach to the error

  ## Examples

      Highlight.record_exception(%RuntimeError{message: "something went wrong"})

      Highlight.record_exception(exception,
        attributes: %{"user.id" => "123", "component" => "auth"}
      )
  """
  @spec record_exception(Exception.t(), keyword()) :: :ok
  def record_exception(exception, opts \\ []) do
    attributes = Keyword.get(opts, :attributes, %{})

    case OpenTelemetry.Tracer.current_span_ctx() do
      ctx when ctx != :undefined ->
        Tracer.record_exception(exception, attributes)
        :ok

      _ ->
        Tracer.record_exception_in_new_span(exception, attributes)
        :ok
    end
  end

  @doc """
  Logs a message to Highlight with the given severity level.

  ## Parameters

    * `level` - Log severity (`:debug`, `:info`, `:warning`, `:error`, `:critical`)
    * `message` - The log message string

  ## Examples

      Highlight.log(:info, "User signed in")
      Highlight.log(:error, "Database connection failed")
  """
  @spec log(atom(), String.t()) :: :ok
  def log(level, message) do
    log(level, message, %{})
  end

  @doc """
  Logs a message to Highlight with attributes.

  ## Examples

      Highlight.log(:info, "Order placed", %{"order.id" => "456", "amount" => "99.99"})
  """
  @spec log(atom(), String.t(), map()) :: :ok
  def log(level, message, attributes) do
    Tracer.record_log(level, message, attributes)
    :ok
  end

  @doc """
  Flushes any buffered telemetry data to the Highlight backend.
  """
  @spec flush() :: :ok
  def flush do
    Highlight.SpanProcessor.flush()
    :ok
  end

  @doc """
  Gracefully shuts down the Highlight SDK, flushing any remaining data.
  """
  @spec shutdown() :: :ok
  def shutdown do
    Highlight.SpanProcessor.shutdown()
    Highlight.LoggerHandler.detach()
    Highlight.ConfigStore.clear()
    :ok
  end

  defp default_service_name do
    Application.get_env(:highlight, :service_name) ||
      Application.get_env(:app, :name, "elixir-app") |> to_string()
  end
end
