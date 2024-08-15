defmodule Highlight do
  @moduledoc """
  Documentation for Highlight.
  """
  require OpenTelemetry.Tracer, as: Tracer

  defmodule Config do
    @enforce_keys [:project_id]
    defstruct [
      :project_id,
      :service_name,
      :service_version
    ]
  end

  @doc """
  Record an exception

  ## Examples
    iex> Highlight.record_exception("error", %Highlight.Config{project_id: "Project"}, "Session", "Request")
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
    [{:"highlight.project_id", config.project_id}] ++
      if config.service_name do
        {:"service.name", config.service_name}
      else
        []
      end ++
      if config.service_version do
        {:"service.version", config.service_version}
      else
        []
      end
  end
end
