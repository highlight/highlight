defmodule Highlight.Phoenix.Plug do
  @moduledoc """
  A Plug for Phoenix that sets up Highlight tracing context.

  This plug extracts the Highlight session and request IDs from the request
  headers and stores them in the connection for use during the request lifecycle.

  ## Usage

      plug Highlight.Phoenix.Plug
  """

  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    headers = conn.req_headers |> Enum.into(%{})
    highlight_ctx = Highlight.Phoenix.parse_headers(headers)

    conn
    |> Plug.Conn.put_private(:highlight_ctx, highlight_ctx)
  end
end
