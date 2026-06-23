defmodule Highlight.ConfigStoreTest do
  use ExUnit.Case, async: false

  alias Highlight.ConfigStore

  setup do
    on_exit(fn ->
      ConfigStore.clear()
    end)
  end

  test "returns nil when not initialized" do
    ConfigStore.clear()
    assert ConfigStore.get() == nil
  end

  test "initialized? returns false when not initialized" do
    ConfigStore.clear()
    refute ConfigStore.initialized?()
  end

  test "stores and retrieves config" do
    config = %Highlight.Config{
      project_id: "test-123",
      otlp_endpoint: "http://localhost:4318",
      service_name: "test-service",
      service_version: "1.0.0",
      environment: "test"
    }

    ConfigStore.put(config)
    assert ConfigStore.get() == config
    assert ConfigStore.initialized?()
  end

  test "clear removes config" do
    config = %Highlight.Config{
      project_id: "test-123",
      otlp_endpoint: "http://localhost:4318",
      service_name: "test-service",
      service_version: "1.0.0",
      environment: "test"
    }

    ConfigStore.put(config)
    assert ConfigStore.initialized?()

    ConfigStore.clear()
    refute ConfigStore.initialized?()
    assert ConfigStore.get() == nil
  end
end
