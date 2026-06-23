defmodule Highlight.Phoenix do
  @moduledoc """
  Phoenix framework integration for Highlight.

  This module provides a Plug and LiveView hooks for automatic error monitoring
  and logging in Phoenix applications.

  ## Usage

  Add the plug to your `router.ex`:

      pipeline :browser do
        plug Highlight.Phoenix.Plug
      end

  Add error handling to your `endpoint.ex` or error handler:

      def handle_errors(conn, %{kind: kind, reason: reason, stack: stack}) do
        Highlight.Phoenix.handle_error(conn, kind, reason, stack)
      end
  """

  @highlight_request_header "x-highlight-request"

  @doc """
  Extracts Highlight session and request IDs from request headers.

  Returns a map with `:session_id` and `:request_id` keys, or `nil`
  if the headers are not present.
  """
  @spec parse_headers(map()) :: %{session_id: String.t(), request_id: String.t()} | nil
  def parse_headers(headers) when is_map(headers) do
    case get_header(headers, @highlight_request_header) do
      nil ->
        nil

      value ->
        case String.split(value, "/", parts: 2) do
          [session_id, request_id] ->
            %{session_id: session_id, request_id: request_id}

          _ ->
            nil
        end
    end
  end

  @doc false
  def parse_headers(_), do: nil

  @doc """
  Handles a Phoenix error by recording it with Highlight.

  This function should be called from your error handler.
  """
  @spec handle_error(Plug.Conn.t(), atom(), Exception.t(), list()) :: Plug.Conn.t()
  def handle_error(conn, _kind, reason, _stack) do
    if Highlight.ConfigStore.initialized?() do
      config = Highlight.ConfigStore.get()
      headers = extract_headers(conn)

      attributes = %{
        "highlight.source" => "backend",
        "http.method" => conn.method,
        "http.url" => "#{conn.scheme}://#{conn.host}#{conn.request_path}"
      }

      attributes =
        case parse_headers(headers) do
          %{session_id: sid, request_id: rid} ->
            attributes
            |> Map.put("highlight.session_id", sid)
            |> Map.put("highlight.trace_id", rid)

          nil ->
            attributes
        end

      attributes =
        attributes
        |> Map.put("http.status_code", conn.status)

      Highlight.record_exception(reason, attributes: attributes)
    end

    conn
  end

  defp extract_headers(conn) do
    conn.req_headers
    |> Enum.into(%{})
  end

  defp get_header(headers, key) do
    key_lower = String.downcase(key)

    Enum.find_value(headers, nil, fn {k, v} ->
      if String.downcase(k) == key_lower, do: v
    end)
  end
end
