defmodule Highlight.LiveViewTest do
  use ExUnit.Case

  test "records error manually using recordException alias" do
    config = %Highlight.Config{project_id: "test_project"}

    try do
      raise RuntimeError, message: "manually captured exception"
    rescue
      e ->
        Highlight.recordException(e, config, "session_abc", "request_xyz")
    end
  end

  test "attaches Phoenix LiveView telemetry and intercepts live_view handle_event exception" do
    config = %Highlight.Config{project_id: "proj_123", service_name: "my_app"}
    Highlight.LiveView.attach(config)

    fake_socket = %{
      id: "phx-F123",
      view: MyAppWeb.UserLive,
      assigns: %{highlight_session_id: "session_live_999"}
    }

    metadata = %{
      socket: fake_socket,
      kind: :error,
      reason: %RuntimeError{message: "LiveView button crash"},
      stacktrace: [],
      event: "click_save",
      params: %{"user_id" => "42"}
    }

    # Emit telemetry event mimicking Phoenix LiveView handle_event exception
    :telemetry.execute(
      [:phoenix, :live_view, :handle_event, :exception],
      %{duration: 120_000},
      metadata
    )
  end

  test "intercepts live_view mount exception" do
    config = %Highlight.Config{project_id: "proj_mount"}
    Highlight.LiveView.attach(config)

    fake_socket = %{
      id: "phx-M456",
      view: MyAppWeb.DashboardLive,
      assigns: %{}
    }

    metadata = %{
      socket: fake_socket,
      kind: :error,
      reason: %ArgumentError{message: "Bad mount argument"},
      stacktrace: [],
      params: %{}
    }

    # Emit telemetry event mimicking Phoenix LiveView mount exception
    :telemetry.execute(
      [:phoenix, :live_view, :mount, :exception],
      %{duration: 50_000},
      metadata
    )
  end

  test "Highlight.init with live_view option attaches LiveView instrumentation" do
    config = %Highlight.Config{project_id: "proj_init_all"}
    Highlight.init(config, live_view: true)

    handlers = :telemetry.list_handlers([:phoenix, :live_view, :handle_event, :exception])
    assert Enum.any?(handlers, fn h -> h.id == "highlight-phoenix-live_view-handle_event-exception" end)
  end
end
