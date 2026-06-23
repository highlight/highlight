defmodule Highlight.TracerTest do
  use ExUnit.Case, async: false

  alias Highlight.ConfigStore
  alias Highlight.Tracer

  setup do
    on_exit(fn ->
      ConfigStore.clear()
    end)
  end

  describe "record_exception/2" do
    test "records exception with default attributes" do
      ConfigStore.put(%Highlight.Config{
        project_id: "test",
        otlp_endpoint: "https://otel.highlight.io:4318",
        service_name: "test-app",
        service_version: "",
        environment: "test"
      })

      exception = %RuntimeError{message: "test error"}

      # This should not raise even without an active span
      assert :ok = Tracer.record_exception(exception)
    end

    test "records exception with custom attributes" do
      ConfigStore.put(%Highlight.Config{
        project_id: "test",
        otlp_endpoint: "https://otel.highlight.io:4318",
        service_name: "test-app",
        service_version: "",
        environment: "test"
      })

      exception = %RuntimeError{message: "test error"}
      attributes = %{"user.id" => "123", "component" => "auth"}

      assert :ok = Tracer.record_exception(exception, attributes)
    end
  end

  describe "record_exception_in_new_span/2" do
    test "records exception in a new span" do
      ConfigStore.put(%Highlight.Config{
        project_id: "test",
        otlp_endpoint: "https://otel.highlight.io:4318",
        service_name: "test-app",
        service_version: "",
        environment: "test"
      })

      exception = %RuntimeError{message: "test error"}

      assert :ok = Tracer.record_exception_in_new_span(exception)
    end
  end

  describe "record_log/3" do
    test "records a log message" do
      ConfigStore.put(%Highlight.Config{
        project_id: "test",
        otlp_endpoint: "https://otel.highlight.io:4318",
        service_name: "test-app",
        service_version: "",
        environment: "test"
      })

      assert :ok = Tracer.record_log(:info, "test log message")
    end

    test "records a log with attributes" do
      ConfigStore.put(%Highlight.Config{
        project_id: "test",
        otlp_endpoint: "https://otel.highlight.io:4318",
        service_name: "test-app",
        service_version: "",
        environment: "test"
      })

      assert :ok =
               Tracer.record_log(:error, "failed", %{"component" => "db"})
    end
  end
end
