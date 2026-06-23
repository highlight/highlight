defmodule HighlightTest do
  use ExUnit.Case, async: false

  alias Highlight.ConfigStore

  setup do
    on_exit(fn ->
      ConfigStore.clear()
    end)
  end

  describe "init/1" do
    test "raises ArgumentError when no project_id is provided" do
      System.delete_env("HIGHLIGHT_PROJECT_ID")

      assert_raise ArgumentError, fn ->
        Highlight.init()
      end
    end

    test "initializes with project_id from opts" do
      assert :ok = Highlight.init(project_id: "test-project-123")

      config = ConfigStore.get()
      assert config.project_id == "test-project-123"
      assert config.otlp_endpoint == "https://otel.highlight.io:4318"
    end

    test "initializes with project_id from environment variable" do
      System.put_env("HIGHLIGHT_PROJECT_ID", "env-project-456")

      assert :ok = Highlight.init()

      config = ConfigStore.get()
      assert config.project_id == "env-project-456"

      System.delete_env("HIGHLIGHT_PROJECT_ID")
    end

    test "accepts custom options" do
      assert :ok =
               Highlight.init(
                 project_id: "custom",
                 service_name: "my-service",
                 service_version: "1.0.0",
                 environment: "production",
                 otlp_endpoint: "http://localhost:4318",
                 instrument_logging: false
               )

      config = ConfigStore.get()
      assert config.project_id == "custom"
      assert config.service_name == "my-service"
      assert config.service_version == "1.0.0"
      assert config.environment == "production"
      assert config.otlp_endpoint == "http://localhost:4318"
      assert config.instrument_logging == false
    end
  end

  describe "record_exception/2" do
    test "records an exception" do
      Highlight.init(project_id: "test")

      exception = %RuntimeError{message: "test error"}
      assert :ok = Highlight.record_exception(exception)
    end

    test "records an exception with attributes" do
      Highlight.init(project_id: "test")

      exception = %RuntimeError{message: "test error"}

      assert :ok =
               Highlight.record_exception(exception,
                 attributes: %{"user.id" => "123"}
               )
    end
  end

  describe "log/2 and log/3" do
    test "logs a message" do
      Highlight.init(project_id: "test")
      assert :ok = Highlight.log(:info, "test message")
    end

    test "logs a message with attributes" do
      Highlight.init(project_id: "test")
      assert :ok = Highlight.log(:error, "something failed", %{"component" => "db"})
    end
  end

  describe "shutdown/0" do
    test "shuts down gracefully" do
      Highlight.init(project_id: "test")
      assert :ok = Highlight.shutdown()
      assert ConfigStore.get() == nil
    end
  end

  describe "flush/0" do
    test "flushes without error" do
      Highlight.init(project_id: "test")
      assert :ok = Highlight.flush()
    end
  end
end
