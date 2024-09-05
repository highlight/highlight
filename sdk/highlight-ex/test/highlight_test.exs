defmodule HighlightTest do
  use ExUnit.Case
  doctest Highlight

  test "records error" do
    Highlight.init()

    try do
      throw("unexpected error")
    catch
      e ->
        config = %Highlight.Config{project_id: "project"}
        Highlight.record_exception(e, config)
    end
  end
end
