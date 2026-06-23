defmodule Highlight.SpanProcessor.HighlightProcessor do
  @moduledoc false
  @behaviour OpenTelemetry.SpanProcessor

  @impl true
  def on_start(span, _parent_ctx) do
    config = Highlight.ConfigStore.get()

    if config do
      OpenTelemetry.Span.set_attributes(span, %{
        "highlight.project_id" => config.project_id
      })
    end

    span
  end

  @impl true
  def on_end(span, _timeout \\ 5_000) do
    span
  end

  @impl true
  def shutdown(_timeout \\ 5_000) do
    :ok
  end
end
