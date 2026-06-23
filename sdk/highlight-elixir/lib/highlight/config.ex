defmodule Highlight.Config do
  @moduledoc false

  @enforce_keys [:project_id]
  defstruct [
    :project_id,
    :otlp_endpoint,
    :service_name,
    :service_version,
    :environment,
    instrument_logging: true
  ]

  @type t :: %__MODULE__{
          project_id: String.t(),
          otlp_endpoint: String.t(),
          service_name: String.t(),
          service_version: String.t(),
          environment: String.t(),
          instrument_logging: boolean()
        }

  @otlp_default_endpoint "https://otel.highlight.io:4318"

  @doc """
  Creates a new Config struct with defaults applied.
  """
  def new(opts \\ []) do
    %__MODULE__{
      project_id: Keyword.fetch!(opts, :project_id),
      otlp_endpoint: Keyword.get(opts, :otlp_endpoint, @otlp_default_endpoint),
      service_name: Keyword.get(opts, :service_name, "elixir-app"),
      service_version: Keyword.get(opts, :service_version, ""),
      environment: Keyword.get(opts, :environment, ""),
      instrument_logging: Keyword.get(opts, :instrument_logging, true)
    }
  end
end
