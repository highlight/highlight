defmodule Highlight.Exception do
  require OpenTelemetry.Tracer, as: Tracer

  def record_exception(exception, stacktrace) do
    Tracer.with_span "highlight.error" do
      span = Tracer.current_span()
      
      attrs = %{
        "exception.type" => inspect(exception.__struct__),
        "exception.message" => Exception.message(exception),
        "exception.stacktrace" => Exception.format_stacktrace(stacktrace) |> to_string()
      }
      
      :otel_span.add_event(span, "exception", attrs)
    end
  end
end
