defmodule HighlightTest do
  use ExUnit.Case
  doctest Highlight

  @project_id "test-project-123"

  def config(overrides \\ []) do
    base = %Highlight.Config{
      project_id: @project_id,
      service_name: "test-service"
    }

    Enum.reduce(overrides, base, fn {k, v}, acc -> Map.put(acc, k, v) end)
  end

  describe "Highlight.Config" do
    test "requires project_id" do
      assert_raise ArgumentError, fn ->
        struct!(Highlight.Config, [])
      end
    end

    test "has sensible defaults" do
      cfg = %Highlight.Config{project_id: "p1"}
      assert cfg.otlp_endpoint == "https://otel.highlight.io:4318"
      assert cfg.service_name == nil
      assert cfg.service_version == nil
    end
  end

  describe "Highlight.init/1" do
    test "returns :ok and persists config" do
      cfg = config()
      assert :ok = Highlight.init(cfg)
      assert Application.get_env(:highlight, :config) == cfg
    end

    test "sets OTLP exporter endpoint" do
      cfg = %Highlight.Config{project_id: "p2", otlp_endpoint: "https://custom.endpoint:4318"}
      :ok = Highlight.init(cfg)
      assert Application.get_env(:opentelemetry_exporter, :otlp_endpoint) ==
               "https://custom.endpoint:4318"
    end

    test "uses default endpoint when not specified" do
      cfg = %Highlight.Config{project_id: "p3"}
      :ok = Highlight.init(cfg)
      assert Application.get_env(:opentelemetry_exporter, :otlp_endpoint) ==
               "https://otel.highlight.io:4318"
    end
  end

  describe "Highlight.config/0" do
    test "returns nil before init" do
      Application.delete_env(:highlight, :config)
      assert Highlight.config() == nil
    end

    test "returns config after init" do
      cfg = config()
      Highlight.init(cfg)
      assert Highlight.config() == cfg
    end
  end

  describe "Highlight.base_attributes/1" do
    test "includes required highlight attributes" do
      attrs = Highlight.base_attributes(config())
      attr_keys = Enum.map(attrs, fn {k, _} -> k end)
      assert :"highlight.project_id" in attr_keys
      assert :"telemetry.sdk.language" in attr_keys
    end

    test "includes service.name when provided" do
      attrs = Highlight.base_attributes(config(service_name: "my-app"))
      assert Enum.any?(attrs, fn {k, v} -> k == :"service.name" && v == "my-app" end)
    end

    test "omits service.name when nil" do
      attrs = Highlight.base_attributes(%Highlight.Config{project_id: "p"})
      refute Enum.any?(attrs, fn {k, _} -> k == :"service.name" end)
    end

    test "includes service.version when provided" do
      attrs = Highlight.base_attributes(config(service_version: "2.0.0"))
      assert Enum.any?(attrs, fn {k, v} -> k == :"service.version" && v == "2.0.0" end)
    end
  end

  describe "Highlight.record_exception/2" do
    setup do
      Highlight.init(config())
      :ok
    end

    test "records without session or request id" do
      assert :ok = Highlight.record_exception(RuntimeError.exception("oops"))
    end

    test "records with session_id" do
      assert :ok =
               Highlight.record_exception(
                 RuntimeError.exception("oops"),
                 session_id: "sess_abc"
               )
    end

    test "records with request_id" do
      assert :ok =
               Highlight.record_exception(
                 RuntimeError.exception("oops"),
                 request_id: "req_xyz"
               )
    end

    test "records with both session_id and request_id" do
      assert :ok =
               Highlight.record_exception(
                 RuntimeError.exception("oops"),
                 session_id: "sess_abc",
                 request_id: "req_xyz"
               )
    end

    test "accepts thrown terms" do
      assert :ok = Highlight.record_exception("a plain string error")
    end

    test "accepts explicit config via opts" do
      custom_cfg = %Highlight.Config{project_id: "custom", service_name: "custom-svc"}

      assert :ok =
               Highlight.record_exception(
                 ArgumentError.exception("bad arg"),
                 config: custom_cfg,
                 session_id: "s1"
               )
    end
  end
end
