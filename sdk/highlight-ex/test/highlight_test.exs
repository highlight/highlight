defmodule HighlightTest do
  use ExUnit.Case
  doctest Highlight

  test "records error with session_id, request_id, and stacktrace" do
    config = %Highlight.Config{
      project_id: "project_123",
      service_name: "phoenix-app",
      service_version: "1.0.0"
    }

    Highlight.init(config)

    try do
      raise RuntimeError, "unexpected error"
    rescue
      e ->
        Highlight.record_exception(e, config, "sess_abc", "req_xyz", __STACKTRACE__)
    end
  end

  test "parses x-highlight-request header cleanly" do
    assert Highlight.parse_highlight_header("sess_123/req_456") == {"sess_123", "req_456"}
    assert Highlight.parse_highlight_header("invalid") == {nil, nil}
    assert Highlight.parse_highlight_header(nil) == {nil, nil}
  end

  test "handles phoenix router_dispatch exception telemetry event" do
    config = %Highlight.Config{project_id: "project_123"}
    conn = %{req_headers: [{"x-highlight-request", "sess_99/req_88"}]}

    assert :ok ==
             Highlight.handle_phoenix_exception(
               [:phoenix, :router_dispatch, :exception],
               %{duration: 120},
               %{reason: %RuntimeError{message: "boom"}, stacktrace: [], conn: conn},
               config
             )
  end
end
