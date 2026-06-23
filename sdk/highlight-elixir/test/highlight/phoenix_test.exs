defmodule Highlight.PhoenixTest do
  use ExUnit.Case, async: false

  alias Highlight.ConfigStore
  alias Highlight.Phoenix

  setup do
    on_exit(fn ->
      ConfigStore.clear()
    end)
  end

  describe "parse_headers/1" do
    test "parses valid highlight request header" do
      headers = %{"x-highlight-request" => "session123/request456"}

      result = Phoenix.parse_headers(headers)
      assert result.session_id == "session123"
      assert result.request_id == "request456"
    end

    test "returns nil when header is missing" do
      result = Phoenix.parse_headers(%{})
      assert result == nil
    end

    test "returns nil when header format is invalid" do
      headers = %{"x-highlight-request" => "no-slash"}

      result = Phoenix.parse_headers(headers)
      assert result == nil
    end

    test "handles case-insensitive header lookup" do
      headers = %{"X-Highlight-Request" => "sid/rid"}

      result = Phoenix.parse_headers(headers)
      assert result.session_id == "sid"
      assert result.request_id == "rid"
    end

    test "returns nil for non-map input" do
      assert Phoenix.parse_headers(nil) == nil
      assert Phoenix.parse_headers("invalid") == nil
    end
  end
end
