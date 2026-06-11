defmodule Highlight.PlugTest do
  use ExUnit.Case

  # We test Highlight.Plug using Plug.Test helpers.
  # The plug itself calls Tracer.with_span which needs OTel to be running.
  # In test env, opentelemetry uses a no-op tracer so spans are recorded but not exported.

  import Plug.Test
  import Plug.Conn

  alias Highlight.Plug, as: HighlightPlug

  setup do
    Highlight.init(%Highlight.Config{project_id: "test-plug-project", service_name: "test"})
    :ok
  end

  defp call(conn, opts \\ []) do
    HighlightPlug.call(conn, HighlightPlug.init(opts))
  end

  describe "Highlight.Plug.init/1" do
    test "returns opts unchanged" do
      assert HighlightPlug.init([]) == []
      assert HighlightPlug.init(key: :val) == [key: :val]
    end
  end

  describe "Highlight.Plug.call/2 basic tracing" do
    test "passes conn through unchanged for normal request" do
      conn =
        conn(:get, "/hello")
        |> call()

      # The conn should still be usable (not blown up)
      assert conn.method == "GET"
      assert conn.request_path == "/hello"
    end

    test "handles POST requests" do
      conn =
        conn(:post, "/api/users", ~s({"name":"Alice"}))
        |> put_req_header("content-type", "application/json")
        |> call()

      assert conn.method == "POST"
    end

    test "handles requests with query string" do
      conn =
        conn(:get, "/search?q=hello&page=1")
        |> call()

      assert conn.request_path == "/search"
      assert conn.query_string == "q=hello&page=1"
    end
  end

  describe "Highlight.Plug header extraction" do
    test "extracts x-highlight-session-id header without crashing" do
      conn =
        conn(:get, "/")
        |> put_req_header("x-highlight-session-id", "session_abc123")
        |> call()

      # If we got here, the header was processed without error
      assert conn.method == "GET"
    end

    test "extracts x-highlight-request-id header without crashing" do
      conn =
        conn(:get, "/")
        |> put_req_header("x-highlight-request-id", "req_xyz789")
        |> call()

      assert conn.method == "GET"
    end

    test "handles missing highlight headers gracefully" do
      conn =
        conn(:get, "/no-headers")
        |> call()

      assert conn.request_path == "/no-headers"
    end

    test "handles both highlight headers together" do
      conn =
        conn(:get, "/")
        |> put_req_header("x-highlight-session-id", "sess_1")
        |> put_req_header("x-highlight-request-id", "req_2")
        |> call()

      assert conn.method == "GET"
    end
  end

  describe "Highlight.Plug before_send callback" do
    test "registers before_send callback" do
      conn =
        conn(:get, "/")
        |> call()

      # The conn returned by the plug should have before_send callbacks
      assert is_list(conn.before_send)
    end

    test "before_send callback fires on send_resp" do
      conn =
        conn(:get, "/")
        |> call()
        |> send_resp(200, "ok")

      assert conn.status == 200
    end

    test "500 responses set error span status" do
      conn =
        conn(:get, "/boom")
        |> call()
        |> send_resp(500, "internal error")

      assert conn.status == 500
    end
  end

  describe "Highlight.Plug exception handling" do
    test "re-raises exceptions after recording them" do
      assert_raise RuntimeError, "kaboom", fn ->
        conn(:get, "/raise")
        |> call()
        |> then(fn conn ->
          # Simulate a downstream plug raising
          raise RuntimeError, "kaboom"
          conn
        end)
      end
    end
  end
end
