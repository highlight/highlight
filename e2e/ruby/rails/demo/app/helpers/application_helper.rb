module ApplicationHelper
  def traceparent_context
    current_trace = OpenTelemetry::Trace.current_span
    trace_id = current_trace&.context&.trace_id
    span_id = current_trace&.context&.span_id

    return '00-00-00-00' if trace_id.blank?

    hex_trace_id = trace_id&.unpack('H*').first
    hex_span_id = span_id&.unpack('H*').first
    "00-#{hex_trace_id}-#{hex_span_id}-01"
  end
end
