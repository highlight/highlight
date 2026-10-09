defmodule Highlight.Phoenix.Plug do
  @behaviour Plug
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    register_before_send(conn, fn conn ->
      if conn.status >= 500 do
        exception = conn.assigns[:kind] || %RuntimeError{message: "Internal Server Error"}
        stack = conn.assigns[:stack] || []
        Highlight.Exception.record_exception(exception, stack)
      end
      conn
    end)
  end
end
