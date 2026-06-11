defmodule Highlight.Plug do
  @moduledoc """
  A Plug middleware that automatically traces every HTTP request and forwards
  span data to Highlight via OpenTelemetry.

  ## Features

  - Creates a root span for every incoming HTTP request following OTel semantic
    conventions (`http.method`, `http.url`, `http.route`, `http.status_code`,
    `net.peer.ip`).
  - Extracts `x-highlight-session-id` and `x-highlight-request-id` headers and
    attaches them as `highlight.session_id` / `highlight.trace_id` attributes.
  - Propagates the incoming W3C `traceparent` / `tracestate` headers so that
    client-side and server-side traces are linked.
  - Records exceptions raised during request handling.

  ## Usage

  Add the plug to your endpoint (before the router) or directly in your router:

  ```elixir
  # lib/my_app_web/endpoint.ex
  defmodule MyAppWeb.Endpoint do
    use Phoenix.Endpoint, otp_app: :my_app

    plug Highlight.Plug

    plug MyAppWeb.Router
  end
  ```

  Or in a plain Plug pipeline:

  ```elixir
  defmodule MyApp.Router do
    use Plug.Router

    plug Highlight.Plug
    plug :match
    plug :dispatch

    get "/" do
      send_resp(conn, 200, "Hello world")
    end
  end
  ```
  """

  @behaviour Plug

  require OpenTelemetry.Tracer, as: Tracer
  require OpenTelemetry.Ctx, as: Ctx

  alias OpenTelemetry.Propagator.TextMapPropagator

  @impl Plug
  def init(opts), do: opts

  @impl Plug
  def call(conn, _opts) do
    # Extract incoming trace context from request headers (W3C TraceContext)
    :otel_propagator_text_map.extract(conn.req_headers)

    method = conn.method
    url = build_url(conn)
    route = conn.request_path

    # Highlight-specific headers injected by the browser SDK
    session_id = get_header(conn, "x-highlight-session-id")
    request_id = get_header(conn, "x-highlight-request-id")

    highlight_config = Application.get_env(:highlight, :config)
    project_id = if highlight_config, do: highlight_config.project_id, else: nil

    attrs =
      [
        {:"http.method", method},
        {:"http.url", url},
        {:"http.route", route},
        {:"http.scheme", to_string(conn.scheme)},
        {:"http.host", conn.host},
        {:"net.host.port", conn.port}
      ]
      |> maybe_add_attr(:"http.client_ip", peer_ip(conn))
      |> maybe_add_attr(:"highlight.project_id", project_id)
      |> maybe_add_attr(:"highlight.session_id", session_id)
      |> maybe_add_attr(:"highlight.trace_id", request_id)

    span_name = "#{method} #{route}"

    Tracer.with_span span_name, %{kind: :server, attributes: attrs} do
      try do
        conn = Plug.Conn.register_before_send(conn, fn conn ->
          Tracer.set_attributes([{:"http.status_code", conn.status}])

          if conn.status >= 500 do
            Tracer.set_status(:error, "HTTP #{conn.status}")
          end

          conn
        end)

        conn
      rescue
        exception ->
          Tracer.record_exception(exception, [])
          Tracer.set_status(:error, Exception.message(exception))
          reraise exception, __STACKTRACE__
      end
    end
  end

  # ---------------------------------------------------------------------------
  # Private helpers
  # ---------------------------------------------------------------------------

  defp build_url(conn) do
    query = if conn.query_string && conn.query_string != "", do: "?#{conn.query_string}", else: ""
    "#{conn.scheme}://#{conn.host}:#{conn.port}#{conn.request_path}#{query}"
  end

  defp get_header(conn, header) do
    case Plug.Conn.get_req_header(conn, header) do
      [value | _] -> value
      [] -> nil
    end
  end

  defp peer_ip(conn) do
    case conn.remote_ip do
      nil -> nil
      ip -> :inet.ntoa(ip) |> to_string()
    end
  end

  defp maybe_add_attr(attrs, _key, nil), do: attrs
  defp maybe_add_attr(attrs, _key, ""), do: attrs
  defp maybe_add_attr(attrs, key, value), do: attrs ++ [{key, value}]
end
