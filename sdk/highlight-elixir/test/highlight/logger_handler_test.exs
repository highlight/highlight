defmodule Highlight.LoggerHandlerTest do
  use ExUnit.Case, async: false

  alias Highlight.ConfigStore
  alias Highlight.LoggerHandler

  setup do
    on_exit(fn ->
      LoggerHandler.detach()
      ConfigStore.clear()
    end)
  end

  describe "attach/0 and detach/0" do
    test "attaches and detaches handler" do
      assert :ok = LoggerHandler.attach()
      assert :ok = LoggerHandler.detach()
    end

    test "attach returns :ok when already attached" do
      assert :ok = LoggerHandler.attach()
      assert :ok = LoggerHandler.attach()
    end
  end
end
