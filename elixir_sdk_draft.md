# Elixir SDK Implementation for Highlight.io

This outlines the core integration required for Elixir support (Issue #5082).

## High-Level Architecture
We wrap the official OpenTelemetry Erlang libraries (`opentelemetry_api`, `opentelemetry_exporter`) to match Highlight's ingest requirements.

## 1. Init & Config (Highlight.ex)
```elixir
defmodule Highlight do
  @moduledoc """
  Highlight.io SDK for Elixir.
  Initializes OpenTelemetry export to pub.highlight.io.
  """

  def init(project_id, opts \\ []) do
    # Override global OTEL configuration programmatically
    Application.put_env(:opentelemetry, :processors, [
      {:otel_batch_processor, %{
        exporter: {:opentelemetry_exporter, %{
          endpoints: ["https://pub.highlight.io/v1/traces"],
          headers: [{"x-highlight-project", project_id}]
        }}
      }}
    ])
    
    # Start the OTEL application
    Application.ensure_all_started(:opentelemetry)
  end
end
```

## 2. Exception Handling (Highlight.Exception.ex)
Convert Elixir exceptions into OpenTelemetry Spans mapped to Highlight's error format.
```elixir
defmodule Highlight.Exception do
  require OpenTelemetry.Tracer, as: Tracer

  def record_exception(exception, stacktrace) do
    Tracer.with_span "highlight.error" do
      span = Tracer.current_span()
      
      # Following OTel Exception specification
      attributes = %{
        "exception.type" => inspect(exception.__struct__),
        "exception.message" => Exception.message(exception),
        "exception.stacktrace" => format_stacktrace(stacktrace)
      }
      
      :otel_span.add_event(span, "exception", attributes)
    end
  end

  defp format_stacktrace(stacktrace) do
    Exception.format_stacktrace(stacktrace)
  end
end
```

## 3. Logger Backend (Highlight.Logger.ex)
Route `Logger.error` and `Logger.info` to Highlight `/v1/logs` or natively as trace events.
```elixir
defmodule Highlight.Logger do
  @behaviour :gen_event

  def init(_) do
    {:ok, %{}}
  end

  def handle_event({level, gl, {Logger, msg, ts, md}}, state) do
    # Translate Elixir log levels and forward to OTEL
    if level in [:error, :warn, :info] do
      # Telemetry instrumentation here
      emit_otel_log(level, msg, md)
    end
    {:ok, state}
  end
end
```

## 4. Phoenix Plug Integration
```elixir
defmodule Highlight.Phoenix.Plug do
  @behaviour Plug

  def init(opts), do: opts

  def call(conn, _opts) do
    # Register exception handler for Phoenix requests
    Plug.Conn.register_before_send(conn, fn conn ->
      if conn.status >= 500 do
         # Extract error from conn.assigns and record
         Highlight.Exception.record_exception(conn.assigns[:kind], conn.assigns[:stack])
      end
      conn
    end)
  end
end
```
