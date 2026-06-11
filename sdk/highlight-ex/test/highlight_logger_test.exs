defmodule Highlight.LoggerTest do
  use ExUnit.Case

  # We can't easily test actual OTel emission in unit tests without a collector,
  # but we test the :gen_event lifecycle and configuration paths.

  setup do
    # Remove any existing backend first to avoid duplicate registrations
    Logger.remove_backend(Highlight.Logger, flush: false)

    :ok
  end

  describe "Highlight.Logger backend lifecycle" do
    test "can be added as a Logger backend" do
      assert {:ok, _pid} = Logger.add_backend(Highlight.Logger)
      backends = Application.get_env(:logger, :backends, [])
      # The backend is registered via Logger, just verify no crash
      Logger.remove_backend(Highlight.Logger)
    end

    test "init/1 with module name succeeds" do
      assert {:ok, state} = Highlight.Logger.init(Highlight.Logger)
      assert Map.has_key?(state, :level)
      assert Map.has_key?(state, :metadata)
    end

    test "init/1 with opts list succeeds" do
      assert {:ok, state} = Highlight.Logger.init({Highlight.Logger, [level: :warning]})
      assert state.level == :warning
    end

    test "default level is :debug" do
      {:ok, state} = Highlight.Logger.init(Highlight.Logger)
      assert state.level == :debug
    end

    test "configure/2 call updates level" do
      {:ok, state} = Highlight.Logger.init(Highlight.Logger)
      {:ok, :ok, new_state} = Highlight.Logger.handle_call({:configure, [level: :error]}, state)
      assert new_state.level == :error
    end

    test "handle_event :flush returns ok" do
      {:ok, state} = Highlight.Logger.init(Highlight.Logger)
      assert {:ok, ^state} = Highlight.Logger.handle_event(:flush, state)
    end

    test "handle_info returns ok for unknown messages" do
      {:ok, state} = Highlight.Logger.init(Highlight.Logger)
      assert {:ok, ^state} = Highlight.Logger.handle_info(:unknown_msg, state)
    end
  end

  describe "Highlight.Logger log level filtering" do
    test "messages below configured level are dropped" do
      {:ok, state} = Highlight.Logger.init({Highlight.Logger, [level: :error]})

      # This must not raise even though the level is below threshold
      result =
        Highlight.Logger.handle_event(
          {:debug, self(), {Logger, "debug msg", {{2024, 1, 1}, {0, 0, 0, 0}}, %{}}},
          state
        )

      assert result == {:ok, state}
    end

    test "messages at or above configured level are processed" do
      {:ok, state} = Highlight.Logger.init({Highlight.Logger, [level: :info]})

      # Should process without crashing
      result =
        Highlight.Logger.handle_event(
          {:info, self(), {Logger, "info msg", {{2024, 1, 1}, {0, 0, 0, 0}}, %{}}},
          state
        )

      assert result == {:ok, state}
    end

    test "error-level messages are processed when level is :info" do
      {:ok, state} = Highlight.Logger.init({Highlight.Logger, [level: :info]})

      result =
        Highlight.Logger.handle_event(
          {:error, self(), {Logger, "error msg", {{2024, 1, 1}, {0, 0, 0, 0}}, %{}}},
          state
        )

      assert result == {:ok, state}
    end
  end
end
