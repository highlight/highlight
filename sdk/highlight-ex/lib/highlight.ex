defmodule Highlight do
  @moduledoc """
  Highlight Elixir SDK.

  Provides OpenTelemetry-based error tracking, logging, and HTTP request tracing
  for Elixir/Phoenix applications integrated with highlight.io.

  ## Quick Start

  Add to your `mix.exs`:

  ```elixir
  defp deps do
    [
      {:highlight, "~> 0.1"},
      {:opentelemetry_exporter, "~> 1.6"},
    ]
  end
  ```

  Initialize in your application `start/2`:

  ```elixir
  def start(_type, _args) do
    Highlight.init(%Highlight.Config{
      project_id: "your_project_id",
      service_name: "my_app"
    })

    children = [...]
    Supervisor.start_link(children, strategy: :one_for_one)
  end
  ```

  ## Phoenix / Plug Integration

  Add `Highlight.Plug` to your endpoint or router:

  ```elixir
  defmodule MyAppWeb.Endpoint do
    use Phoenix.Endpoint, otp_app: :my_app

    plug Highlight.Plug

    # ... rest of plugs
  end
  ```

  ## Logger Backend

  Add `Highlight.Logger` as a Logger backend in your config:

  ```elixir
  config :logger,
    backends: [:console, Highlight.Logger]
  ```
  """

  require OpenTelemetry.Tracer, as: Tracer
  require Logger

  @default_otlp_endpoint "https://otel.highlight.io:4318"

  defmodule Config do
    @moduledoc """
    Configuration struct for the Highlight SDK.

    ## Fields

      - `:project_id` - (required) Your Highlight project ID.
      - `:service_name` - The name of your service. Defaults to `"highlight-elixir"`.
      - `:service_version` - The version of your service. Optional.
      - `:otlp_endpoint` - The OTLP HTTP endpoint to export to.
        Defaults to `"https://otel.highlight.io:4318"`.
    """
    @enforce_keys [:project_id]
    defstruct [
      :project_id,
      :service_name,
      :service_version,
      otlp_endpoint: "https://otel.highlight.io:4318"
    ]

    @type t :: %__MODULE__{
            project_id: String.t(),
            service_name: String.t() | nil,
            service_version: String.t() | nil,
            otlp_endpoint: String.t()
          }
  end

  @doc """
  Initialize the Highlight SDK with the given `%Highlight.Config{}`.

  This configures the OpenTelemetry pipeline to export traces and logs to the
  Highlight OTLP endpoint. Call this once during application startup.

  ## Examples

      Highlight.init(%Highlight.Config{
        project_id: "abc123",
        service_name: "my_phoenix_app"
      })

  """
  @spec init(Config.t()) :: :ok | {:error, term()}
  def init(%Config{} = config) do
    endpoint = config.otlp_endpoint || @default_otlp_endpoint

    # Persist config in application env so other modules can access it
    Application.put_env(:highlight, :config, config)

    # Configure the OTLP exporter endpoint at runtime
    Application.put_env(:opentelemetry_exporter, :otlp_protocol, :http_protobuf)
    Application.put_env(:opentelemetry_exporter, :otlp_endpoint, endpoint)

    # Set OTel resource attributes from config
    resource_attrs = build_resource_attributes(config)
    Application.put_env(:opentelemetry, :resource, %{attributes: resource_attrs})

    :ok
  end

  @doc """
  Returns the current SDK config, if initialized.
  """
  @spec config() :: Config.t() | nil
  def config do
    Application.get_env(:highlight, :config)
  end

  @doc """
  Records an exception in the current or a new span, attaching Highlight-specific
  session and trace attributes.

  ## Parameters

    - `exception` - The exception or error term to record.
    - `opts` - Keyword options:
      - `:session_id` - The Highlight session ID string (optional).
      - `:request_id` - The Highlight request/trace ID string (optional).
      - `:config` - A `%Highlight.Config{}` to use. Falls back to the global config.

  ## Examples

      try do
        risky_operation()
      rescue
        e ->
          Highlight.record_exception(e, session_id: "sess_abc", request_id: "req_xyz")
      end

  """
  @spec record_exception(term(), keyword()) :: :ok
  def record_exception(exception, opts \\ []) do
    session_id = Keyword.get(opts, :session_id)
    request_id = Keyword.get(opts, :request_id)
    cfg = Keyword.get(opts, :config) || config()

    span_attrs =
      if cfg do
        base_attributes(cfg)
      else
        []
      end

    Tracer.with_span "highlight-ctx", %{attributes: span_attrs} do
      if session_id do
        Tracer.set_attributes([{:"highlight.session_id", session_id}])
      end

      if request_id do
        Tracer.set_attributes([{:"highlight.trace_id", request_id}])
      end

      Tracer.record_exception(exception, [])
    end

    :ok
  end

  @doc false
  @spec base_attributes(Config.t()) :: list()
  def base_attributes(%Config{} = config) do
    base = [
      {:"highlight.project_id", config.project_id},
      {:"telemetry.sdk.language", "erlang"},
      {:"telemetry.sdk.name", "opentelemetry"},
      {:"telemetry.sdk.version", "1.4.0"}
    ]

    base
    |> maybe_append(:"service.name", config.service_name)
    |> maybe_append(:"service.version", config.service_version)
  end

  # ---------------------------------------------------------------------------
  # Private helpers
  # ---------------------------------------------------------------------------

  defp build_resource_attributes(%Config{} = config) do
    base = %{
      "highlight.project_id" => config.project_id,
      "telemetry.sdk.language" => "erlang",
      "telemetry.sdk.name" => "opentelemetry"
    }

    base
    |> maybe_put("service.name", config.service_name)
    |> maybe_put("service.version", config.service_version)
  end

  defp maybe_put(map, _key, nil), do: map
  defp maybe_put(map, key, value), do: Map.put(map, key, value)

  defp maybe_append(list, _key, nil), do: list
  defp maybe_append(list, key, value), do: list ++ [{key, value}]
end
